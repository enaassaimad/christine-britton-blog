import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const product = await db.digitalProduct.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const existing = await db.digitalProduct.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const data: any = {}
  for (const k of ['title', 'excerpt', 'description', 'coverImage', 'coverAlt', 'price', 'originalPrice', 'buyUrl', 'buyLabel', 'category', 'tags', 'order']) if (k in body) data[k] = body[k]
  if ('featured' in body) data.featured = !!body.featured
  if (body.slug && body.slug !== existing.slug) {
    let slug = body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const conflict = await db.digitalProduct.findUnique({ where: { slug } })
    if (conflict && conflict.id !== id) slug = `${slug}-${Date.now().toString(36)}`
    data.slug = slug
  }
  const product = await db.digitalProduct.update({ where: { id }, data })
  return NextResponse.json({ product })
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await db.digitalProduct.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
