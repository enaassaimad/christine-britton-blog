'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { DigitalProduct } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { BookOpen, ExternalLink } from 'lucide-react'

interface Props {
  limit?: number
  title?: string
  /** Render as a compact sidebar stack (vertical book covers + promo text). */
  variant?: 'sidebar' | 'inline'
}

/**
 * Sidebar widget showing featured digital product offers (ebooks, courses, etc.)
 * In the "sidebar" variant, each product is a vertical book-cover card with
 * a short promotional line beneath — the whole card is the call to action.
 */
export function ProductsWidget({ limit = 2, title = 'Featured Offers', variant = 'sidebar' }: Props) {
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

  // Inline variant (used inside content grids) — compact horizontal cards
  if (variant === 'inline') {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-foreground text-background">
          <BookOpen className="h-4 w-4 text-primary" />
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

  // Sidebar variant — book-cover hero with shadow + promo text + CTA button
  return (
    <div className="space-y-6">
      {products.map((p) => (
        <div key={p.id} className="rounded-2xl bg-card p-5 shadow-sm border border-border/40">
          {/* Book cover — portrait 2:3 with realistic book shadow */}
          <button onClick={() => openProduct(p.slug)} className="block w-full group">
            <div className="relative mx-auto" style={{ maxWidth: '220px' }}>
              <div className="book-cover relative aspect-[2/3] overflow-hidden rounded-md bg-muted">
                {p.coverImage ? (
                  <img
                    src={p.coverImage}
                    alt={p.coverAlt || p.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
                    <BookOpen className="h-10 w-10" />
                  </div>
                )}
                {p.originalPrice && (
                  <span className="absolute right-2 top-2 rounded-full bg-destructive text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider z-10">
                    Sale
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Promotional text + CTA */}
          <div className="mt-5 text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-semibold mb-1.5">
              {p.category === 'ebook' ? "Christine's New Ebook" : p.category === 'course' ? 'Video Course' : p.category === 'book' ? 'New Book' : 'Featured Product'}
            </p>
            <p className="font-display text-lg font-semibold leading-snug">{p.title}</p>
            {p.excerpt && <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{p.excerpt}</p>}
            <div className="mt-3 flex items-center justify-center gap-2">
              {p.price && <span className="text-base font-bold text-foreground">{p.price}</span>}
              {p.originalPrice && <span className="text-sm text-muted-foreground line-through">{p.originalPrice}</span>}
            </div>
            <a
              href={p.buyUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={(e) => e.stopPropagation()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {p.buyLabel} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
