import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// Public: list pages (for footer + nav). Admin: all pages.
export async function GET() {
  const user = await getCurrentUser()
  const pages = await db.page.findMany({
    orderBy: [{ order: 'asc' }, { title: 'asc' }],
  })
  // Public visitors only see pages (all pages are public; admin sees edit metadata)
  return NextResponse.json({ pages: pages.map((p) => ({ ...p, content: user ? p.content : p.content })) })
}

// Admin: create page
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { title, slug, content, excerpt, type, showInFooter, order } = body
  if (!title || !content) return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const existing = await db.page.findUnique({ where: { slug: finalSlug } })
  if (existing) finalSlug = `${finalSlug}-${Date.now().toString(36)}`
  const page = await db.page.create({
    data: { title, slug: finalSlug, content, excerpt, type: type || 'LEGAL', showInFooter: showInFooter !== false, order: order || 0 },
  })
  return NextResponse.json({ page }, { status: 201 })
}
