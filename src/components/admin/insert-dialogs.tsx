'use client'

import { useState, useRef } from 'react'
import type { AffiliateLink } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Code2, ShoppingBag, Check } from 'lucide-react'
import { toast } from 'sonner'

/** Escape an attribute value for safe HTML insertion. */
function esc(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Generate the HTML for a row of affiliate product cards from selected links. */
export function generateAffiliateCardsHTML(links: AffiliateLink[]): string {
  const cards = links.map((l) => {
    const img = l.image ? `<img src="${esc(l.image)}" alt="${esc(l.title)}" />` : ''
    const price = l.price ? `<div class="product-price">${esc(l.price)}</div>` : ''
    return `<a class="product-card" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer sponsored">
  ${img}
  <div>
    <div class="product-title">${esc(l.title)}</div>
    ${price}
  </div>
  <div class="card-footer">
    <span class="store-label">🔗 Affiliate</span>
    <span class="price-button">${esc(l.label || 'Check Price')}</span>
  </div>
</a>`
  }).join('\n')
  return `<div class="affiliate-cards">
${cards}
</div>`
}

interface InsertHtmlDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (html: string) => void
}

export function InsertHtmlDialog({ open, onOpenChange, onInsert }: InsertHtmlDialogProps) {
  const [html, setHtml] = useState('')

  const insert = () => {
    if (!html.trim()) {
      toast.error('Please enter some HTML code.')
      return
    }
    onInsert(html)
    setHtml('')
    onOpenChange(false)
    toast.success('HTML inserted at cursor.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Code2 className="h-5 w-5 text-primary" /> Insert HTML Code</DialogTitle>
          <DialogDescription>Paste raw HTML to embed directly in the article content. It will render inline where your cursor is.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">HTML code</Label>
            <Textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder={'<div class="affiliate-cards">\n  <a class="product-card" href="...">\n    <img src="..." alt="Product" />\n    <div class="product-title">Product Name</div>\n    <div class="card-footer">\n      <span class="price-button">Check Price</span>\n    </div>\n  </a>\n</div>'}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Available CSS classes for affiliate cards:</p>
            <ul className="space-y-0.5 font-mono">
              <li>• <code>.affiliate-cards</code> — wrapper for a row of product cards</li>
              <li>• <code>.product-card</code> — individual card (use as <code>&lt;a&gt;</code> tag)</li>
              <li>• <code>.product-title</code>, <code>.product-price</code> — text elements</li>
              <li>• <code>.price-button</code> — the "Check Price" CTA button</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={insert}><Code2 className="h-4 w-4 mr-1.5" /> Insert HTML</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface InsertAffiliateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  links: AffiliateLink[]
  onInsert: (html: string) => void
}

export function InsertAffiliateDialog({ open, onOpenChange, links, onInsert }: InsertAffiliateDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const insert = () => {
    const chosen = links.filter((l) => selected.has(l.id))
    if (chosen.length === 0) {
      toast.error('Please select at least one product.')
      return
    }
    const html = generateAffiliateCardsHTML(chosen)
    onInsert(html)
    setSelected(new Set())
    onOpenChange(false)
    toast.success(`${chosen.length} product card${chosen.length > 1 ? 's' : ''} inserted.`)
  }

  const preview = generateAffiliateCardsHTML(links.filter((l) => selected.has(l.id)))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" /> Insert Affiliate Product Cards</DialogTitle>
          <DialogDescription>Select products from your affiliate links to insert as a row of cards inside the article content.</DialogDescription>
        </DialogHeader>

        {links.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No affiliate links yet. Add some in the <strong>Affiliate Links</strong> section below, then come back to insert them.
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto scroll-lumen">
            {links.map((l) => (
              <label key={l.id} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/30">
                <Checkbox checked={selected.has(l.id)} onCheckedChange={() => toggle(l.id)} />
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {l.image && <img src={l.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{l.price || 'No price'} · {l.label || 'Check Price'}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {selected.size > 0 && (
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Preview (HTML to insert):</p>
            <pre className="text-[10px] font-mono text-muted-foreground max-h-32 overflow-y-auto scroll-lumen whitespace-pre-wrap">{preview}</pre>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={insert} disabled={selected.size === 0}>
            <Check className="h-4 w-4 mr-1.5" /> Insert {selected.size > 0 ? `${selected.size} card${selected.size > 1 ? 's' : ''}` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
