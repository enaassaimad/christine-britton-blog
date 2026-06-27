'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/store/app-store'
import { useSettings } from './settings-context'
import { api } from '@/lib/api'
import type { Page } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Twitter, Instagram, Facebook, Linkedin, Youtube, Mail, MapPin, Send, Shield } from 'lucide-react'

export function Footer() {
  const { settings } = useSettings()
  const { navigate, openCategory, openAdmin, openPage } = useApp()
  const [email, setEmail] = useState('')
  const [pages, setPages] = useState<Page[]>([])

  useEffect(() => {
    let active = true
    api.pages.list().then(({ pages }) => {
      if (active) setPages(pages.filter((p) => p.showInFooter).sort((a, b) => a.order - b.order))
    }).catch(() => {})
    return () => { active = false }
  }, [])

  const onSubscribe = async () => {
    if (!email) return
    try {
      await api.subscribers.create(email)
      toast.success('Welcome aboard! Check your inbox for a confirmation.')
      setEmail('')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  const socials = [
    { icon: Twitter, url: settings?.twitter ? `https://twitter.com/${settings.twitter}` : null, label: 'Twitter' },
    { icon: Instagram, url: settings?.instagram ? `https://instagram.com/${settings.instagram}` : null, label: 'Instagram' },
    { icon: Facebook, url: settings?.facebook ? `https://facebook.com/${settings.facebook}` : null, label: 'Facebook' },
    { icon: Linkedin, url: settings?.linkedin ? `https://linkedin.com/in/${settings.linkedin}` : null, label: 'LinkedIn' },
    { icon: Youtube, url: settings?.youtube ? `https://youtube.com/@${settings.youtube}` : null, label: 'YouTube' },
  ].filter((s) => s.url)

  return (
    <footer className="mt-auto border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <button onClick={() => navigate({ name: 'home' })} className="font-display text-2xl font-semibold tracking-tight">
              {settings?.siteName || 'Lumen Journal'}
            </button>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm leading-relaxed">
              {settings?.description || 'An independent editorial magazine exploring the art of living well.'}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  aria-label={s.label}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li><button className="hover:text-primary transition-colors" onClick={() => navigate({ name: 'home' })}>Home</button></li>
              <li><button className="hover:text-primary transition-colors" onClick={() => navigate({ name: 'blog' })}>All Articles</button></li>
              <li><button className="hover:text-primary transition-colors" onClick={() => navigate({ name: 'about' })}>About</button></li>
              <li><button className="hover:text-primary transition-colors" onClick={() => navigate({ name: 'shop' })}>Shop</button></li>
              <li><button className="hover:text-primary transition-colors" onClick={() => navigate({ name: 'contact' })}>Contact</button></li>
              <li><button className="hover:text-primary transition-colors" onClick={() => openAdmin('login')}><span className="inline-flex items-center gap-1"><Shield className="h-3 w-3" />Admin</span></button></li>
            </ul>
          </div>

          {/* Legal */}
          {pages.length > 0 && (
            <div className="md:col-span-2">
              <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm">
                {pages.map((p) => (
                  <li key={p.id}><button className="hover:text-primary transition-colors" onClick={() => openPage(p.slug)}>{p.title}</button></li>
                ))}
              </ul>
            </div>
          )}

          {/* Newsletter mini */}
          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              {settings?.newsletterTitle || 'The Sunday Letter'}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">{settings?.newsletterText}</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSubscribe()}
                className="bg-background"
              />
              <Button onClick={onSubscribe} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>{settings?.footerText || `© ${new Date().getFullYear()} ${settings?.siteName || 'Lumen Journal'}.`}</p>
          <div className="flex items-center gap-4">
            {settings?.email && <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-1 hover:text-foreground"><Mail className="h-3 w-3" />{settings.email}</a>}
            {settings?.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{settings.location}</span>}
          </div>
        </div>
      </div>
    </footer>
  )
}
