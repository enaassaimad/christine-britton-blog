import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publishDueScheduledPosts } from '@/lib/scheduler'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  // Auto-publish any scheduled posts whose time has come
  await publishDueScheduledPosts()

  const post = await db.post.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, avatar: true, bio: true } },
      category: true,
      comments: { where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' } },
    },
  })
  if (!post || post.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // increment views
  await db.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } })

  // related posts (same category, exclude current)
  const related = await db.post.findMany({
    where: { categoryId: post.categoryId, status: 'PUBLISHED', id: { not: post.id } },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    include: { author: { select: { name: true, avatar: true } }, category: true },
  })

  // Parse affiliate links from JSON string
  let affiliateLinks: any[] = []
  if (post.affiliateLinks) {
    try { affiliateLinks = JSON.parse(post.affiliateLinks) } catch {}
  }

  return NextResponse.json({ post: { ...post, views: post.views + 1, affiliateLinks }, related })
}
