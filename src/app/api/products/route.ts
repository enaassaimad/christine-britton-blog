import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// Public: list products. Optional ?featured=true
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const featured = searchParams.get('featured')
  const category = searchParams.get('category')
  const where: any = {}
  if (featured === 'true') where.featured = true
  if (category) where.category = category
  const products = await db.digitalProduct.findMany({
    where,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ products })
}

// Admin: create product
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { title, slug, excerpt, description, coverImage, coverAlt, price, originalPrice, buyUrl, buyLabel, category, featured, tags, order } = body
  if (!title || !description || !buyUrl) return NextResponse.json({ error: 'Title, description and buy URL are required' }, { status: 400 })
  let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const existing = await db.digitalProduct.findUnique({ where: { slug: finalSlug } })
  if (existing) finalSlug = `${finalSlug}-${Date.now().toString(36)}`
  const product = await db.digitalProduct.create({
    data: { title, slug: finalSlug, excerpt, description, coverImage, coverAlt, price: price || 'Free', originalPrice, buyUrl, buyLabel: buyLabel || 'Buy now', category, featured: !!featured, tags, order: order || 0 },
  })
  return NextResponse.json({ product }, { status: 201 })
}
