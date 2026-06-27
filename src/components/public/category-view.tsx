'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Post, Category, User } from '@/lib/types'
import { PostCard } from '@/components/site/post-card'
import { AdSlot } from '@/components/site/ad-slot'
import { useApp } from '@/store/app-store'
import { CategoryIcon } from '@/lib/category-icons'
import { Loader2 } from 'lucide-react'

type P = Post & { author: User; category: Category }

export function CategoryView({ slug }: { slug: string }) {
  const { navigate } = useApp()
  const [category, setCategory] = useState<Category | null>(null)
  const [posts, setPosts] = useState<P[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.categories.list(),
      api.posts.list({ category: slug, limit: 9, page: 1 }),
    ]).then(([cats, { posts, totalPages }]) => {
      const c = cats.categories.find((c) => c.slug === slug) || null
      setCategory(c)
      setPosts(posts)
      setTotalPages(totalPages)
      setPage(1)
    }).finally(() => setLoading(false))
  }, [slug])

  const loadMore = async () => {
    setLoadingMore(true)
    const next = page + 1
    try {
      const { posts: more } = await api.posts.list({ category: slug, limit: 9, page: next })
      setPosts((p) => [...p, ...more])
      setPage(next)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-32 text-center">
        <p className="font-display text-3xl font-semibold">Category not found</p>
        <button onClick={() => navigate({ name: 'home' })} className="mt-4 text-primary underline">Back home</button>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section
        className="border-b border-border"
        style={{ background: `linear-gradient(180deg, ${category.color}14, transparent)` }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
            style={{ backgroundColor: `${category.color}1a`, color: category.color || '#b45309' }}
          >
            <CategoryIcon name={category.icon} className="h-8 w-8" />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Category</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight">{category.name}</h1>
          {category.description && <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{category.description}</p>}
          <p className="mt-3 text-sm text-muted-foreground">{posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl font-semibold">No articles yet</p>
            <p className="mt-2 text-muted-foreground">Check back soon for new stories in {category.name}.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
            {page < totalPages && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 mb-16">
        <AdSlot slot="inArticle" label="Advertisement" />
      </section>
    </div>
  )
}
