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
  const { adminOpen, route, openAdmin, closeAdmin } = useApp()

  // Secret URL-based admin access: visit /#admin to open the admin panel
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.toLowerCase()
      if (hash === '#admin' || hash.startsWith('#admin/')) {
        openAdmin('login')
        // Clean the hash so it doesn't reopen on refresh (admin session is cookie-based)
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname)
        }
      }
    }
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [openAdmin])

  // Update document title based on route
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const base = 'Christine Britton'
      if (route.name === 'home') document.title = `${base} — Fluid Art, Resin Art & Creative Drawing Tutorials`
      else if (route.name === 'post') document.title = `${base}`
      else if (route.name === 'blog') document.title = `${base} — All Tutorials`
      else if (route.name === 'about') document.title = `${base} — About`
      else if (route.name === 'contact') document.title = `${base} — Contact`
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
