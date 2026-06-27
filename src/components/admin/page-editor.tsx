'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Page } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Markdown } from '@/components/site/markdown'
import { ArrowLeft, Save, Eye, Loader2, FileText, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { slugify } from '@/lib/helpers'

interface FormState {
  title: string; slug: string; content: string; excerpt: string; type: string; showInFooter: boolean; order: number
}
const BLANK: FormState = { title: '', slug: '', content: '', excerpt: '', type: 'LEGAL', showInFooter: true, order: 0 }

export function PageEditor({ pageId }: { pageId: string | null }) {
  const { setAdminView } = useApp()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!pageId)
  const [form, setForm] = useState<FormState>(BLANK)

  useEffect(() => {
    if (!pageId) { setLoading(false); return }
    setLoading(true)
    api.pages.list().then(({ pages }) => {
      const p = pages.find((x) => x.id === pageId)
      if (p) setForm({ title: p.title, slug: p.slug, content: p.content, excerpt: p.excerpt || '', type: p.type, showInFooter: p.showInFooter, order: p.order })
    }).finally(() => setLoading(false))
  }, [pageId])

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title is required.'); return }
    if (!form.content.trim()) { toast.error('Content is required.'); return }
    setSaving(true)
    const data = { ...form, slug: form.slug || slugify(form.title) }
    try {
      if (pageId) await api.pages.update(pageId, data)
      else await api.pages.create(data)
      toast.success('Page saved.')
      setAdminView('pages')
    } catch (e: any) { toast.error(e.message || 'Save failed.') } finally { setSaving(false) }
  }

  if (loading) return <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <Button variant="ghost" size="sm" onClick={() => setAdminView('pages')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to pages
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />} Save page
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 mb-5">
        <Label className="text-xs text-muted-foreground">Page title</Label>
        <input
          value={form.title}
          onChange={(e) => update({ title: e.target.value, slug: form.slug || slugify(e.target.value) })}
          placeholder="e.g. Privacy Policy"
          className="w-full text-2xl font-display font-semibold bg-transparent border-0 outline-none focus:ring-0 px-0 py-1"
        />
        {form.slug && <p className="text-xs text-muted-foreground mt-1 font-mono">/page/{form.slug}</p>}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden mb-5">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/40">
          <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Content</span><span className="text-xs text-muted-foreground">· Markdown</span></div>
        </div>
        <Tabs defaultValue="write">
          <div className="px-4 pt-2 border-b border-border">
            <TabsList className="bg-transparent h-9">
              <TabsTrigger value="write" className="text-sm"><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Write</TabsTrigger>
              <TabsTrigger value="preview" className="text-sm"><Eye className="h-3.5 w-3.5 mr-1.5" /> Preview</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="write" className="m-0">
            <Textarea value={form.content} onChange={(e) => update({ content: e.target.value })} placeholder="Write the page content in Markdown…" className="font-mono text-sm min-h-[500px] resize-y border-0 rounded-none focus-visible:ring-0" />
          </TabsContent>
          <TabsContent value="preview" className="m-0">
            <div className="min-h-[500px] p-6">{form.content ? <Markdown content={form.content} /> : <p className="text-muted-foreground text-sm">Nothing to preview.</p>}</div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <Label className="text-xs text-muted-foreground">Page type</Label>
          <Select value={form.type} onValueChange={(v) => update({ type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LEGAL">Legal (required for AdSense)</SelectItem>
              <SelectItem value="CUSTOM">Custom page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Excerpt</Label>
            <Input value={form.excerpt} onChange={(e) => update({ excerpt: e.target.value })} placeholder="Short summary" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Show in footer</Label>
            <Switch checked={form.showInFooter} onCheckedChange={(v) => update({ showInFooter: v })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Order</Label>
            <Input type="number" value={form.order} onChange={(e) => update({ order: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
      </div>
    </div>
  )
}
