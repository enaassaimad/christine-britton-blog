'use client'

import { useSettings } from '@/components/site/settings-context'
import { useApp } from '@/store/app-store'
import { Newsletter } from '@/components/site/newsletter'
import { AdSlot } from '@/components/site/ad-slot'
import { Button } from '@/components/ui/button'
import { Mail, MapPin, Twitter, Instagram, Facebook, Linkedin, Quote } from 'lucide-react'

export function AboutView() {
  const { settings } = useSettings()
  const { navigate } = useApp()

  const stats = [
    { label: 'Articles published', value: '120+' },
    { label: 'Monthly readers', value: '48k' },
    { label: 'Years writing', value: '6' },
    { label: 'Sunday letters sent', value: '312' },
  ]

  const socials = [
    { icon: Twitter, label: 'Twitter', handle: settings?.twitter },
    { icon: Instagram, label: 'Instagram', handle: settings?.instagram },
    { icon: Facebook, label: 'Facebook', handle: settings?.facebook },
    { icon: Linkedin, label: 'LinkedIn', handle: settings?.linkedin },
  ].filter((s) => s.handle)

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">About the journal</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            {settings?.aboutTitle || 'About Lumen Journal'}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {settings?.description}
          </p>
        </div>
      </section>

      {/* Story + image */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="relative">
            {settings?.aboutImage && (
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
                <img src={settings.aboutImage} alt="About" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="absolute -bottom-5 -right-5 hidden md:block rounded-2xl bg-foreground text-background p-5 max-w-[220px]">
              <Quote className="h-5 w-5 mb-2 text-primary" />
              <p className="font-display text-sm leading-snug">A good life is built from small, intentional choices.</p>
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Our story</h2>
            <div className="mt-5 space-y-4 text-muted-foreground leading-relaxed">
              {(settings?.aboutContent || '').split('\n').filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={`https://${s.label.toLowerCase()}.com/${s.label === 'LinkedIn' ? 'in/' : ''}${s.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <s.icon className="h-4 w-4" /> {s.handle}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl md:text-5xl font-semibold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-center">What we believe</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Honesty over hype', text: 'No clickbait, no sponsored secrets. If we recommend something, we have used it and paid for it ourselves.' },
            { title: 'Slow over fast', text: 'We publish less, and think more. A story is ready when it is ready, not when the calendar says.' },
            { title: 'Useful over clever', text: 'A good piece leaves you with something you can use — a recipe, a ritual, a book, a question worth keeping.' },
          ].map((v, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="font-display text-5xl font-semibold text-primary/30 mb-2">0{i + 1}</div>
              <h3 className="font-display text-xl font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6">
        <AdSlot slot="inArticle" label="Advertisement" />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Want to say hello?</h2>
        <p className="mt-3 text-muted-foreground">We read every email. Pitch us a story, or just tell us what you are reading.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => navigate({ name: 'contact' })}>Get in touch</Button>
          {settings?.email && (
            <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent">
              <Mail className="h-4 w-4" /> {settings.email}
            </a>
          )}
        </div>
      </section>

      <Newsletter />
    </div>
  )
}
