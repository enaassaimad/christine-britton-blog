'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { DigitalProduct } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { Markdown } from '@/components/site/markdown'
import { AdSlot } from '@/components/site/ad-slot'
import { ProductsWidget } from '@/components/site/products-widget'
import { Newsletter } from '@/components/site/newsletter'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Check, ExternalLink, ShieldCheck, Download, Clock, BookOpen, ChevronRight } from 'lucide-react'

export function ProductView({ slug }: { slug: string }) {
  const { navigate, openProduct } = useApp()
  const [product, setProduct] = useState<DigitalProduct | null>(null)
  const [related, setRelated] = useState<DigitalProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.products.getBySlug(slug).then(({ product, related }) => {
      if (active) { setProduct(product); setRelated(related); setLoading(false) }
    }).catch(() => { if (active) { setProduct(null); setLoading(false) } })
    return () => { active = false }
  }, [slug])

  if (loading) {
    return <div className="mx-auto max-w-5xl px-6 py-20"><div className="h-80 animate-pulse rounded-2xl bg-muted" /></div>
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="font-display text-3xl font-semibold">Product not found</p>
        <Button className="mt-6" onClick={() => navigate({ name: 'shop' })}>Back to shop</Button>
      </div>
    )
  }

  const features = [
    { icon: Download, text: 'Instant download after purchase' },
    { icon: ShieldCheck, text: 'Secure checkout via trusted provider' },
    { icon: Clock, text: 'Lifetime access — yours to keep' },
  ]

  return (
    <div className="animate-fade-up">
      {/* Breadcrumb */}
      <nav className="mx-auto max-w-7xl px-6 pt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <button onClick={() => navigate({ name: 'home' })} className="hover:text-foreground">Home</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate({ name: 'shop' })} className="hover:text-foreground">Shop</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate">{product.title}</span>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-10 lg:grid-cols-12">
        {/* Main */}
        <div className="lg:col-span-8">
          {/* Cover + buy box — book hero layout */}
          <div className="grid gap-8 md:grid-cols-2 items-start">
            {/* Book cover with realistic shadow */}
            <div className="flex justify-center md:justify-start">
              <div className="relative" style={{ maxWidth: '320px', width: '100%' }}>
                <div className="book-cover relative aspect-[2/3] overflow-hidden rounded-md bg-muted">
                  {product.coverImage ? (
                    <img src={product.coverImage} alt={product.coverAlt || product.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground/40"><BookOpen className="h-12 w-12" /></div>
                  )}
                  {product.featured && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-foreground text-background px-3 py-1 text-xs font-medium uppercase tracking-wider z-10">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Buy box */}
            <div>
              {product.category && <Badge variant="secondary" className="mb-3 capitalize">{product.category}</Badge>}
              <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight tracking-tight">{product.title}</h1>
              <p className="mt-3 text-lg text-muted-foreground">{product.excerpt}</p>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold text-primary">{product.price}</span>
                {product.originalPrice && <span className="text-lg text-muted-foreground line-through">{product.originalPrice}</span>}
              </div>

              <Button asChild size="lg" className="mt-6 w-full">
                <a href={product.buyUrl} target="_blank" rel="noopener noreferrer sponsored">
                  <ExternalLink className="h-4 w-4 mr-2" /> {product.buyLabel}
                </a>
              </Button>

              <div className="mt-6 space-y-2.5">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <f.icon className="h-4 w-4 text-primary shrink-0" />
                    {f.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-12">
              <h2 className="font-display text-2xl font-semibold mb-4">About this product</h2>
              <Markdown content={product.description} />
            </div>
          )}

          {/* Ad */}
          <div className="my-10">
            <AdSlot slot="inArticle" label="Advertisement" />
          </div>

          {/* Final CTA */}
          <div className="mt-8 rounded-2xl bg-foreground text-background p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-display text-2xl font-semibold">Ready to start?</p>
              <p className="text-background/70 text-sm mt-1">Get instant access to {product.title}.</p>
            </div>
            <Button asChild size="lg" variant="secondary">
              <a href={product.buyUrl} target="_blank" rel="noopener noreferrer sponsored">
                {product.buyLabel} — {product.price}
              </a>
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <AdSlot slot="sidebar" />
          {related.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-lg font-semibold mb-4">You might also like</h3>
              <div className="space-y-4">
                {related.map((r) => (
                  <button key={r.id} onClick={() => openProduct(r.slug)} className="flex gap-3 text-left w-full group">
                    <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted shadow-md">
                      {r.coverImage && <img src={r.coverImage} alt={r.coverAlt || r.title} className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">{r.title}</p>
                      <p className="text-sm font-semibold text-primary mt-1">{r.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <Newsletter />
    </div>
  )
}
