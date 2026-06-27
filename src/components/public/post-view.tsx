'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Post, Category, User, Comment } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { Markdown } from '@/components/site/markdown'
import { AdSlot } from '@/components/site/ad-slot'
import { ProductsWidget } from '@/components/site/products-widget'
import { PostCard } from '@/components/site/post-card'
import { Newsletter } from '@/components/site/newsletter'
import { useSettings } from '@/components/site/settings-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CategoryIcon } from '@/lib/category-icons'
import { formatShortDate, relativeTime } from '@/lib/helpers'
import { ArrowLeft, Clock, Eye, Heart, Share2, MessageCircle, Twitter, Facebook, Link2, ChevronRight, ShoppingBag, Package, ExternalLink } from 'lucide-react'

type FullPost = Post & { author: User; category: Category; comments: Comment[] }
type Related = Post & { author: User; category: Category }

export function PostView({ slug }: { slug: string }) {
  const { navigate, openCategory, openPost } = useApp()
  const { settings } = useSettings()
  const [post, setPost] = useState<FullPost | null>(null)
  const [related, setRelated] = useState<Related[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentForm, setCommentForm] = useState({ author: '', email: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.posts.getBySlug(slug).then(({ post, related }) => {
      setPost(post)
      setRelated(related)
      setComments(post.comments)
    }).catch(() => setPost(null)).finally(() => setLoading(false))
  }, [slug])

  const submitComment = async () => {
    if (!post) return
    if (!commentForm.author || !commentForm.email || !commentForm.content) {
      toast.error('Please fill in all fields.')
      return
    }
    setSubmitting(true)
    try {
      await api.comments.create({ postId: post.id, ...commentForm })
      toast.success('Comment submitted — it will appear once approved.')
      setCommentForm({ author: '', email: '', content: '' })
    } catch {
      toast.error('Could not submit comment.')
    } finally {
      setSubmitting(false)
    }
  }

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: post?.title, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard.')
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20">
        <div className="h-6 w-32 animate-pulse rounded bg-muted mb-6" />
        <div className="h-12 w-3/4 animate-pulse rounded bg-muted mb-4" />
        <div className="h-80 animate-pulse rounded-2xl bg-muted" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-32 text-center">
        <p className="font-display text-3xl font-semibold">Article not found</p>
        <p className="mt-2 text-muted-foreground">It may have been moved or unpublished.</p>
        <Button className="mt-6" onClick={() => navigate({ name: 'home' })}>Back home</Button>
      </div>
    )
  }

  const tags = post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : []

  return (
    <div className="animate-fade-up">
      {/* Two-column layout: article + sticky sidebar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 md:pt-12 grid gap-8 lg:gap-10 lg:grid-cols-12">
        {/* ===== ARTICLE (left column) ===== */}
        <article className="lg:col-span-8 min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
            <button onClick={() => navigate({ name: 'home' })} className="hover:text-foreground">Home</button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => openCategory(post.category.slug)} className="hover:text-foreground inline-flex items-center gap-1">
              <CategoryIcon name={post.category.icon} className="h-3 w-3" style={{ color: post.category.color || undefined }} />
              {post.category.name}
            </button>
          </nav>

          {/* Header */}
          <header>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => openCategory(post.category.slug)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/15"
              >
                <CategoryIcon name={post.category.icon} className="h-3 w-3" /> {post.category.name}
              </button>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>

            {/* Meta */}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground border-y border-border/60 py-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold text-primary">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground leading-tight">{post.author.name}</p>
                  <p className="text-xs">{post.author.bio ? post.author.bio.slice(0, 48) + (post.author.bio.length > 48 ? '…' : '') : 'Editor'}</p>
                </div>
              </div>
              <span className="hidden sm:inline">•</span>
              <span>{formatShortDate(post.publishedAt || post.createdAt)}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readMinutes} min read</span>
              <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.views.toLocaleString()}</span>
            </div>
          </header>

          {/* Cover */}
          {post.coverImage && (
            <figure className="mt-8">
              <div className="relative aspect-[16/9] overflow-hidden bg-muted rounded-2xl">
                <img src={post.coverImage} alt={post.coverAlt || post.title} className="h-full w-full object-cover" />
              </div>
              {post.coverAlt && <figcaption className="mt-2 text-xs text-muted-foreground">{post.coverAlt}</figcaption>}
            </figure>
          )}

          {/* Content */}
          <Markdown content={post.content} />

          {/* In-article ad */}
          {post.showAds && (
            <div className="my-10">
              <AdSlot slot="inArticle" label="Advertisement" />
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => navigate({ name: 'search', q: t })}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {/* Author + share */}
          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-secondary/40 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center text-lg font-semibold text-primary">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Written by</p>
                <p className="font-display text-lg font-semibold">{post.author.name}</p>
                {post.author.bio && <p className="text-sm text-muted-foreground mt-0.5 max-w-md">{post.author.bio}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setLiked((v) => !v); toast.success('Thanks for the love!') }}>
                <Heart className={`h-4 w-4 mr-1.5 ${liked ? 'fill-primary text-primary' : ''}`} /> {post.likes + (liked ? 1 : 0)}
              </Button>
              <Button variant="outline" size="sm" onClick={share}>
                <Share2 className="h-4 w-4 mr-1.5" /> Share
              </Button>
            </div>
          </div>

          {/* Affiliate links / recommended products */}
          {post.affiliateLinks && post.affiliateLinks.length > 0 && (
            <section className="mt-10 rounded-2xl border border-border bg-secondary/30 p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" /> Recommended supplies
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Some of the links below are affiliate links. If you buy something through them, we may earn a small commission at no extra cost to you. We only recommend products we genuinely use and love.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {post.affiliateLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="group flex gap-3 rounded-xl border border-border bg-card p-3 hover:shadow-md hover:border-primary/40 transition-all"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {link.image ? (
                        <img src={link.image} alt={link.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground/40"><Package className="h-6 w-6" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary">{link.title}</p>
                      {link.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{link.description}</p>}
                      <div className="mt-1.5 flex items-center gap-2">
                        {link.price && <span className="text-sm font-semibold text-primary">{link.price}</span>}
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
                          {link.label || 'Check price'} <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Comments */}
          <section className="mt-12">
            <h3 className="font-display text-2xl font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" /> Comments ({comments.length})
            </h3>

            {/* Comment form */}
            <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5">
              <p className="text-sm font-medium mb-4">Join the conversation</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <Input value={commentForm.author} onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })} placeholder="Your name" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input type="email" value={commentForm.email} onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })} placeholder="you@example.com" />
                </div>
              </div>
              <div className="mt-3">
                <Label className="text-xs text-muted-foreground">Comment</Label>
                <Textarea value={commentForm.content} onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })} placeholder="Share your thoughts…" rows={4} />
              </div>
              <div className="mt-3 flex justify-end">
                <Button onClick={submitComment} disabled={submitting}>
                  {submitting ? 'Posting…' : 'Post comment'}
                </Button>
              </div>
            </div>

            {/* Comment list */}
            <div className="mt-6 space-y-5">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Be the first to comment.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                      {c.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{c.author}</span>
                        <span className="text-xs text-muted-foreground">{relativeTime(c.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </article>

        {/* ===== SIDEBAR (right column, sticky) ===== */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            {/* Digital product offers */}
            <ProductsWidget variant="sidebar" limit={2} title="From the Shop" />

            {/* Sidebar ad */}
            {post.showAds && <AdSlot slot="sidebar" label="Advertisement" />}
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Keep reading</h2>
            <Button variant="ghost" onClick={() => openCategory(post.category.slug)}>More in {post.category.name} <ChevronRight className="ml-1 h-4 w-4" /></Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* Footer ad */}
      {post.showAds && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 mt-16">
          <AdSlot slot="footer" label="Advertisement" />
        </section>
      )}

      <Newsletter />
    </div>
  )
}
