'use client'

import { useState } from 'react'
import { useSettings } from './settings-context'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Mail, Send, Check } from 'lucide-react'

export function Newsletter() {
  const { settings } = useSettings()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (!email) return
    try {
      await api.subscribers.create(email)
      setDone(true)
      toast.success('You are on the list. See you Sunday.')
      setEmail('')
    } catch {
      toast.error('Could not subscribe. Try again.')
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-foreground text-background px-6 py-10 md:px-16 md:py-16">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs uppercase tracking-wider mb-4">
              <Mail className="h-3 w-3" /> Newsletter
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
              {settings?.newsletterTitle || 'The Sunday Lumen'}
            </h2>
            <p className="mt-3 text-background/70 max-w-md">
              {settings?.newsletterText || 'A weekly letter with our best stories, reading lists and slow-living rituals.'}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {done ? (
              <div className="flex items-center gap-3 rounded-xl bg-background/10 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">You are subscribed.</p>
                  <p className="text-sm text-background/60">Look out for the next letter on Sunday morning.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    className="bg-background/10 border-background/20 text-background placeholder:text-background/50 h-12"
                  />
                  <Button onClick={submit} size="lg" className="h-12 px-6">
                    Subscribe <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-background/50">No spam. Unsubscribe anytime.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
