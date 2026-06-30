'use client'

import { useEffect } from 'react'
import { useApp } from '@/store/app-store'
import { SettingsProvider } from '@/components/site/settings-context'
import { Header } from '@/components/site/header'
import { Footer } from '@/components/site/footer'
import { SearchDialog } from '@/components/site/search-dialog'
import { HomeView } from '@/components/public/home-view'
import { PostView } from '@/components/public/post-view'
import { CategoryView } from '@/components/public/category-view'
import { BlogView } from '@/components/public/blog-view'
import { AboutView } from '@/components/public/about-view'
import { ContactView } from '@/components/public/contact-view'
import { ShopView } from '@/components/public/shop-view'
import { ProductView } from '@/components/public/product-view'
import { PageView } from '@/components/public/page-view'
import { AdminApp } from '@/components/admin/admin-app'

function PublicSite() {
  const { route } = useApp()
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {route.name === 'home' && <HomeView />}
        {route.name === 'post' && <PostView slug={route.slug} />}
        {route.name === 'category' && <CategoryView slug={route.slug} />}
        {route.name === 'blog' && <BlogView />}
        {route.name === 'search' && <BlogView initialQuery={route.q} />}
        {route.name === 'about' && <AboutView />}
        {route.name === 'contact' && <ContactView />}
        {route.name === 'shop' && <ShopView />}
        {route.name === 'product' && <ProductView slug={route.slug} />}
        {route.name === 'page' && <PageView slug={route.slug} />}
      </main>
      <Footer />
    </div>
  )
}

function Shell() {
  const { adminOpen, route, syncFromUrl } = useApp()

  // On first mount: parse the URL to determine the route (handles direct visits / refreshes)
  useEffect(() => {
    syncFromUrl()
  }, [syncFromUrl])

  // Listen to browser back/forward (popstate) — re-sync the route from the URL
  useEffect(() => {
    const onPopState = () => syncFromUrl()
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [syncFromUrl])

  // Update document title based on route
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const base = 'Christine Britton'
      if (route.name === 'home') document.title = `${base} — Fluid Art, Resin Art & Creative Drawing Tutorials`
      else if (route.name === 'post') document.title = `${base}`
      else if (route.name === 'blog') document.title = `${base} — All Tutorials`
      else if (route.name === 'about') document.title = `${base} — About`
      else if (route.name === 'contact') document.title = `${base} — Contact`
      else if (route.name === 'shop') document.title = `${base} — Shop`
      else if (route.name === 'product') document.title = `${base} — Shop`
      else if (route.name === 'page') document.title = `${base} — ${route.slug.replace(/-/g, ' ')}`
    }
  }, [route])

  return (
    <>
      <PublicSite />
      <SearchDialog />
      {adminOpen && <AdminApp />}
    </>
  )
}

export default function Home() {
  return (
    <SettingsProvider>
      <Shell />
    </SettingsProvider>
  )
}
