'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { User } from '@/lib/types'
import { useApp, type AdminView } from '@/store/app-store'
import { useSettings } from '@/components/site/settings-context'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard, FileText, FolderTree, ImageIcon, MessageSquare,
  Settings, LogOut, X, ExternalLink, PenSquare, ChevronRight,
  ShoppingBag, BookMarked,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const NAV: { view: AdminView; label: string; icon: any }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'posts', label: 'Articles', icon: FileText },
  { view: 'products', label: 'Products', icon: ShoppingBag },
  { view: 'categories', label: 'Categories', icon: FolderTree },
  { view: 'pages', label: 'Pages', icon: BookMarked },
  { view: 'media', label: 'Media', icon: ImageIcon },
  { view: 'comments', label: 'Comments', icon: MessageSquare },
  { view: 'settings', label: 'Settings', icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { adminView, setAdminView, closeAdmin, editPost } = useApp()
  const { settings, refresh } = useSettings()
  const [user, setUser] = useState<User | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    api.auth.me().then(({ user }) => setUser(user))
    refresh()
  }, [refresh])

  const logout = async () => {
    await api.auth.logout()
    toast.success('Signed out.')
    closeAdmin()
  }

  const currentLabel = NAV.find((n) => n.view === (adminView === 'editor' ? 'posts' : adminView))?.label || 'Dashboard'

  return (
    <div className="fixed inset-0 z-50 flex bg-background">
      {/* Sidebar */}
      <aside className={cn('hidden md:flex flex-col border-r border-border bg-secondary/30 transition-all', collapsed ? 'w-16' : 'w-64')}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {!collapsed && (
            <span className="font-display text-lg font-semibold tracking-tight truncate">
              {settings?.siteName || 'Lumen'}
            </span>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground p-1">
            <ChevronRight className={cn('h-4 w-4 transition-transform', !collapsed && 'rotate-180')} />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV.map((item) => {
            const active = adminView === item.view || (item.view === 'posts' && adminView === 'editor') || (item.view === 'products' && adminView === 'productEditor') || (item.view === 'pages' && adminView === 'pageEditor')
            return (
              <button
                key={item.view}
                onClick={() => setAdminView(item.view)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                title={item.label}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            )
          })}
        </nav>
        <div className="p-2 border-t border-border space-y-1">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold text-primary">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button onClick={logout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground" title="Sign out">
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <button onClick={closeAdmin} className="md:hidden p-2 -ml-2" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <h1 className="font-display text-xl font-semibold tracking-tight">{currentLabel}</h1>
            {adminView === 'posts' && (
              <Button size="sm" onClick={() => editPost(null)} className="ml-2">
                <PenSquare className="h-4 w-4 mr-1.5" /> New
              </Button>
            )}
            {adminView === 'products' && (
              <Button size="sm" onClick={() => useApp.getState().editProduct(null)} className="ml-2">
                <PenSquare className="h-4 w-4 mr-1.5" /> New
              </Button>
            )}
            {adminView === 'pages' && (
              <Button size="sm" onClick={() => useApp.getState().editPage(null)} className="ml-2">
                <PenSquare className="h-4 w-4 mr-1.5" /> New
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={closeAdmin}>
              <ExternalLink className="h-4 w-4 mr-1.5" /> View site
            </Button>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden border-b border-border bg-secondary/30 overflow-x-auto scroll-lumen">
          <div className="flex gap-1 p-2 min-w-max">
            {NAV.map((item) => {
              const active = adminView === item.view || (item.view === 'posts' && adminView === 'editor') || (item.view === 'products' && adminView === 'productEditor') || (item.view === 'pages' && adminView === 'pageEditor')
              return (
                <button
                  key={item.view}
                  onClick={() => setAdminView(item.view)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap',
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto scroll-lumen bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
