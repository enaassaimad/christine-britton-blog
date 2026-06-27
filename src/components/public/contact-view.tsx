'use client'

import { useState } from 'react'
import { useSettings } from '@/components/site/settings-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Mail, MapPin, Send, Clock, Twitter, Instagram, Facebook } from 'lucide-react'

export function ContactView() {
  const { settings } = useSettings()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please complete the required fields.')
      return
    }
    setSending(true)
    // Simulate send (no backend email integration in this demo)
    await new Promise((r) => setTimeout(r, 800))
    setSending(false)
    toast.success('Message received. We will reply within a few days.')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  const socials = [
    { icon: Twitter, label: 'Twitter', handle: settings?.twitter },
    { icon: Instagram, label: 'Instagram', handle: settings?.instagram },
    { icon: Facebook, label: 'Facebook', handle: settings?.facebook },
  ].filter((s) => s.handle)

  return (
    <div className="animate-fade-up mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-20">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Contact</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Let's start a conversation
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-md">
            Questions, story pitches, corrections or just hello — we would love to hear from you.
          </p>

          <div className="mt-10 space-y-5">
            {settings?.email && (
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                  <a href={`mailto:${settings.email}`} className="font-medium hover:text-primary">{settings.email}</a>
                </div>
              </div>
            )}
            {settings?.location && (
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Studio</p>
                  <p className="font-medium">{settings.location}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Reply time</p>
                <p className="font-medium">Within 2–3 business days</p>
              </div>
            </div>
          </div>

          {socials.length > 0 && (
            <div className="mt-10">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Find us online</p>
              <div className="flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={`https://${s.label.toLowerCase()}.com/${s.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                    aria-label={s.label}
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What is this about?" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Message *</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more…" rows={6} />
            </div>
            <Button type="submit" size="lg" disabled={sending} className="w-full sm:w-auto">
              {sending ? 'Sending…' : <>Send message <Send className="ml-2 h-4 w-4" /></>}
            </Button>
            <p className="text-xs text-muted-foreground">By sending, you agree to our friendly privacy practices. We never share your email.</p>
          </div>
        </form>
      </div>
    </div>
  )
}
