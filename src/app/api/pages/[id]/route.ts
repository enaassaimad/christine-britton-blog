import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const existing = await db.page.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const data: any = {}
  for (const k of ['title', 'content', 'excerpt', 'type', 'order']) if (k in body) data[k] = body[k]
  if ('showInFooter' in body) data.showInFooter = !!body.showInFooter
  if (body.slug && body.slug !== existing.slug) {
    let slug = body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const conflict = await db.page.findUnique({ where: { slug } })
    if (conflict && conflict.id !== id) slug = `${slug}-${Date.now().toString(36)}`
    data.slug = slug
  }
  const page = await db.page.update({ where: { id }, data })
  return NextResponse.json({ page })
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await db.page.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
