'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { DigitalProduct } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { BookOpen, ExternalLink, Tag, Sparkles } from 'lucide-react'

/**
 * Sidebar widget showing featured digital product offers (ebooks, courses, etc.)
 */
export function ProductsWidget({ limit = 2, title = 'Featured Offers' }: { limit?: number; title?: string }) {
  const { openProduct } = useApp()
  const [products, setProducts] = useState<DigitalProduct[]>([])

  useEffect(() => {
    let active = true
    api.products.list({ featured: true }).then(({ products }) => {
      if (active) setProducts(products.slice(0, limit))
    }).catch(() => {})
    return () => { active = false }
  }, [limit])

  if (products.length === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-foreground text-background">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {products.map((p) => (
          <div key={p.id} className="p-4 hover:bg-accent/30 transition-colors">
            <button onClick={() => openProduct(p.slug)} className="flex gap-3 text-left w-full group">
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                {p.coverImage && <img src={p.coverImage} alt={p.coverAlt || p.title} className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-primary font-medium">{p.category || 'Digital'}</p>
                <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">{p.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{p.price}</span>
                  {p.originalPrice && <span className="text-xs text-muted-foreground line-through">{p.originalPrice}</span>}
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-border bg-secondary/30">
        <button onClick={() => useApp.getState().navigate({ name: 'shop' })} className="text-xs text-primary hover:underline font-medium">
          Browse all products →
        </button>
      </div>
    </div>
  )
}
