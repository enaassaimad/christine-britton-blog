'use client'

import { create } from 'zustand'
import { routeToUrl, urlToRoute } from '@/lib/url-router'

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

  /** Called by the popstate listener / on mount to sync from URL */
  syncFromUrl: () => void
}

function pushUrl(route: Route) {
  if (typeof window === 'undefined') return
  const url = routeToUrl(route)
  if (window.location.pathname + window.location.search !== url) {
    window.history.pushState({ route }, '', url)
  }
}

function scrollToTop() {
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
}

export const useApp = create<AppState>((set, get) => ({
  route: { name: 'home' },
  adminOpen: false,
  adminView: 'dashboard',
  editingPostId: null,
  searchOpen: false,

  navigate: (route) => {
    set({ route })
    pushUrl(route)
    scrollToTop()
  },
  openPost: (slug) => {
    const route = { name: 'post' as const, slug }
    set({ route })
    pushUrl(route)
    scrollToTop()
  },
  openCategory: (slug) => {
    const route = { name: 'category' as const, slug }
    set({ route })
    pushUrl(route)
    scrollToTop()
  },
  openSearch: (q) => {
    if (q) {
      const route = { name: 'search' as const, q }
      set({ route, searchOpen: true })
      pushUrl(route)
    } else {
      set({ route: { name: 'blog' }, searchOpen: true })
      pushUrl({ name: 'blog' })
    }
    scrollToTop()
  },
  setSearchOpen: (open) => set({ searchOpen: open }),
  openProduct: (slug) => {
    const route = { name: 'product' as const, slug }
    set({ route })
    pushUrl(route)
    scrollToTop()
  },
  openPage: (slug) => {
    const route = { name: 'page' as const, slug }
    set({ route })
    pushUrl(route)
    scrollToTop()
  },

  openAdmin: (view = 'dashboard') => set({ adminOpen: true, adminView: view }),
  closeAdmin: () => set({ adminOpen: false, editingPostId: null }),
  setAdminView: (view) => set({ adminView: view, editingPostId: null }),
  editPost: (id) => set({ editingPostId: id, adminView: 'editor' }),
  editProduct: (id) => set({ editingPostId: id, adminView: 'productEditor' }),
  editPage: (id) => set({ editingPostId: id, adminView: 'pageEditor' }),

  syncFromUrl: () => {
    if (typeof window === 'undefined') return
    const { route, admin } = urlToRoute(window.location.pathname, window.location.search)
    set({ route, adminOpen: admin ? true : get().adminOpen })
    // If visiting /admin directly and not authenticated, the AdminApp will show login
    if (admin) {
      set({ adminOpen: true, adminView: 'login' })
      // Clean the URL to / so the admin overlay isn't tied to the path
      if (window.location.pathname === '/admin') {
        window.history.replaceState(null, '', '/')
      }
    }
  },
}))
