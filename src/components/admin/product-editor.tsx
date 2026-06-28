'use client'

import { useEffect, useState, useRef } from 'react'
import { api } from '@/lib/api'
import type { DigitalProduct, Media } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Markdown } from '@/components/site/markdown'
import { Metabox } from './metabox'
import { GenerateImageDialog } from './generate-image-dialog'
import { ArrowLeft, Save, Eye, Upload, ImageIcon, Loader2, Wand2, Sparkles, BookOpen, DollarSign, Tag, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { slugify } from '@/lib/helpers'

interface FormState {
  title: string; slug: string; excerpt: string; description: string
  coverImage: string; coverAlt: string; price: string; originalPrice: string
  buyUrl: string; buyLabel: string; category: string; featured: boolean; tags: string; order: number
}

const BLANK: FormState = {
  title: '', slug: '', excerpt: '', description: '', coverImage: '', coverAlt: '',
  price: '$19.99', originalPrice: '', buyUrl: '', buyLabel: 'Buy now', category: 'ebook',
  featured: false, tags: '', order: 0,
}

export function ProductEditor({ productId }: { productId: string | null }) {
  const { setAdminView } = useApp()
  const [media, setMedia] = useState<Media[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!productId)
  const [showMedia, setShowMedia] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [form, setForm] = useState<FormState>(BLANK)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    api.media.list().then(({ media }) => { if (active) setMedia(media) })
    if (!productId) { setLoading(false); return }
    setLoading(true)
    api.products.get(productId).then(({ product }) => {
      setForm({
        title: product.title, slug: product.slug, excerpt: product.excerpt || '', description: product.description,
        coverImage: product.coverImage || '', coverAlt: product.coverAlt || '', price: product.price,
        originalPrice: product.originalPrice || '', buyUrl: product.buyUrl, buyLabel: product.buyLabel,
        category: product.category || 'ebook', featured: product.featured, tags: product.tags || '', order: product.order,
      })
    }).finally(() => setLoading(false))
    return () => { active = false }
  }, [productId])

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const upload = async (file: File) => {
    const { url } = await api.media.upload(file)
    setMedia((m) => [{ id: url, url, type: 'image', createdAt: new Date().toISOString() }, ...m])
    update({ coverImage: url })
    toast.success('Image uploaded.')
  }

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title is required.'); return }
    if (!form.description.trim()) { toast.error('Description is required.'); return }
    if (!form.buyUrl.trim()) { toast.error('Buy URL is required.'); return }
    setSaving(true)
    const data = { ...form, slug: form.slug || slugify(form.title) }
    try {
      if (productId) await api.products.update(productId, data)
      else await api.products.create(data)
      toast.success('Product saved.')
      setAdminView('products')
    } catch (e: any) { toast.error(e.message || 'Save failed.') } finally { setSaving(false) }
  }

  if (loading) return <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <Button variant="ghost" size="sm" onClick={() => setAdminView('products')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to products
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />} Save product
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main */}
        <div className="lg:col-span-8 space-y-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <Label className="text-xs text-muted-foreground">Product title</Label>
            <input
              value={form.title}
              onChange={(e) => update({ title: e.target.value, slug: form.slug || slugify(e.target.value) })}
              placeholder="e.g. The Complete Fluid Art Handbook"
              className="w-full text-2xl font-display font-semibold bg-transparent border-0 outline-none focus:ring-0 px-0 py-1"
            />
            {form.slug && <p className="text-xs text-muted-foreground mt-1 font-mono">/{form.slug}</p>}
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Short excerpt</Label>
            <Textarea value={form.excerpt} onChange={(e) => update({ excerpt: e.target.value })} placeholder="One or two sentence summary shown in product cards." rows={2} />
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/40">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Description</span>
                <span className="text-xs text-muted-foreground">· Markdown</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7" onClick={() => setShowGenerator(true)}>
                <Wand2 className="h-3.5 w-3.5 mr-1 text-primary" /> AI Image
              </Button>
            </div>
            <Tabs defaultValue="write">
              <div className="px-4 pt-2 border-b border-border">
                <TabsList className="bg-transparent h-9">
                  <TabsTrigger value="write" className="text-sm"><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Write</TabsTrigger>
                  <TabsTrigger value="preview" className="text-sm"><Eye className="h-3.5 w-3.5 mr-1.5" /> Preview</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="write" className="m-0">
                <Textarea value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="Describe the product, what's inside, who it's for…" className="font-mono text-sm min-h-[400px] resize-y border-0 rounded-none focus-visible:ring-0" />
              </TabsContent>
              <TabsContent value="preview" className="m-0">
                <div className="min-h-[400px] p-6">{form.description ? <Markdown content={form.description} /> : <p className="text-muted-foreground text-sm">Nothing to preview.</p>}</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-4">
          <Metabox title="Pricing & Checkout" icon={<DollarSign className="h-4 w-4" />}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Price *</Label>
                  <Input value={form.price} onChange={(e) => update({ price: e.target.value })} placeholder="$19.99" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Original price</Label>
                  <Input value={form.originalPrice} onChange={(e) => update({ originalPrice: e.target.value })} placeholder="$29.99" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Checkout URL *</Label>
                <Input value={form.buyUrl} onChange={(e) => update({ buyUrl: e.target.value })} placeholder="https://gumroad.com/l/..." className="font-mono text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Button label</Label>
                <Input value={form.buyLabel} onChange={(e) => update({ buyLabel: e.target.value })} placeholder="Buy now" />
              </div>
              <p className="text-[10px] text-muted-foreground">Use Gumroad, Stripe, Payhip, SendOwl or any checkout link.</p>
            </div>
          </Metabox>

          <Metabox title="Cover Image" icon={<ImageIcon className="h-4 w-4" />} action={form.coverImage ? <Badge variant="secondary">Set</Badge> : undefined}>
            <div className="space-y-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-muted">
                {form.coverImage ? <img src={form.coverImage} alt={form.coverAlt || ''} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-muted-foreground/40"><ImageIcon className="h-6 w-6" /></div>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="h-7 text-xs"><Upload className="h-3 w-3 mr-1" /> Upload</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowMedia(!showMedia)} className="h-7 text-xs"><ImageIcon className="h-3 w-3 mr-1" /> Library</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowGenerator(true)} className="h-7 text-xs text-primary border-primary/40 hover:bg-primary/10"><Wand2 className="h-3 w-3 mr-1" /> Generate</Button>
                {form.coverImage && <Button type="button" variant="ghost" size="sm" onClick={() => update({ coverImage: '' })} className="h-7 text-xs text-destructive">Remove</Button>}
              </div>
              <Input value={form.coverImage} onChange={(e) => update({ coverImage: e.target.value })} placeholder="or paste image URL" className="text-xs font-mono h-8" />
              <Input value={form.coverAlt} onChange={(e) => update({ coverAlt: e.target.value })} placeholder="alt text" className="text-xs h-8" />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f).catch(() => toast.error('Upload failed')); e.target.value = '' }} />
              {showMedia && (
                <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-border p-2 max-h-40 overflow-y-auto scroll-lumen bg-muted/30">
                  {media.map((m) => (
                    <button key={m.id} onClick={() => { update({ coverImage: m.url }); setShowMedia(false) }} className="aspect-square overflow-hidden rounded-md border border-border hover:ring-2 ring-primary">
                      <img src={m.url} alt={m.alt || ''} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Metabox>

          <Metabox title="Category & Tags" icon={<Tag className="h-4 w-4" />}>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={form.category} onValueChange={(v) => update({ category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ebook">Ebook</SelectItem>
                    <SelectItem value="course">Video Course</SelectItem>
                    <SelectItem value="template">Template / Printable</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                    <SelectItem value="book">Physical Book</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Tags</Label>
                <Input value={form.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="fluid art, beginners, ebook" />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <Label className="text-sm flex items-center gap-1.5"><ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" /> Featured</Label>
                <Switch checked={form.featured} onCheckedChange={(v) => update({ featured: v })} />
              </div>
            </div>
          </Metabox>
        </aside>
      </div>

      <GenerateImageDialog
        open={showGenerator}
        onOpenChange={setShowGenerator}
        defaultPrompt={form.title}
        onUseAsCover={(img) => { update({ coverImage: img.url, coverAlt: img.prompt.slice(0, 120) }); toast.success('Set as cover.') }}
      />
    </div>
  )
}
