'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Post, Category, User } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PenSquare, Trash2, Search, MoreVertical, Eye, Loader2, Plus, FileText, Clock } from 'lucide-react'
import { formatShortDate } from '@/lib/helpers'
import { toast } from 'sonner'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type P = Post & { author: User; category: Category }

export function PostsManager() {
  const { editPost, openPost } = useApp()
  const [posts, setPosts] = useState<P[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ALL')
  const [category, setCategory] = useState('ALL')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const params: any = { status, limit: 100 }
    if (q) params.q = q
    if (category !== 'ALL') params.category = category
    const { posts } = await api.posts.list(params)
    setPosts(posts)
    setLoading(false)
  }

  useEffect(() => { api.categories.list().then(({ categories }) => setCategories(categories)) }, [])
  useEffect(() => { load() }, [status, category])

  const onSearch = (v: string) => { setQ(v); }
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [q])

  const toggleFeatured = async (p: P) => {
    try {
      await api.posts.update(p.id, { featured: !p.featured })
      setPosts((arr) => arr.map((x) => x.id === p.id ? { ...x, featured: !p.featured } : x))
    } catch { toast.error('Update failed') }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await api.posts.remove(deleteId)
      setPosts((arr) => arr.filter((x) => x.id !== deleteId))
      toast.success('Article deleted.')
    } catch { toast.error('Could not delete.') } finally { setDeleteId(null) }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Search articles…" className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="DRAFT">Drafts</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="md:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => editPost(null)}><Plus className="h-4 w-4 mr-1.5" /> New article</Button>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium">No articles yet</p>
            <p className="text-sm text-muted-foreground mt-1">Click “New article” to write your first story.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-accent/30">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  {p.coverImage && <img src={p.coverImage} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <button onClick={() => editPost(p.id)} className="text-left group">
                    <p className="font-medium truncate group-hover:text-primary">{p.title}</p>
                  </button>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{p.category.name}</span>
                    <span>•</span>
                    {p.status === 'SCHEDULED' && p.publishedAt ? (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <Clock className="h-3 w-3" /> {new Date(p.publishedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    ) : (
                      <span>{formatShortDate(p.publishedAt || p.createdAt)}</span>
                    )}
                    <span>•</span>
                    <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {p.views}</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <Switch checked={p.featured} onCheckedChange={() => toggleFeatured(p)} />
                    <span className="text-[10px] text-muted-foreground">Featured</span>
                  </div>
                  <Badge
                    variant={p.status === 'PUBLISHED' ? 'default' : 'secondary'}
                    className={
                      p.status === 'PUBLISHED' ? 'bg-emerald-600 text-white'
                      : p.status === 'SCHEDULED' ? 'bg-amber-500 text-white'
                      : ''
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => editPost(p.id)}><PenSquare className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                    {p.status === 'PUBLISHED' && (
                      <DropdownMenuItem onClick={() => openPost(p.slug)}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                    )}
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
            <AlertDialogTitle>Delete this article?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The article and its comments will be permanently removed.</AlertDialogDescription>
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
