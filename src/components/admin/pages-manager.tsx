'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Page } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, Search, MoreVertical, FileText, Loader2, Eye } from 'lucide-react'
import { toast } from 'sonner'

export function PagesManager() {
  const { editPage, openPage } = useApp()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    api.pages.list().then(({ pages }) => {
      if (active) setPages(pages.sort((a, b) => a.order - b.order))
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = pages.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await api.pages.remove(deleteId)
      setPages((arr) => arr.filter((x) => x.id !== deleteId))
      toast.success('Page deleted.')
    } catch { toast.error('Could not delete.') } finally { setDeleteId(null) }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages…" className="pl-9" />
        </div>
        <Button onClick={() => editPage(null)}><Plus className="h-4 w-4 mr-1.5" /> New page</Button>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
        <p className="font-medium mb-1">AdSense tip</p>
        <p className="text-amber-800/80">Google AdSense requires a Privacy Policy, Terms &amp; Conditions, Disclaimer and Contact page at minimum. A Cookie Policy and DMCA page strengthen your application. All these pages are already created and linked in your footer.</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium">No pages yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-accent/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><FileText className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <button onClick={() => editPage(p.id)} className="text-left group">
                    <p className="font-medium truncate group-hover:text-primary">{p.title}</p>
                  </button>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={p.type === 'LEGAL' ? 'default' : 'secondary'} className={p.type === 'LEGAL' ? 'bg-primary text-primary-foreground' : ''}>{p.type}</Badge>
                    <span className="font-mono">/{p.slug}</span>
                    {p.showInFooter && <><span>•</span><span>Footer</span></>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => editPage(p.id)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openPage(p.slug)}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this page?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. If this is a required legal page, your site may not comply with AdSense policies.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
