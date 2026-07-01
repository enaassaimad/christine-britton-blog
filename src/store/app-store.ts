'use client'

import { create } from 'zustand'

export type Route =
  | { name: 'home' }
  | { name: 'post'; slug: string }
  | { name: 'category'; slug: string }
  | { name: 'blog' }
  | { name: 'about' }
  | { name: 'contact' }
  | { name: 'search'; q: string }
  | { name: 'shop' }
  | { name: 'product'; slug: string }
  | { name: 'page'; slug: string }

export type AdminView =
  | 'login'
  | 'dashboard'
  | 'posts'
  | 'editor'
  | 'categories'
  | 'media'
  | 'comments'
  | 'settings'
  | 'products'
  | 'productEditor'
  | 'pages'
  | 'pageEditor'

interface AppState {
  route: Route
  adminOpen: boolean
  adminView: AdminView
  editingPostId: string | null
  searchOpen: boolean

  navigate: (route: Route) => void
  openPost: (slug: string) => void
  openCategory: (slug: string) => void
  openSearch: (q?: string) => void
  setSearchOpen: (open: boolean) => void
  openProduct: (slug: string) => void
  openPage: (slug: string) => void

  openAdmin: (view?: AdminView) => void
  closeAdmin: () => void
  setAdminView: (view: AdminView) => void
  editPost: (id: string | null) => void
  editProduct: (id: string | null) => void
  editPage: (id: string | null) => void
}

export const useApp = create<AppState>((set) => ({
  route: { name: 'home' },
  adminOpen: false,
  adminView: 'dashboard',
  editingPostId: null,
  searchOpen: false,

  navigate: (route) => {
    set({ route })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  },
  openPost: (slug) => {
    set({ route: { name: 'post', slug } })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  },
  openCategory: (slug) => {
    set({ route: { name: 'category', slug } })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  },
  openSearch: (q) => set({ route: q ? { name: 'search', q } : { name: 'blog' }, searchOpen: true }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  openProduct: (slug) => {
    set({ route: { name: 'product', slug } })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  },
  openPage: (slug) => {
    set({ route: { name: 'page', slug } })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  },

  openAdmin: (view = 'dashboard') => set({ adminOpen: true, adminView: view }),
  closeAdmin: () => set({ adminOpen: false, editingPostId: null }),
  setAdminView: (view) => set({ adminView: view, editingPostId: null }),
  editPost: (id) => set({ editingPostId: id, adminView: 'editor' }),
  editProduct: (id) => set({ editingPostId: id, adminView: 'productEditor' }),
  editPage: (id) => set({ editingPostId: id, adminView: 'pageEditor' }),
}))
