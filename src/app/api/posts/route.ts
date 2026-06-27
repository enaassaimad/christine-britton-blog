import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { slugify, estimateReadTime, excerptFromContent } from '@/lib/helpers'
import { publishDueScheduledPosts } from '@/lib/scheduler'

// Public: list published posts. Admin: can filter by status.
export async function GET(req: NextRequest) {
  // Auto-publish any scheduled posts whose time has come
  await publishDueScheduledPosts()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') // PUBLISHED | DRAFT | SCHEDULED | ALL
  const category = searchParams.get('category') // slug
  const tag = searchParams.get('tag')
  const featured = searchParams.get('featured')
  const trending = searchParams.get('trending')
  const search = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const authorId = searchParams.get('authorId')

  const user = await getCurrentUser()
  const isAdmin = !!user

  const where: any = {}
  if (!isAdmin || status !== 'ALL') {
    where.status = status && status !== 'ALL' ? status : 'PUBLISHED'
  } else if (status === 'ALL' && isAdmin) {
    // no status filter
  }
  if (category) {
    where.category = { slug: category }
  }
  if (tag) {
    where.tags = { contains: tag }
  }
  if (featured === 'true') where.featured = true
  if (trending === 'true') where.trending = true
  if (authorId) where.authorId = authorId
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { content: { contains: search } },
      { tags: { contains: search } },
    ]
  }

  const [total, posts] = await Promise.all([
    db.post.count({ where }),
    db.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: true,
        _count: { select: { comments: { where: { status: 'APPROVED' } } } },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({ posts, total, page, limit, totalPages: Math.ceil(total / limit) })
}

// Admin: create post
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, excerpt, content, coverImage, coverAlt, status, featured, trending, tags, categoryId, metaTitle, metaDescription, showAds, publishedAt, affiliateLinks } = body

  if (!title || !content || !categoryId) {
    return NextResponse.json({ error: 'Title, content and category are required' }, { status: 400 })
  }

  const finalStatus = ['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(status) ? status : 'DRAFT'

  let slug = slugify(body.slug || title)
  const existing = await db.post.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const finalExcerpt = excerpt || excerptFromContent(content)
  const readMinutes = estimateReadTime(content)

  // Resolve publishedAt based on status
  let resolvedPublishedAt: Date | null = null
  const providedDate = publishedAt ? new Date(publishedAt) : null
  if (finalStatus === 'PUBLISHED') {
    resolvedPublishedAt = providedDate && providedDate <= new Date() ? providedDate : new Date()
  } else if (finalStatus === 'SCHEDULED') {
    // Scheduled posts MUST have a future publishedAt; if none provided, default to +1h
    resolvedPublishedAt = providedDate || new Date(Date.now() + 60 * 60 * 1000)
  } else {
    // DRAFT
    resolvedPublishedAt = providedDate
  }

  // SCHEDULED sanity: if scheduled date is in the past, treat as published now
  if (finalStatus === 'SCHEDULED' && resolvedPublishedAt <= new Date()) {
    resolvedPublishedAt = new Date()
  }

  const post = await db.post.create({
    data: {
      title,
      slug,
      excerpt: finalExcerpt,
      content,
      coverImage,
      coverAlt,
      status: finalStatus,
      featured: !!featured,
      trending: !!trending,
      tags: tags || null,
      categoryId,
      authorId: user.id,
      metaTitle,
      metaDescription,
      showAds: showAds !== false,
      affiliateLinks: affiliateLinks ? JSON.stringify(affiliateLinks) : null,
      publishedAt: resolvedPublishedAt,
      readMinutes,
    },
    include: { author: { select: { id: true, name: true, avatar: true } }, category: true },
  })

  return NextResponse.json({ post }, { status: 201 })
}
