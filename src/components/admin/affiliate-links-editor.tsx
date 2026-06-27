'use client'

import { useState } from 'react'
import type { AffiliateLink } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, GripVertical, ExternalLink, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  links: AffiliateLink[]
  onChange: (links: AffiliateLink[]) => void
}

const genId = () => `af_${Math.random().toString(36).slice(2, 10)}`

export function AffiliateLinksEditor({ links, onChange }: Props) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<Partial<AffiliateLink>>({ title: '', url: '', description: '', image: '', price: '', label: 'Check price' })

  const addLink = () => {
    if (!draft.title?.trim() || !draft.url?.trim()) {
      toast.error('Title and URL are required.')
      return
    }
    const link: AffiliateLink = {
      id: genId(),
      title: draft.title.trim(),
      url: draft.url.trim(),
      description: draft.description?.trim() || undefined,
      image: draft.image?.trim() || undefined,
      price: draft.price?.trim() || undefined,
      label: draft.label?.trim() || 'Check price',
    }
    onChange([...links, link])
    setDraft({ title: '', url: '', description: '', image: '', price: '', label: 'Check price' })
    setAdding(false)
    toast.success('Affiliate link added.')
  }

  const removeLink = (id: string) => {
    onChange(links.filter((l) => l.id !== id))
  }

  const updateField = (id: string, field: keyof AffiliateLink, value: string) => {
    onChange(links.map((l) => l.id === id ? { ...l, [field]: value } : l))
  }

  return (
    <div className="space-y-3">
      {links.length === 0 && !adding && (
        <div className="text-center py-4">
          <ShoppingBag className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-xs text-muted-foreground">No affiliate links yet. Add recommended products, supplies or books.</p>
        </div>
      )}

      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link, idx) => (
            <div key={link.id} className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-2 shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      value={link.title}
                      onChange={(e) => updateField(link.id, 'title', e.target.value)}
                      placeholder="Product title"
                      className="text-sm font-medium"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={link.price || ''}
                        onChange={(e) => updateField(link.id, 'price', e.target.value)}
                        placeholder="Price (e.g. $24.99)"
                        className="text-sm"
                      />
                      <Input
                        value={link.label || ''}
                        onChange={(e) => updateField(link.id, 'label', e.target.value)}
                        placeholder="Button label"
                        className="text-sm w-32"
                      />
                    </div>
                  </div>
                  <Input
                    value={link.url}
                    onChange={(e) => updateField(link.id, 'url', e.target.value)}
                    placeholder="https://affiliate-link.com/product"
                    className="text-sm font-mono"
                  />
                  <Input
                    value={link.image || ''}
                    onChange={(e) => updateField(link.id, 'image', e.target.value)}
                    placeholder="Image URL (optional)"
                    className="text-sm font-mono"
                  />
                  <Textarea
                    value={link.description || ''}
                    onChange={(e) => updateField(link.id, 'description', e.target.value)}
                    placeholder="Short description (optional)"
                    rows={2}
                    className="text-sm"
                  />
                  <div className="flex items-center gap-2">
                    {link.image && (
                      <div className="h-10 w-10 rounded overflow-hidden bg-muted shrink-0">
                        <img src={link.image} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Test link
                    </a>
                    <Button variant="ghost" size="sm" className="ml-auto text-destructive h-7" onClick={() => removeLink(link.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-2">
          <p className="text-xs font-medium text-primary mb-1">New affiliate link</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Title *</Label>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Posca PC-5M Paint Markers (Set of 15)" className="text-sm" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Price</Label>
              <Input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="$24.99" className="text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Affiliate URL *</Label>
            <Input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://www.amazon.com/dp/XXXX?tag=youraffid-20" className="text-sm font-mono" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Image URL</Label>
              <Input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="https://...product.jpg" className="text-sm font-mono" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Button label</Label>
              <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Check price" className="text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Description</Label>
            <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Why you recommend this product" rows={2} className="text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => { setAdding(false); setDraft({ title: '', url: '', description: '', image: '', price: '', label: 'Check price' }) }}>Cancel</Button>
            <Button size="sm" onClick={addLink}><Plus className="h-3.5 w-3.5 mr-1" /> Add link</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="w-full" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Add affiliate link
        </Button>
      )}

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Affiliate links are displayed at the bottom of the article with a clear disclosure. Always comply with your local affiliate disclosure regulations (e.g. FTC, ASA).
      </p>
    </div>
  )
}
