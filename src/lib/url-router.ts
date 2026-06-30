import type { Route } from '@/store/app-store'

/**
 * WordPress-style URL routing.
 * URL structure:
 *   /                          → home
 *   /blog                      → all articles (optional ?q= for search)
 *   /about                     → about
 *   /contact                   → contact
 *   /shop                      → shop
 *   /article/{slug}            → single post
 *   /category/{slug}           → category listing
 *   /product/{slug}            → digital product
 *   /page/{slug}               → legal/custom page
 *   /admin                     → admin panel
 */

export function urlToRoute(pathname: string, search: string): { route: Route; admin: boolean } {
  const parts = pathname.split('/').filter(Boolean)

  if (parts.length === 0) return { route: { name: 'home' }, admin: false }

  switch (parts[0]) {
    case 'blog': {
      const params = new URLSearchParams(search)
      const q = params.get('q')
      if (q) return { route: { name: 'search', q }, admin: false }
      return { route: { name: 'blog' }, admin: false }
    }
    case 'about':
      return { route: { name: 'about' }, admin: false }
    case 'contact':
      return { route: { name: 'contact' }, admin: false }
    case 'shop':
      return { route: { name: 'shop' }, admin: false }
    case 'article':
      if (parts[1]) return { route: { name: 'post', slug: parts[1] }, admin: false }
      return { route: { name: 'blog' }, admin: false }
    case 'category':
      if (parts[1]) return { route: { name: 'category', slug: parts[1] }, admin: false }
      return { route: { name: 'home' }, admin: false }
    case 'product':
      if (parts[1]) return { route: { name: 'product', slug: parts[1] }, admin: false }
      return { route: { name: 'shop' }, admin: false }
    case 'page':
      if (parts[1]) return { route: { name: 'page', slug: parts[1] }, admin: false }
      return { route: { name: 'home' }, admin: false }
    case 'admin':
      return { route: { name: 'home' }, admin: true }
    default:
      return { route: { name: 'home' }, admin: false }
  }
}

export function routeToUrl(route: Route): string {
  switch (route.name) {
    case 'home': return '/'
    case 'blog': return '/blog'
    case 'about': return '/about'
    case 'contact': return '/contact'
    case 'shop': return '/shop'
    case 'post': return `/article/${route.slug}`
    case 'category': return `/category/${route.slug}`
    case 'product': return `/product/${route.slug}`
    case 'page': return `/page/${route.slug}`
    case 'search': return `/blog?q=${encodeURIComponent(route.q)}`
    default: return '/'
  }
}
