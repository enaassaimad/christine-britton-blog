'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Markdown } from '@/components/site/markdown'
import { Wand2, Loader2, Sparkles, X, Plus, Check, AlertCircle, FileText, Image as ImageIcon, TrendingUp, Eye } from 'lucide-react'
import { toast } from 'sonner'
import type { Category } from '@/lib/types'

interface GeneratedPost {
  title: string
  slug: string
  content: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  coverImage: string | null
  coverAlt: string
  tags: string
  focusKeyword: string
  relatedKeywords: string[]
  seoScore: {
    score: number
    passed: boolean
    checks: { label: string; passed: boolean; points: number; maxPoints: number; detail: string }[]
  }
  readMinutes: number
  wordCount: number
  imageGenerated?: boolean
  imagePrompt?: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onUse: (post: GeneratedPost) => void
}

const TONES = ['informative and engaging', 'casual and friendly', 'professional and authoritative', 'inspiring and creative', 'step-by-step tutorial']

export function AIPostGeneratorDialog({ open, onOpenChange, categories, onUse }: Props) {
  const [focusKeyword, setFocusKeyword] = useState('')
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([])
  const [relatedInput, setRelatedInput] = useState('')
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState(categories[0]?.id || '')
  const [tone, setTone] = useState(TONES[0])
  const [generateImage, setGenerateImage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GeneratedPost | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const addRelatedKeyword = () => {
    const k = relatedInput.trim()
    if (!k) return
    if (relatedKeywords.includes(k)) return
    setRelatedKeywords([...relatedKeywords, k])
    setRelatedInput('')
  }

  const removeRelated = (k: string) => setRelatedKeywords(relatedKeywords.filter((x) => x !== k))

  const generate = async () => {
    if (!focusKeyword.trim()) {
      toast.error('Focus keyword is required.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      // Step 1: Generate text only (fast, ~10-15s) — no image, avoids 504 timeout
      const res = await api.aiGeneratePost({
        focusKeyword: focusKeyword.trim(),
        relatedKeywords,
        topic: topic.trim() || undefined,
        category: categories.find((c) => c.id === category)?.name,
        tone,
      })
      setResult(res)
      toast.success(`Article generated! SEO score: ${res.seoScore.score}%`)

      // Step 2: Generate cover image SEPARATELY (avoids gateway timeout on combined request)
      if (generateImage && res.imagePrompt) {
        setImageLoading(true)
        try {
          const imgRes = await api.generateImage(res.imagePrompt, '1344x768')
          setResult((prev) => prev ? {
            ...prev,
            coverImage: imgRes.url,
            coverAlt: `${focusKeyword.trim()} — ${res.title.slice(0, 100)}`,
            imageGenerated: true,
          } : prev)
          toast.success('Cover image generated.')
        } catch (e: any) {
          toast.error('Image generation failed — you can add one manually in the editor.')
          setResult((prev) => prev ? { ...prev, imageGenerated: false } : prev)
        } finally {
          setImageLoading(false)
        }
      }
    } catch (e: any) {
      setError(e.message || 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const usePost = () => {
    if (!result) return
    onUse(result)
    // reset
    setResult(null)
    setFocusKeyword('')
    setRelatedKeywords([])
    setTopic('')
    setShowPreview(false)
    onOpenChange(false)
    toast.success('Loaded into editor — review and publish.')
  }

  const scoreColor = result ? (result.seoScore.score >= 88 ? 'text-emerald-600' : result.seoScore.score >= 70 ? 'text-amber-600' : 'text-red-600') : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scroll-lumen">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" /> AI Post Generator
          </DialogTitle>
          <DialogDescription>
            Generate SEO-optimized, AdSense-friendly articles with GLM AI. Enter your focus keyword and let AI write the content, generate a cover image, and score the SEO.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {/* Focus keyword */}
            <div>
              <Label className="text-xs text-muted-foreground">Focus keyword *</Label>
              <Input
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="e.g. acrylic pouring techniques"
                className="text-base"
              />
              <p className="text-[10px] text-muted-foreground mt-1">The primary keyword the article will rank for.</p>
            </div>

            {/* Related keywords */}
            <div>
              <Label className="text-xs text-muted-foreground">Related keywords (LSI)</Label>
              <div className="flex gap-2">
                <Input
                  value={relatedInput}
                  onChange={(e) => setRelatedInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRelatedKeyword() } }}
                  placeholder="e.g. fluid art, dirty pour, flip cup"
                />
                <Button type="button" variant="outline" onClick={addRelatedKeyword}><Plus className="h-4 w-4" /></Button>
              </div>
              {relatedKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {relatedKeywords.map((k) => (
                    <Badge key={k} variant="secondary" className="cursor-pointer" onClick={() => removeRelated(k)}>
                      {k} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Topic + category + tone */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">Topic / angle (optional)</Label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. A beginner's guide to dirty pour" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Writing tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Generate image toggle */}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={generateImage} onChange={(e) => setGenerateImage(e.target.checked)} className="accent-primary h-4 w-4" />
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              Generate AI cover image
            </label>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm">
              <p className="font-medium text-primary mb-1 flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> What AI will generate:</p>
              <ul className="text-muted-foreground text-xs space-y-0.5 ml-6 list-disc">
                <li>SEO-optimized title and 700+ word article in Markdown</li>
                <li>Focus keyword in title, first paragraph, and headings</li>
                <li>3+ external links to authoritative sources</li>
                <li>Related keywords woven naturally into the content</li>
                <li>AI-generated cover image (if enabled)</li>
                <li>Live SEO score (target: 88%+)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* SEO Score banner */}
            <div className={`rounded-xl p-4 flex items-center justify-between ${result.seoScore.passed ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${result.seoScore.passed ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  <span className="text-white font-bold text-lg">{result.seoScore.score}%</span>
                </div>
                <div>
                  <p className={`font-semibold ${result.seoScore.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {result.seoScore.passed ? 'SEO score passed!' : 'SEO score needs improvement'}
                  </p>
                  <p className="text-xs text-muted-foreground">{result.wordCount} words · {result.readMinutes} min read · {result.seoScore.checks.filter((c) => c.passed).length}/{result.seoScore.checks.length} checks passed</p>
                </div>
              </div>
              {result.coverImage ? (
                <div className="h-16 w-24 rounded-md overflow-hidden bg-muted shrink-0">
                  <img src={result.coverImage} alt="" className="h-full w-full object-cover" />
                </div>
              ) : imageLoading ? (
                <div className="text-right shrink-0 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <div>
                    <p className="text-xs text-primary font-medium">Generating image…</p>
                    <p className="text-[10px] text-muted-foreground">This takes ~20s</p>
                  </div>
                </div>
              ) : (
                <div className="text-right shrink-0">
                  <p className="text-xs text-amber-600 font-medium">⚠ Image failed</p>
                  <p className="text-[10px] text-muted-foreground">You can add one manually</p>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <Label className="text-xs text-muted-foreground">Generated title</Label>
              <p className="font-display text-xl font-semibold">{result.title}</p>
            </div>

            {/* SEO checks breakdown */}
            <div>
              <Label className="text-xs text-muted-foreground">SEO checks</Label>
              <div className="grid gap-1.5 mt-1">
                {result.seoScore.checks.map((c, i) => (
                  <div key={i} className={`flex items-start gap-2 text-xs rounded-md px-2 py-1.5 ${c.passed ? 'bg-emerald-50' : 'bg-muted/50'}`}>
                    {c.passed ? <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <span className={c.passed ? 'text-emerald-800 font-medium' : 'text-foreground font-medium'}>{c.label}</span>
                      <span className="text-muted-foreground ml-1">({c.points}/{c.maxPoints})</span>
                      <p className="text-muted-foreground mt-0.5">{c.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview toggle */}
            <div>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-1.5" /> {showPreview ? 'Hide' : 'Show'} content preview
              </Button>
              {showPreview && (
                <div className="mt-3 rounded-lg border border-border bg-card p-4 max-h-96 overflow-y-auto scroll-lumen">
                  <Markdown content={result.content} />
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              <div><span className="text-muted-foreground">Focus keyword:</span> <Badge variant="secondary">{result.focusKeyword}</Badge></div>
              <div><span className="text-muted-foreground">Tags:</span> {result.tags}</div>
              <div className="sm:col-span-2"><span className="text-muted-foreground">Meta description:</span> {result.metaDescription}</div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { setResult(null); onOpenChange(false) }}>
            {result ? 'Discard' : 'Cancel'}
          </Button>
          {result ? (
            <>
              <Button variant="outline" onClick={generate} disabled={loading || imageLoading}>
                <Sparkles className="h-4 w-4 mr-1.5" /> Regenerate
              </Button>
              <Button onClick={usePost} disabled={imageLoading}>
                <Check className="h-4 w-4 mr-1.5" /> {imageLoading ? 'Generating image…' : 'Use this article'}
              </Button>
            </>
          ) : (
            <Button onClick={generate} disabled={loading || !focusKeyword.trim()}>
              {loading ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Generating…</> : <><Wand2 className="h-4 w-4 mr-1.5" /> Generate article</>}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type { GeneratedPost }
