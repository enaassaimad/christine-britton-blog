'use client'

import { useEffect, useState, useRef } from 'react'
import { api } from '@/lib/api'
import type { Post, Category, Media, AffiliateLink } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Markdown } from '@/components/site/markdown'
import { Metabox } from './metabox'
import { AffiliateLinksEditor } from './affiliate-links-editor'
import { GenerateImageDialog } from './generate-image-dialog'
import { InsertHtmlDialog, InsertAffiliateDialog } from './insert-dialogs'
import {
  ArrowLeft, Save, Eye, Upload, ImageIcon, Loader2, Sparkles, Send, Clock,
  Calendar, Tag, FolderTree, Image as ImgIcon, FileText, Search, ShoppingCart,
  Settings as SettingsIcon, Wand2, Link2, Check, AlertCircle, Eye as EyeIcon,
  Code2,
} from 'lucide-react'
import { toast } from 'sonner'
import { slugify, excerptFromContent, estimateReadTime } from '@/lib/helpers'

interface EditorState {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  coverAlt: string
  categoryId: string
  tags: string
  status: string
  featured: boolean
  trending: boolean
  showAds: boolean
  metaTitle: string
  metaDescription: string
  publishedAt: string
  affiliateLinks: AffiliateLink[]
}

const BLANK: EditorState = {
  title: '', slug: '', excerpt: '', content: '', coverImage: '', coverAlt: '',
  categoryId: '', tags: '', status: 'DRAFT', featured: false, trending: false,
  showAds: true, metaTitle: '', metaDescription: '', publishedAt: '', affiliateLinks: [],
}

export function PostEditor({ postId }: { postId: string | null }) {
  const { setAdminView, openPost } = useApp()
  const [categories, setCategories] = useState<Category[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!postId)
  const [showMedia, setShowMedia] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [showHtmlDialog, setShowHtmlDialog] = useState(false)
  const [showAffiliateDialog, setShowAffiliateDialog] = useState(false)
  const [form, setForm] = useState<EditorState>(BLANK)
  const fileRef = useRef<HTMLInputElement>(null)
  const slugTouched = useRef(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Insert text at the cursor position in the content textarea
  const insertAtCursor = (text: string) => {
    const ta = contentRef.current
    if (!ta) {
      update({ content: form.content + '\n\n' + text })
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = form.content.slice(0, start)
    const after = form.content.slice(end)
    const insert = (before.endsWith('\n') || before === '' ? '' : '\n\n') + text + '\n\n'
    const newContent = before + insert + after
    update({ content: newContent })
    // Restore cursor position after the inserted text
    requestAnimationFrame(() => {
      ta.focus()
      const pos = (start + insert.length) as number
      ta.setSelectionRange(pos, pos)
    })
  }

  useEffect(() => {
    let active = true
    api.categories.list().then(({ categories }) => {
      if (!active) return
      setCategories(categories)
      if (!postId && categories[0]) setForm((f) => ({ ...f, categoryId: categories[0].id }))
    })
    api.media.list().then(({ media }) => { if (active) setMedia(media) })
    return () => { active = false }
  }, [postId])

  useEffect(() => {
    if (!postId) { setLoading(false); return }
    setLoading(true)
    api.posts.get(postId).then(({ post }) => {
      setForm({
        title: post.title, slug: post.slug, excerpt: post.excerpt || '', content: post.content,
        coverImage: post.coverImage || '', coverAlt: post.coverAlt || '', categoryId: post.categoryId,
        tags: post.tags || '', status: post.status, featured: post.featured, trending: post.trending,
        showAds: post.showAds, metaTitle: post.metaTitle || '', metaDescription: post.metaDescription || '',
        publishedAt: post.publishedAt ? toLocalInput(post.publishedAt) : '',
        affiliateLinks: (post as any).affiliateLinks || [],
      })
    }).finally(() => setLoading(false))
  }, [postId])

  const update = (patch: Partial<EditorState>) => setForm((f) => ({ ...f, ...patch }))

  const onTitleChange = (title: string) => {
    if (!slugTouched.current) update({ title, slug: slugify(title) })
    else update({ title })
  }

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const { url } = await api.media.upload(file)
      setMedia((m) => [{ id: url, url, type: 'image', createdAt: new Date().toISOString() }, ...m])
      update({ coverImage: url })
      toast.success('Image uploaded.')
    } catch { toast.error('Upload failed.') } finally { setUploading(false) }
  }

  // Convert an ISO date to a value usable in <input type="datetime-local">
  function toLocalInput(iso: string): string {
    try {
      const d = new Date(iso)
      const off = d.getTimezoneOffset()
      const local = new Date(d.getTime() - off * 60000)
      return local.toISOString().slice(0, 16)
    } catch { return '' }
  }

  // Determine the scheduling state from status + date
  const scheduledDate = form.publishedAt ? new Date(form.publishedAt) : null
  const isScheduledFuture = form.status === 'SCHEDULED' && scheduledDate && scheduledDate > new Date()

  const save = async (mode: 'draft' | 'publish' | 'schedule') => {
    if (!form.title.trim()) { toast.error('Title is required.'); return }
    if (!form.categoryId) { toast.error('Please choose a category.'); return }
    if (!form.content.trim()) { toast.error('Content cannot be empty.'); return }
    if (mode === 'schedule' && !form.publishedAt) {
      toast.error('Please set a publish date to schedule.')
      return
    }
    if (mode === 'schedule' && scheduledDate && scheduledDate <= new Date()) {
      toast.error('Schedule date must be in the future.')
      return
    }

    let status = form.status
    if (mode === 'draft') status = 'DRAFT'
    else if (mode === 'publish') status = 'PUBLISHED'
    else if (mode === 'schedule') status = 'SCHEDULED'

    setSaving(true)
    const data: any = {
      title: form.title, slug: form.slug || slugify(form.title),
      excerpt: form.excerpt || excerptFromContent(form.content),
      content: form.content, coverImage: form.coverImage || null, coverAlt: form.coverAlt,
      categoryId: form.categoryId, tags: form.tags, status,
      featured: form.featured, trending: form.trending, showAds: form.showAds,
      metaTitle: form.metaTitle || null, metaDescription: form.metaDescription || null,
      publishedAt: form.publishedAt || null,
      affiliateLinks: form.affiliateLinks,
    }
    try {
      let saved: Post
      if (postId) {
        const { post } = await api.posts.update(postId, data)
        saved = post
      } else {
        const { post } = await api.posts.create(data)
        saved = post
      }
      const verb = mode === 'publish' ? 'Published!' : mode === 'schedule' ? 'Scheduled!' : 'Saved.'
      toast.success(verb)
      setAdminView('posts')
      if (mode === 'publish') openPost(saved.slug)
    } catch (e: any) {
      toast.error(e.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  const insertImageIntoContent = (img: { url: string; prompt: string }) => {
    const md = `\n\n![${img.prompt.slice(0, 80)}](${img.url})\n\n`
    update({ content: form.content + md })
    toast.success('Image inserted into content.')
  }

  if (loading) {
    return <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
  }

  const wordCount = form.content.split(/\s+/).filter(Boolean).length
  const statusBadge = form.status === 'PUBLISHED'
    ? { label: 'Published', cls: 'bg-emerald-600 text-white' }
    : form.status === 'SCHEDULED'
    ? { label: 'Scheduled', cls: 'bg-amber-500 text-white' }
    : { label: 'Draft', cls: 'bg-muted text-muted-foreground' }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Top bar — WordPress style */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setAdminView('posts')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Articles
          </Button>
          <Badge className={statusBadge.cls}>{statusBadge.label}</Badge>
          {form.title && <span className="text-sm text-muted-foreground truncate max-w-[300px]">{form.title}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => save('draft')} disabled={saving}>
            <Save className="h-4 w-4 mr-1.5" /> {saving ? 'Saving…' : 'Save draft'}
          </Button>
          {isScheduledFuture ? (
            <Button onClick={() => save('schedule')} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
              <Clock className="h-4 w-4 mr-1.5" /> {saving ? 'Saving…' : 'Schedule'}
            </Button>
          ) : (
            <Button onClick={() => save('publish')} disabled={saving}>
              <Send className="h-4 w-4 mr-1.5" /> {form.status === 'PUBLISHED' ? 'Update' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-8 space-y-5">
          {/* Title + slug — WP style */}
          <div className="rounded-xl border border-border bg-card p-5">
            <Label className="text-xs text-muted-foreground">Title</Label>
            <input
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Add title"
              className="w-full text-3xl font-display font-semibold bg-transparent border-0 outline-none focus:ring-0 px-0 py-1 placeholder:text-muted-foreground/40"
            />
            {form.slug && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <span className="opacity-60">Permalink:</span>
                <span className="font-mono">/{form.slug}</span>
                <button onClick={() => { slugTouched.current = true }} className="ml-1 text-primary hover:underline">Edit</button>
              </div>
            )}
            {slugTouched.current && (
              <Input
                value={form.slug}
                onChange={(e) => update({ slug: slugify(e.target.value) })}
                onBlur={() => { slugTouched.current = false }}
                placeholder="url-slug"
                className="font-mono text-sm mt-2"
                autoFocus
              />
            )}
          </div>

          {/* Content editor — WP classic style */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/40">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Content</span>
                <span className="text-xs text-muted-foreground">· Markdown</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span className="hidden sm:inline">{wordCount} words</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">{estimateReadTime(form.content)} min read</span>
                <Button variant="ghost" size="sm" className="h-7" onClick={() => setShowGenerator(true)}>
                  <Wand2 className="h-3.5 w-3.5 mr-1 text-primary" /> AI Image
                </Button>
                <Button variant="ghost" size="sm" className="h-7" onClick={() => setShowAffiliateDialog(true)} disabled={form.affiliateLinks.length === 0}>
                  <ShoppingCart className="h-3.5 w-3.5 mr-1 text-primary" /> Affiliate
                </Button>
                <Button variant="ghost" size="sm" className="h-7" onClick={() => setShowHtmlDialog(true)}>
                  <Code2 className="h-3.5 w-3.5 mr-1 text-primary" /> HTML
                </Button>
              </div>
            </div>
            <Tabs defaultValue="write">
              <div className="px-4 pt-2 border-b border-border">
                <TabsList className="bg-transparent h-9">
                  <TabsTrigger value="write" className="text-sm"><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Visual</TabsTrigger>
                  <TabsTrigger value="preview" className="text-sm"><Eye className="h-3.5 w-3.5 mr-1.5" /> Preview</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="write" className="m-0">
                <Textarea
                  ref={contentRef}
                  value={form.content}
                  onChange={(e) => update({ content: e.target.value })}
                  placeholder={'Start writing…\n\n## Use Markdown for formatting\n\n- **bold**, *italic*, > quotes\n- ### subheadings\n- lists\n\nSeparate paragraphs with blank lines.'}
                  className="font-mono text-sm min-h-[480px] resize-y border-0 rounded-none focus-visible:ring-0"
                />
              </TabsContent>
              <TabsContent value="preview" className="m-0">
                <div className="min-h-[480px] p-6">
                  {form.content ? <Markdown content={form.content} /> : <p className="text-muted-foreground text-sm">Nothing to preview yet.</p>}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Excerpt metabox (full width, below content like WP) */}
          <Metabox title="Excerpt" icon={<FileText className="h-4 w-4" />} description="A short summary shown in cards, search results and SEO previews. Leave blank to auto-generate from content.">
            <Textarea
              value={form.excerpt}
              onChange={(e) => update({ excerpt: e.target.value })}
              placeholder="Optional hand-written summary…"
              rows={3}
              className="resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{form.excerpt.length} characters</p>
          </Metabox>

          {/* Affiliate links metabox (full width) */}
          <Metabox title="Affiliate Links" icon={<ShoppingCart className="h-4 w-4" />} description="Recommended products, supplies or books. Displayed at the bottom of the article with a clear disclosure." action={<Badge variant="secondary">{form.affiliateLinks.length}</Badge>}>
            <AffiliateLinksEditor links={form.affiliateLinks} onChange={(links) => update({ affiliateLinks: links })} />
          </Metabox>
        </div>

        {/* SIDEBAR COLUMN — WordPress metaboxes */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Publish metabox — the heart of WP */}
          <Metabox title="Publish" icon={<Send className="h-4 w-4" />} defaultOpen>
            <div className="space-y-4">
              {/* Status / visibility */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Publish action</Label>
                <RadioGroup
                  value={form.status === 'PUBLISHED' ? 'PUBLISHED' : form.status === 'SCHEDULED' ? 'SCHEDULED' : 'DRAFT'}
                  onValueChange={(v) => update({ status: v })}
                  className="space-y-1.5"
                >
                  <label className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 hover:bg-accent">
                    <RadioGroupItem value="DRAFT" /> <Save className="h-3.5 w-3.5 text-muted-foreground" /> Save as Draft
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 hover:bg-accent">
                    <RadioGroupItem value="PUBLISHED" /> <Send className="h-3.5 w-3.5 text-muted-foreground" /> Publish now
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 hover:bg-accent">
                    <RadioGroupItem value="SCHEDULED" /> <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Schedule for later
                  </label>
                </RadioGroup>
              </div>

              {/* Schedule date — only relevant for SCHEDULED, but always editable */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {form.status === 'SCHEDULED' ? 'Scheduled for' : form.status === 'PUBLISHED' ? 'Publish date' : 'Publish date (optional)'}
                </Label>
                <Input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => update({ publishedAt: e.target.value })}
                />
                {form.status === 'SCHEDULED' && scheduledDate && (
                  <p className={`text-[11px] mt-1 flex items-center gap-1 ${isScheduledFuture ? 'text-amber-600' : 'text-destructive'}`}>
                    <AlertCircle className="h-3 w-3" />
                    {isScheduledFuture
                      ? `Will publish ${scheduledDate.toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}`
                      : 'Date is in the past — pick a future date to schedule.'}
                  </p>
                )}
                {form.status === 'SCHEDULED' && !form.publishedAt && (
                  <p className="text-[11px] mt-1 text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Set a date to schedule.
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-muted-foreground" /> Featured</Label>
                  <Switch checked={form.featured} onCheckedChange={(v) => update({ featured: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-1.5"><EyeIcon className="h-3.5 w-3.5 text-muted-foreground" /> Trending</Label>
                  <Switch checked={form.trending} onCheckedChange={(v) => update({ trending: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-1.5"><ImgIcon className="h-3.5 w-3.5 text-muted-foreground" /> Show ads</Label>
                  <Switch checked={form.showAds} onCheckedChange={(v) => update({ showAds: v })} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-border pt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => save('draft')} disabled={saving}>
                  <Save className="h-3.5 w-3.5 mr-1" /> Save draft
                </Button>
                {form.status === 'SCHEDULED' ? (
                  <Button size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => save('schedule')} disabled={saving || !isScheduledFuture}>
                    <Clock className="h-3.5 w-3.5 mr-1" /> Schedule
                  </Button>
                ) : (
                  <Button size="sm" className="flex-1" onClick={() => save('publish')} disabled={saving}>
                    <Send className="h-3.5 w-3.5 mr-1" /> Publish
                  </Button>
                )}
              </div>
            </div>
          </Metabox>

          {/* Categories metabox */}
          <Metabox title="Category" icon={<FolderTree className="h-4 w-4" />}>
            <div className="space-y-2 max-h-60 overflow-y-auto scroll-lumen">
              {categories.map((c) => (
                <label key={c.id} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent ${form.categoryId === c.id ? 'bg-accent' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={form.categoryId === c.id}
                    onChange={() => update({ categoryId: c.id })}
                    className="accent-primary"
                  />
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color || '#b45309' }} />
                  <span>{c.name}</span>
                </label>
              ))}
              {categories.length === 0 && <p className="text-xs text-muted-foreground">No categories yet.</p>}
            </div>
          </Metabox>

          {/* Tags metabox */}
          <Metabox title="Tags" icon={<Tag className="h-4 w-4" />} description="Separate tags with commas.">
            <Input value={form.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="fluid art, acrylic pouring, beginners" />
            {form.tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((t, i) => (
                  <span key={i} className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[11px]">#{t}</span>
                ))}
              </div>
            )}
          </Metabox>

          {/* Featured image metabox */}
          <Metabox title="Featured Image" icon={<ImgIcon className="h-4 w-4" />} action={form.coverImage ? <Badge variant="secondary">Set</Badge> : undefined}>
            <div className="space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                {form.coverImage ? (
                  <img src={form.coverImage} alt={form.coverAlt || ''} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/40 gap-1">
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-[10px]">No image set</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="h-7 text-xs">
                  {uploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />} Upload
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowMedia(!showMedia)} className="h-7 text-xs">
                  <ImageIcon className="h-3 w-3 mr-1" /> Library
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowGenerator(true)} className="h-7 text-xs text-primary border-primary/40 hover:bg-primary/10">
                  <Wand2 className="h-3 w-3 mr-1" /> Generate
                </Button>
                {form.coverImage && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => update({ coverImage: '' })} className="h-7 text-xs text-destructive">Remove</Button>
                )}
              </div>
              <Input
                value={form.coverImage}
                onChange={(e) => update({ coverImage: e.target.value })}
                placeholder="or paste image URL"
                className="text-xs font-mono h-8"
              />
              <Input
                value={form.coverAlt}
                onChange={(e) => update({ coverAlt: e.target.value })}
                placeholder="alt text (accessibility & SEO)"
                className="text-xs h-8"
              />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />

              {showMedia && (
                <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-border p-2 max-h-40 overflow-y-auto scroll-lumen bg-muted/30">
                  {media.length === 0 ? (
                    <p className="col-span-full text-center text-xs text-muted-foreground py-3">No images yet.</p>
                  ) : media.map((m) => (
                    <button key={m.id} onClick={() => { update({ coverImage: m.url }); setShowMedia(false) }} className="aspect-square overflow-hidden rounded-md border border-border hover:ring-2 ring-primary">
                      <img src={m.url} alt={m.alt || ''} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Metabox>

          {/* SEO metabox */}
          <Metabox title="SEO" icon={<Search className="h-4 w-4" />} defaultOpen={false}>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Meta title</Label>
                <Input value={form.metaTitle} onChange={(e) => update({ metaTitle: e.target.value })} placeholder={form.title || 'Page title'} className="text-sm" />
                <p className="text-[10px] text-muted-foreground mt-1">{form.metaTitle.length}/60 characters</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Meta description</Label>
                <Textarea value={form.metaDescription} onChange={(e) => update({ metaDescription: e.target.value })} placeholder={form.excerpt || 'Page description for search engines'} rows={3} className="text-sm" />
                <p className="text-[10px] text-muted-foreground mt-1">{form.metaDescription.length}/160 characters</p>
              </div>
              {/* Google snippet preview */}
              <div className="rounded-md border border-border p-2.5 bg-background">
                <p className="text-[11px] text-emerald-700 truncate">{window.location.origin}/{form.slug || 'post-slug'}</p>
                <p className="text-sm text-[#1a0dab] truncate font-medium">{form.metaTitle || form.title || 'Post title'}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{form.metaDescription || form.excerpt || 'Post excerpt will appear here…'}</p>
              </div>
            </div>
          </Metabox>
        </aside>
      </div>

      {/* AI image generator dialog */}
      <GenerateImageDialog
        open={showGenerator}
        onOpenChange={setShowGenerator}
        defaultPrompt={form.title}
        onUseAsCover={(img) => { update({ coverImage: img.url, coverAlt: img.prompt.slice(0, 120) }); toast.success('Set as featured image.') }}
        onInsertIntoContent={insertImageIntoContent}
      />

      {/* Insert HTML dialog */}
      <InsertHtmlDialog
        open={showHtmlDialog}
        onOpenChange={setShowHtmlDialog}
        onInsert={insertAtCursor}
      />

      {/* Insert affiliate block dialog */}
      <InsertAffiliateDialog
        open={showAffiliateDialog}
        onOpenChange={setShowAffiliateDialog}
        links={form.affiliateLinks}
        onInsert={insertAtCursor}
      />
    </div>
  )
}
