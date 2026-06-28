'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Page } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { Markdown } from '@/components/site/markdown'
import { Button } from '@/components/ui/button'
import { ChevronRight, FileText } from 'lucide-react'

export function PageView({ slug }: { slug: string }) {
  const { navigate } = useApp()
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.pages.getBySlug(slug).then(({ page }) => {
      if (active) { setPage(page); setLoading(false) }
    }).catch(() => { if (active) { setPage(null); setLoading(false) } })
    return () => { active = false }
  }, [slug])

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20"><div className="h-40 animate-pulse rounded bg-muted mb-6" /><div className="h-6 animate-pulse rounded bg-muted mb-3" /><div className="h-6 animate-pulse rounded bg-muted w-3/4" /></div>
  }

  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-32 text-center">
        <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
        <p className="font-display text-3xl font-semibold">Page not found</p>
        <Button className="mt-6" onClick={() => navigate({ name: 'home' })}>Back home</Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-16">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <button onClick={() => navigate({ name: 'home' })} className="hover:text-foreground">Home</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{page.title}</span>
          </nav>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">{page.title}</h1>
          {page.excerpt && <p className="mt-3 text-lg text-muted-foreground">{page.excerpt}</p>}
        </div>
      </section>

      {/* Content */}
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-16">
        <Markdown content={page.content} />
      </article>
    </div>
  )
}
