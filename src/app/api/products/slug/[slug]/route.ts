import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const product = await db.digitalProduct.findUnique({ where: { slug } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // related products (same category, exclude current)
  const related = await db.digitalProduct.findMany({
    where: { category: product.category, id: { not: product.id } },
    take: 3,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ product, related })
}
