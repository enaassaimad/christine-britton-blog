'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/store/app-store'
import { useSettings } from './settings-context'
import { api } from '@/lib/api'
import type { Category } from '@/lib/types'
import { Search, Menu, X, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CategoryIcon } from '@/lib/category-icons'
import { cn } from '@/lib/utils'

export function Header() {
  const { navigate, route, openSearch } = useApp()
  const { settings } = useSettings()
  const [categories, setCategories] = useState<Category[]>([])
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    api.categories.list().then(({ categories }) => setCategories(categories)).catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems: { label: string; action: () => void; active: boolean }[] = [
    { label: 'Home', action: () => navigate({ name: 'home' }), active: route.name === 'home' },
    { label: 'Articles', action: () => navigate({ name: 'blog' }), active: route.name === 'blog' || route.name === 'search' },
    { label: 'About', action: () => navigate({ name: 'about' }), active: route.name === 'about' },
    { label: 'Shop', action: () => navigate({ name: 'shop' }), active: route.name === 'shop' },
    { label: 'Contact', action: () => navigate({ name: 'contact' }), active: route.name === 'contact' },
  ]

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <header className="sticky top-0 z-40">
      {/* Top utility bar */}
      <div className="hidden md:block border-b border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between py-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Sun className="h-3 w-3" /> {today}</span>
          <div className="flex items-center gap-4">
            {settings?.location && <span>{settings.location}</span>}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className={cn('border-b border-border/60 bg-background/85 backdrop-blur-md transition-shadow', scrolled && 'shadow-sm')}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl">{settings?.siteName || 'Lumen'}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { item.action(); setMobileOpen(false) }}
                      className={cn('text-left px-3 py-2.5 rounded-md text-base hover:bg-accent', item.active && 'text-primary')}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <p className="px-3 text-xs uppercase tracking-wider text-muted-foreground mb-2">Categories</p>
                  <div className="flex flex-col gap-1">
                    {categories.map((c) => {
                      return (
                        <button
                          key={c.id}
                          onClick={() => { useApp.getState().openCategory(c.slug); setMobileOpen(false) }}
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent"
                        >
                          <CategoryIcon name={c.icon} className="h-4 w-4" style={{ color: c.color || undefined }} />
                          {c.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="mt-6">
                  <Button onClick={() => { openSearch(); setMobileOpen(false) }} variant="outline" className="w-full">
                    <Search className="h-4 w-4 mr-2" /> Search articles
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <button onClick={() => navigate({ name: 'home' })} className="flex flex-col items-center md:items-start">
              <span className="font-display text-2xl md:text-3xl font-semibold tracking-tight leading-none">
                {settings?.siteName || 'Lumen Journal'}
              </span>
              <span className="hidden md:block text-[11px] uppercase tracking-[0.25em] text-muted-foreground mt-1">
                {settings?.tagline || 'Stories, ideas & thoughtful living'}
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary',
                    item.active ? 'text-primary' : 'text-foreground/80'
                  )}
                >
                  {item.label}
                  {item.active && <span className="absolute -bottom-px left-3 right-3 h-0.5 bg-primary rounded-full" />}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Search" onClick={() => openSearch()}>
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category strip — desktop */}
        <div className="border-t border-border/40 hidden md:block">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center gap-6 h-10 overflow-x-auto scroll-lumen">
              {categories.map((c) => {
                const active = route.name === 'category' && route.slug === c.slug
                return (
                  <button
                    key={c.id}
                    onClick={() => useApp.getState().openCategory(c.slug)}
                    className={cn(
                      'inline-flex items-center gap-1.5 whitespace-nowrap text-xs uppercase tracking-wider transition-colors hover:text-primary',
                      active ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <CategoryIcon name={c.icon} className="h-3.5 w-3.5" style={{ color: c.color || undefined }} />
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Category strip — mobile (horizontal scroll) */}
        <div className="md:hidden border-t border-border/40 bg-background/85 backdrop-blur-md">
          <div className="flex items-center gap-4 h-10 overflow-x-auto scroll-lumen px-4">
            {categories.map((c) => {
              const active = route.name === 'category' && route.slug === c.slug
              return (
                <button
                  key={c.id}
                  onClick={() => useApp.getState().openCategory(c.slug)}
                  className={cn(
                    'inline-flex items-center gap-1 whitespace-nowrap text-[11px] uppercase tracking-wider transition-colors',
                    active ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}
                >
                  <CategoryIcon name={c.icon} className="h-3 w-3" style={{ color: c.color || undefined }} />
                  {c.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
