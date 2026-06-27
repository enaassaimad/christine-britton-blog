'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { DigitalProduct } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { AdSlot } from '@/components/site/ad-slot'
import { Newsletter } from '@/components/site/newsletter'
import { Button } from '@/components/ui/button'
import { BookOpen, ExternalLink, Check, ArrowRight, Sparkles } from 'lucide-react'

export function ShopView() {
  const { openProduct } = useApp()
  const [products, setProducts] = useState<DigitalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('ALL')

  useEffect(() => {
    let active = true
    api.products.list().then(({ products }) => {
      if (active) { setProducts(products); setLoading(false) }
    }).catch(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)) as string[])]
  const filtered = category === 'ALL' ? products : products.filter((p) => p.category === category)

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-wider text-primary mb-4">
            <BookOpen className="h-3 w-3" /> Digital Shop
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight">Ebooks, Courses & Creative Resources</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Carefully crafted digital products to support your creative journey — from fluid art handbooks to printable pattern packs.
          </p>
        </div>
      </section>

      {/* Filter */}
      <div className="mx-auto max-w-7xl px-6 pt-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${category === c ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:text-foreground'}`}
            >
              {c === 'ALL' ? 'All products' : c.charAt(0).toUpperCase() + c.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center"><p className="font-display text-2xl font-semibold">No products yet</p><p className="text-muted-foreground mt-2">Check back soon for new resources.</p></div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card cursor-pointer transition-all hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5"
                onClick={() => openProduct(p.slug)}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {p.coverImage ? (
                    <img src={p.coverImage} alt={p.coverAlt || p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground/40"><BookOpen className="h-8 w-8" /></div>
                  )}
                  {p.featured && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-foreground text-background px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" /> Featured
                    </span>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-card/90 backdrop-blur px-2.5 py-1 text-xs font-semibold text-primary">{p.price}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {p.category && <span className="text-[11px] uppercase tracking-wider text-primary font-medium mb-1">{p.category}</span>}
                  <h3 className="font-display text-xl font-semibold leading-snug tracking-tight group-hover:text-primary transition-colors">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">{p.excerpt}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Ad */}
      <section className="mx-auto max-w-3xl px-6 mb-16">
        <AdSlot slot="inArticle" label="Advertisement" />
      </section>

      <Newsletter />
    </div>
  )
}
