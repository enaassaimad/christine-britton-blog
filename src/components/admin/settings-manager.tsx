'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { SiteSetting } from '@/lib/types'
import { useSettings } from '@/components/site/settings-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2, Megaphone, Globe, Palette, Mail, User, Image as ImageIcon, Wand2 } from 'lucide-react'
import { toast } from 'sonner'

export function SettingsManager() {
  const { refresh } = useSettings()
  const [s, setS] = useState<SiteSetting | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.settings.get().then(({ setting }) => setS(setting)).finally(() => setLoading(false))
  }, [])

  const update = (patch: Partial<SiteSetting>) => setS((p) => p ? { ...p, ...patch } : p)

  const save = async () => {
    if (!s) return
    setSaving(true)
    try {
      await api.settings.update(s)
      await refresh()
      toast.success('Settings saved.')
    } catch { toast.error('Could not save settings.') } finally { setSaving(false) }
  }

  if (loading || !s) {
    return <div className="p-12 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Site settings</h2>
          <p className="text-sm text-muted-foreground">Manage branding, AdSense, social links and more.</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
          Save changes
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="general"><Globe className="h-3.5 w-3.5 mr-1.5" /> General</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="h-3.5 w-3.5 mr-1.5" /> Branding</TabsTrigger>
          <TabsTrigger value="about"><User className="h-3.5 w-3.5 mr-1.5" /> About</TabsTrigger>
          <TabsTrigger value="adsense"><Megaphone className="h-3.5 w-3.5 mr-1.5" /> AdSense</TabsTrigger>
          <TabsTrigger value="social"><Mail className="h-3.5 w-3.5 mr-1.5" /> Social</TabsTrigger>
          <TabsTrigger value="ai"><Wand2 className="h-3.5 w-3.5 mr-1.5" /> AI</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Publication</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Site name"><Input value={s.siteName} onChange={(e) => update({ siteName: e.target.value })} /></Field>
              <Field label="Tagline"><Input value={s.tagline} onChange={(e) => update({ tagline: e.target.value })} /></Field>
              <div className="md:col-span-2"><Field label="Description (used in meta & footer)"><Textarea value={s.description || ''} onChange={(e) => update({ description: e.target.value })} rows={3} /></Field></div>
              <Field label="Logo text (short)"><Input value={s.logoText || ''} onChange={(e) => update({ logoText: e.target.value })} /></Field>
              <Field label="Footer text"><Input value={s.footerText || ''} onChange={(e) => update({ footerText: e.target.value })} /></Field>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Contact & location</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Field label="Email"><Input value={s.email || ''} onChange={(e) => update({ email: e.target.value })} /></Field>
              <Field label="Phone"><Input value={s.phone || ''} onChange={(e) => update({ phone: e.target.value })} /></Field>
              <Field label="Location"><Input value={s.location || ''} onChange={(e) => update({ location: e.target.value })} /></Field>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Colors</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Primary color">
                <div className="flex gap-2">
                  <Input value={s.primaryColor} onChange={(e) => update({ primaryColor: e.target.value })} className="font-mono" />
                  <input type="color" value={s.primaryColor} onChange={(e) => update({ primaryColor: e.target.value })} className="h-10 w-12 rounded border border-border" />
                </div>
              </Field>
              <Field label="Accent color">
                <div className="flex gap-2">
                  <Input value={s.accentColor} onChange={(e) => update({ accentColor: e.target.value })} className="font-mono" />
                  <input type="color" value={s.accentColor} onChange={(e) => update({ accentColor: e.target.value })} className="h-10 w-12 rounded border border-border" />
                </div>
              </Field>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Logo & favicon</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Logo image URL (optional)"><Input value={s.logoUrl || ''} onChange={(e) => update({ logoUrl: e.target.value })} placeholder="/uploads/logo.png" /></Field>
              <Field label="Favicon URL (optional)"><Input value={s.faviconUrl || ''} onChange={(e) => update({ faviconUrl: e.target.value })} placeholder="/favicon.ico" /></Field>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">About page</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <Field label="About title"><Input value={s.aboutTitle || ''} onChange={(e) => update({ aboutTitle: e.target.value })} /></Field>
              <Field label="About content (paragraphs separated by line breaks)"><Textarea value={s.aboutContent || ''} onChange={(e) => update({ aboutContent: e.target.value })} rows={8} /></Field>
              <Field label="About image URL"><Input value={s.aboutImage || ''} onChange={(e) => update({ aboutImage: e.target.value })} /></Field>
              <Field label="Newsletter title"><Input value={s.newsletterTitle || ''} onChange={(e) => update({ newsletterTitle: e.target.value })} /></Field>
              <Field label="Newsletter text"><Textarea value={s.newsletterText || ''} onChange={(e) => update({ newsletterText: e.target.value })} rows={2} /></Field>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AdSense */}
        <TabsContent value="adsense" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> AdSense configuration</CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Ads enabled</Label>
                <Switch checked={s.adsEnabled} onCheckedChange={(v) => update({ adsEnabled: v })} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
                <p className="font-medium mb-1">AdSense-ready layout</p>
                <p className="text-amber-800/80">Your site displays clearly-labelled ad placeholders in header, in-article, sidebar and footer positions. Once your AdSense account is approved, paste your client ID and slot IDs below — the placeholders become live ads automatically. Leave the client ID as the placeholder value to keep showing demo placeholders.</p>
              </div>
              <Field label="AdSense client ID" hint="Format: ca-pub-XXXXXXXXXXXXXXXX">
                <Input value={s.adsenseClient || ''} onChange={(e) => update({ adsenseClient: e.target.value })} placeholder="ca-pub-0000000000000000" className="font-mono" />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Header slot ID"><Input value={s.adsenseSlotHeader || ''} onChange={(e) => update({ adsenseSlotHeader: e.target.value })} className="font-mono" /></Field>
                <Field label="In-article slot ID"><Input value={s.adsenseSlotInArticle || ''} onChange={(e) => update({ adsenseSlotInArticle: e.target.value })} className="font-mono" /></Field>
                <Field label="In-content slot ID"><Input value={s.adsenseSlotInContent || ''} onChange={(e) => update({ adsenseSlotInContent: e.target.value })} className="font-mono" /></Field>
                <Field label="Sidebar slot ID"><Input value={s.adsenseSlotSidebar || ''} onChange={(e) => update({ adsenseSlotSidebar: e.target.value })} className="font-mono" /></Field>
                <Field label="Footer slot ID"><Input value={s.adsenseSlotFooter || ''} onChange={(e) => update({ adsenseSlotFooter: e.target.value })} className="font-mono" /></Field>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-sm">
                <p className="font-medium mb-2 flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Ad placement preview</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {[['Header', s.adsenseSlotHeader], ['In-article', s.adsenseSlotInArticle], ['In-content', s.adsenseSlotInContent], ['Sidebar', s.adsenseSlotSidebar], ['Footer', s.adsenseSlotFooter]].map(([label, slot]) => (
                    <div key={label} className="rounded border border-dashed border-border p-2 text-center">
                      <p className="font-medium">{label}</p>
                      <p className="text-muted-foreground font-mono mt-0.5">{slot || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Social links</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Twitter handle" hint="without @"><Input value={s.twitter || ''} onChange={(e) => update({ twitter: e.target.value })} placeholder="lumenjournal" /></Field>
              <Field label="Instagram handle"><Input value={s.instagram || ''} onChange={(e) => update({ instagram: e.target.value })} placeholder="lumenjournal" /></Field>
              <Field label="Facebook page"><Input value={s.facebook || ''} onChange={(e) => update({ facebook: e.target.value })} placeholder="lumenjournal" /></Field>
              <Field label="LinkedIn (username or page)"><Input value={s.linkedin || ''} onChange={(e) => update({ linkedin: e.target.value })} /></Field>
              <Field label="Pinterest"><Input value={s.pinterest || ''} onChange={(e) => update({ pinterest: e.target.value })} /></Field>
              <Field label="YouTube channel"><Input value={s.youtube || ''} onChange={(e) => update({ youtube: e.target.value })} /></Field>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" /> AI Post Generator</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm">
                <p className="font-medium text-primary mb-1">GLM AI Integration</p>
                <p className="text-muted-foreground text-xs">The AI post generator uses GLM (via z-ai-web-dev-sdk) to create SEO-optimized articles with a focus keyword, related keywords, external links, and an AI-generated cover image. The built-in SEO scorer ensures each article scores 88%+ before publishing.</p>
              </div>
              <Field label="API Key (optional)" hint="leave blank to use the built-in SDK">
                <Input value={s.aiApiKey || ''} onChange={(e) => update({ aiApiKey: e.target.value })} placeholder="auto-configured" className="font-mono" type="password" />
              </Field>
              <Field label="Model">
                <Input value={s.aiModel || ''} onChange={(e) => update({ aiModel: e.target.value })} placeholder="glm-5.2" className="font-mono" />
              </Field>
              <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">How to use:</p>
                <ol className="list-decimal ml-4 space-y-0.5">
                  <li>Go to <strong>Articles → AI Generate</strong></li>
                  <li>Enter your focus keyword and related keywords</li>
                  <li>Choose a category and tone</li>
                  <li>Click <strong>Generate article</strong> — AI writes 700+ words with external links and generates a cover image</li>
                  <li>Review the SEO score (target: 88%+) and content preview</li>
                  <li>Click <strong>Use this article</strong> — a draft is created in the editor for you to review and publish</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}{hint && <span className="ml-1 text-muted-foreground/60">({hint})</span>}</Label>
      <div className="mt-1">{children}</div>
    </div>
  )
}
