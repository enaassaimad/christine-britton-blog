'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Post, Category, User } from '@/lib/types'
import { PostCard } from '@/components/site/post-card'
import { AdSlot } from '@/components/site/ad-slot'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search as SearchIcon } from 'lucide-react'

type P = Post & { author: User; category: Category }

export function BlogView({ initialQuery }: { initialQuery?: string }) {
  const [posts, setPosts] = useState<P[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [query, setQuery] = useState(initialQuery || '')
  const [category, setCategory] = useState<string>('ALL')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'popular'>('newest')

  useEffect(() => {
    api.categories.list().then(({ categories }) => setCategories(categories))
  }, [])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    const params: any = { limit: 9, page: 1 }
    if (query) params.q = query
    if (category !== 'ALL') params.category = category
    api.posts.list(params).then(({ posts, totalPages }) => {
      setPosts(posts)
      setTotalPages(totalPages)
    }).finally(() => setLoading(false))
  }, [query, category])

  const loadMore = async () => {
    setLoadingMore(true)
    const next = page + 1
    const params: any = { limit: 9, page: next }
    if (query) params.q = query
    if (category !== 'ALL') params.category = category
    try {
      const { posts: more } = await api.posts.list(params)
      setPosts((p) => [...p, ...more])
      setPage(next)
    } finally {
      setLoadingMore(false)
    }
  }

  const sorted = [...posts].sort((a, b) => {
    if (sort === 'oldest') return new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime()
    if (sort === 'popular') return b.views - a.views
    return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
  })

  return (
    <div className="animate-fade-up mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-14">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">The Archive</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
          {query ? `Results for “${query}”` : 'All Articles'}
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Every story we have published — long-form essays, recipes, travel notes and quiet think-pieces.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="md:w-52"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as any)}>
          <SelectTrigger className="md:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="popular">Most read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-2xl font-semibold">No articles found</p>
          <p className="mt-2 text-muted-foreground">Try a different search or category.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
          {page < totalPages && (
            <div className="mt-10 flex justify-center">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Load more articles
              </Button>
            </div>
          )}
        </>
      )}

      <div className="mt-16">
        <AdSlot slot="footer" label="Advertisement" />
      </div>
    </div>
  )
}
