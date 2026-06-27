'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { User } from '@/lib/types'
import { useApp } from '@/store/app-store'
import { AdminLogin } from './admin-login'
import { AdminShell } from './admin-shell'
import { Dashboard } from './dashboard'
import { PostsManager } from './posts-manager'
import { PostEditor } from './post-editor'
import { CategoriesManager } from './categories-manager'
import { MediaManager } from './media-manager'
import { CommentsManager } from './comments-manager'
import { SettingsManager } from './settings-manager'
import { ProductsManager } from './products-manager'
import { ProductEditor } from './product-editor'
import { PagesManager } from './pages-manager'
import { PageEditor } from './page-editor'
import { Loader2 } from 'lucide-react'

export function AdminApp() {
  const { adminView, editingPostId, setAdminView } = useApp()
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    api.auth.me().then(({ user }) => {
      setUser(user)
      // If already authenticated, make sure we land on the dashboard (not the login view).
      if (user) setAdminView('dashboard')
    }).finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return <AdminLogin onSuccess={(u) => { setUser(u); setAdminView('dashboard') }} />

  return (
    <AdminShell>
      {adminView === 'dashboard' && <Dashboard />}
      {adminView === 'posts' && <PostsManager />}
      {adminView === 'editor' && <PostEditor postId={editingPostId} />}
      {adminView === 'categories' && <CategoriesManager />}
      {adminView === 'media' && <MediaManager />}
      {adminView === 'comments' && <CommentsManager />}
      {adminView === 'settings' && <SettingsManager />}
      {adminView === 'products' && <ProductsManager />}
      {adminView === 'productEditor' && <ProductEditor productId={editingPostId} />}
      {adminView === 'pages' && <PagesManager />}
      {adminView === 'pageEditor' && <PageEditor pageId={editingPostId} />}
    </AdminShell>
  )
}
