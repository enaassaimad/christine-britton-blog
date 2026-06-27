'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Post, Category, User } from '@/lib/types'
import { PostCard } from '@/components/site/post-card'
import { AdSlot } from '@/components/site/ad-slot'
import { Newsletter } from '@/components/site/newsletter'
import { useApp } from '@/store/app-store'
import { CategoryIcon } from '@/lib/category-icons'
import { Button } from '@/components/ui/button'
import { ArrowRight, Flame, Sparkles, Clock } from 'lucide-react'
import { formatShortDate } from '@/lib/helpers'

type P = Post & { author: User; category: Category; _count?: { comments: number } }

export function HomeView() {
  const { openPost, openCategory, navigate } = useApp()
  const [featured, setFeatured] = useState<P[]>([])
  const [trending, setTrending] = useState<P[]>([])
  const [latest, setLatest] = useState<P[]>([])
  const [categories, setCategories] = useState<(Category & { _count?: { posts: number } })[]>([])
  const [editorsPick, setEditorsPick] = useState<P | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.posts.list({ featured: true, limit: 3 }),
      api.posts.list({ trending: true, limit: 5 }),
      api.posts.list({ limit: 7 }),
      api.categories.list(),
    ]).then(([f, t, l, c]) => {
      setFeatured(f.posts)
      setTrending(t.posts)
      // editors pick: most viewed among latest
      const pick = [...l.posts].sort((a, b) => b.views - a.views)[0]
      setEditorsPick(pick || null)
      setLatest(l.posts.filter((p) => p.id !== pick?.id).slice(0, 6))
      setCategories(c.categories)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="h-80 animate-pulse rounded-2xl bg-muted" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      </div>
    )
  }

  const hero = featured[0]
  const sideFeatured = featured.slice(1, 3)

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 md:pt-12">
        <div className="grid gap-6 lg:grid-cols-12">
          {hero && (
            <div className="lg:col-span-8">
              <PostCard post={hero} variant="featured" className="h-full" />
            </div>
          )}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {sideFeatured.map((p) => (
              <PostCard key={p.id} post={p} variant="overlay" className="flex-1" />
            ))}
            {sideFeatured.length === 0 && (
              <div className="flex-1 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground text-sm">
                More stories coming soon.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Header ad */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-10">
        <AdSlot slot="header" label="Sponsored" />
      </section>

      {/* Trending ticker */}
      {trending.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-12">
          <div className="flex items-center gap-3 mb-5">
            <Flame className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Trending now</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trending.slice(0, 3).map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* Categories showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-10 md:mt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Browse by</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Topics & Categories</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate({ name: 'blog' })} className="hidden md:inline-flex">
            All articles <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            return (
              <button
                key={c.id}
                onClick={() => openCategory(c.slug)}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 text-left transition-all hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                  style={{ backgroundColor: `${c.color || '#b45309'}1a`, color: c.color || '#b45309' }}
                >
                  <CategoryIcon name={c.icon} className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {c._count?.posts || 0} {(c._count?.posts || 0) === 1 ? 'article' : 'articles'}
                </p>
                <ArrowRight className="absolute right-5 top-5 h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
            )
          })}
        </div>
      </section>

      {/* Editor's pick + sidebar ad */}
      {editorsPick && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-10 md:mt-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-5">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">Editor's pick</h2>
              </div>
              <article
                className="group grid gap-6 md:grid-cols-2 cursor-pointer rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all"
                onClick={() => openPost(editorsPick.slug)}
              >
                <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-muted">
                  {editorsPick.coverImage && (
                    <img src={editorsPick.coverImage} alt={editorsPick.coverAlt || editorsPick.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                </div>
                <div className="flex flex-col justify-center p-6 md:p-8">
                  <span className="text-xs uppercase tracking-wider text-primary font-medium">{editorsPick.category.name}</span>
                  <h3 className="mt-2 font-display text-2xl md:text-3xl font-semibold leading-tight tracking-tight group-hover:text-primary transition-colors">
                    {editorsPick.title}
                  </h3>
                  <p className="mt-3 text-muted-foreground line-clamp-3">{editorsPick.excerpt}</p>
                  <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
                        {editorsPick.author.name.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">{editorsPick.author.name}</span>
                    </div>
                    <span>•</span>
                    <span>{formatShortDate(editorsPick.publishedAt || editorsPick.createdAt)}</span>
                  </div>
                </div>
              </article>
            </div>
            <aside className="lg:col-span-4 space-y-6">
              <AdSlot slot="sidebar" />
              {trending.slice(3, 5).map((p) => (
                <PostCard key={p.id} post={p} variant="horizontal" />
              ))}
            </aside>
          </div>
        </section>
      )}

      {/* Latest grid */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-10 md:mt-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Fresh ink</p>
              <h2 className="font-display text-3xl font-semibold tracking-tight">Latest articles</h2>
            </div>
            <Button variant="ghost" onClick={() => navigate({ name: 'blog' })}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.slice(0, 6).map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* In-article ad */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 mt-10 md:mt-16">
        <AdSlot slot="inArticle" label="Advertisement" />
      </section>

      <Newsletter />
    </div>
  )
}
