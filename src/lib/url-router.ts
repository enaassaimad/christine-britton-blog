// URL <-> Route mapper.
//
// The app uses a single Next.js page (`/`) with a Zustand store for client
// navigation, but we also want shareable, deep-linkable URLs. This module
// converts between browser URL paths and the in-app `Route` type.

import type { Route } from '@/store/app-store'

export interface ParsedUrl {
  route: Route
  admin: boolean
}

/**
 * Parse a browser pathname + search string into an in-app route.
 *
 * Recognised patterns:
 *   /                          → home
 *   /blog                      → blog
 *   /blog?q=foo                → search
 *   /about                     → about
 *   /contact                   → contact
 *   /shop                      → shop
 *   /article/{slug}            → post
 *   /category/{slug}           → category
 *   /product/{slug}            → product
 *   /page/{slug}               → page
 *   /admin                     → home with admin=true (admin overlay opens)
 */
export function urlToRoute(pathname: string, search: string = ''): ParsedUrl {
  const path = (pathname || '/').replace(/\/+$/, '') || '/'
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)

  // Admin overlay — the public site stays on / underneath
  if (path === '/admin') {
    return { route: { name: 'home' }, admin: true }
  }

  if (path === '/' || path === '') {
    return { route: { name: 'home' }, admin: false }
  }
  if (path === '/blog') {
    const q = params.get('q')
    if (q) return { route: { name: 'search', q }, admin: false }
    return { route: { name: 'blog' }, admin: false }
  }
  if (path === '/about') return { route: { name: 'about' }, admin: false }
  if (path === '/contact') return { route: { name: 'contact' }, admin: false }
  if (path === '/shop') return { route: { name: 'shop' }, admin: false }

  const segs = path.split('/').filter(Boolean)
  if (segs.length === 2) {
    const [prefix, slug] = segs
    if (prefix === 'article') return { route: { name: 'post', slug }, admin: false }
    if (prefix === 'category') return { route: { name: 'category', slug }, admin: false }
    if (prefix === 'product') return { route: { name: 'product', slug }, admin: false }
    if (prefix === 'page') return { route: { name: 'page', slug }, admin: false }
  }

  // Unknown paths fall back to home so the SPA never 404s internally.
  return { route: { name: 'home' }, admin: false }
}

/**
 * Convert an in-app route back to a browser URL path (with optional query).
 * Returns a path string suitable for `window.history.pushState`.
 */
export function routeToUrl(route: Route): string {
  switch (route.name) {
    case 'home':
      return '/'
    case 'blog':
      return '/blog'
    case 'search':
      return `/blog?q=${encodeURIComponent(route.q)}`
    case 'about':
      return '/about'
    case 'contact':
      return '/contact'
    case 'shop':
      return '/shop'
    case 'post':
      return `/article/${route.slug}`
    case 'category':
      return `/category/${route.slug}`
    case 'product':
      return `/product/${route.slug}`
    case 'page':
      return `/page/${route.slug}`
    default:
      return '/'
  }
}
