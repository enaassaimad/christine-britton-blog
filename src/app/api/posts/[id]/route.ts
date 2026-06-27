import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { slugify, estimateReadTime, excerptFromContent } from '@/lib/helpers'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await getCurrentUser()
  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, avatar: true, bio: true } },
      category: true,
      comments: { where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' } },
    },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (post.status !== 'PUBLISHED' && !user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  // Parse affiliate links for the editor
  let affiliateLinks: any[] = []
  if (post.affiliateLinks) {
    try { affiliateLinks = JSON.parse(post.affiliateLinks) } catch {}
  }
  return NextResponse.json({ post: { ...post, affiliateLinks } })
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const existing = await db.post.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: any = {}
  for (const key of ['title', 'excerpt', 'content', 'coverImage', 'coverAlt', 'tags', 'categoryId', 'metaTitle', 'metaDescription']) {
    if (key in body) data[key] = body[key]
  }
  if ('status' in body) {
    data.status = ['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(body.status) ? body.status : 'DRAFT'
  }
  if ('featured' in body) data.featured = !!body.featured
  if ('trending' in body) data.trending = !!body.trending
  if ('showAds' in body) data.showAds = body.showAds !== false
  if ('affiliateLinks' in body) {
    data.affiliateLinks = body.affiliateLinks ? JSON.stringify(body.affiliateLinks) : null
  }

  if (body.slug && body.slug !== existing.slug) {
    let slug = slugify(body.slug)
    const conflict = await db.post.findUnique({ where: { slug } })
    if (conflict && conflict.id !== id) slug = `${slug}-${Date.now().toString(36)}`
    data.slug = slug
  }
  if (data.title && !data.slug) {
    data.slug = existing.slug
  }
  if (body.content && body.content !== existing.content) {
    data.readMinutes = estimateReadTime(body.content)
    if (!body.excerpt) data.excerpt = excerptFromContent(body.content)
  }

  // Resolve publishedAt based on status transitions
  const newStatus = data.status || existing.status
  const providedDate = body.publishedAt ? new Date(body.publishedAt) : null
  if (newStatus === 'PUBLISHED') {
    if (providedDate && providedDate <= new Date()) {
      data.publishedAt = providedDate
    } else if (!existing.publishedAt || existing.status !== 'PUBLISHED') {
      data.publishedAt = new Date()
    } else if (providedDate) {
      data.publishedAt = providedDate
    }
  } else if (newStatus === 'SCHEDULED') {
    data.publishedAt = providedDate || existing.publishedAt || new Date(Date.now() + 60 * 60 * 1000)
    // If scheduled date is already in the past, bump to now+1h to keep it scheduled
    if (data.publishedAt <= new Date()) {
      data.publishedAt = new Date(Date.now() + 60 * 60 * 1000)
    }
  } else if (newStatus === 'DRAFT') {
    if (providedDate) data.publishedAt = providedDate
  }

  const post = await db.post.update({
    where: { id },
    data,
    include: { author: { select: { id: true, name: true, avatar: true } }, category: true },
  })
  return NextResponse.json({ post })
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await db.post.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
