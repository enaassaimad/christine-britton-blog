'use client'

import { useEffect, useState, useRef } from 'react'
import { api } from '@/lib/api'
import type { DigitalProduct } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, Search, MoreVertical, BookOpen, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ProductsManager() {
  const { editProduct, openProduct } = useApp()
  const [products, setProducts] = useState<DigitalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    api.products.list().then(({ products }) => {
      if (active) setProducts(products)
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))

  const toggleFeatured = async (p: DigitalProduct) => {
    try {
      await api.products.update(p.id, { featured: !p.featured })
      setProducts((arr) => arr.map((x) => x.id === p.id ? { ...x, featured: !p.featured } : x))
    } catch { toast.error('Update failed') }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await api.products.remove(deleteId)
      setProducts((arr) => arr.filter((x) => x.id !== deleteId))
      toast.success('Product deleted.')
    } catch { toast.error('Could not delete.') } finally { setDeleteId(null) }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="pl-9" />
        </div>
        <Button onClick={() => editProduct(null)}><Plus className="h-4 w-4 mr-1.5" /> New product</Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium">No products yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first digital product — ebook, course, template or bundle.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-accent/30">
                <div className="h-14 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
                  {p.coverImage && <img src={p.coverImage} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <button onClick={() => editProduct(p.id)} className="text-left group">
                    <p className="font-medium truncate group-hover:text-primary">{p.title}</p>
                  </button>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="capitalize">{p.category || 'digital'}</Badge>
                    <span>•</span>
                    <span className="font-semibold text-foreground">{p.price}</span>
                    {p.originalPrice && <><span>•</span><span className="line-through">{p.originalPrice}</span></>}
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-center gap-0.5">
                  <Switch checked={p.featured} onCheckedChange={() => toggleFeatured(p)} />
                  <span className="text-[10px] text-muted-foreground">Featured</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => editProduct(p.id)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openProduct(p.slug)}><BookOpen className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
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
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
