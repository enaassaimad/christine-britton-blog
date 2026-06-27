'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Loader2, ImageIcon, Wand2, AlertCircle, Check, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface GeneratedImage {
  url: string
  prompt: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when the user picks "Use as cover" */
  onUseAsCover?: (img: GeneratedImage) => void
  /** Called when the user picks "Insert into content" */
  onInsertIntoContent?: (img: GeneratedImage) => void
  /** Optional default prompt seed (e.g. post title) */
  defaultPrompt?: string
}

const SIZE_OPTIONS = [
  { value: '1344x768', label: 'Landscape 16:9 (1344×768) — best for covers' },
  { value: '1440x720', label: 'Wide banner 2:1 (1440×720)' },
  { value: '1024x1024', label: 'Square 1:1 (1024×1024)' },
  { value: '1152x864', label: 'Landscape 4:3 (1152×864)' },
  { value: '864x1152', label: 'Portrait 3:4 (864×1152)' },
  { value: '768x1344', label: 'Portrait 9:16 (768×1344)' },
]

export function GenerateImageDialog({ open, onOpenChange, onUseAsCover, onInsertIntoContent, defaultPrompt }: Props) {
  const [prompt, setPrompt] = useState(defaultPrompt || '')
  const [size, setSize] = useState('1344x768')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await api.generateImage(prompt.trim(), size)
      setResult({ url: res.url, prompt: res.prompt })
      toast.success('Image generated.')
    } catch (e: any) {
      setError(e.message || 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const close = () => {
    onOpenChange(false)
    // keep prompt/result so reopening during the same session is friendly
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" /> AI Image Generator
          </DialogTitle>
          <DialogDescription>
            Describe the image you want and the AI will create it. Saved to your media library automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A vibrant acrylic pour painting with teal and gold cells, fluid art, abstract, top-down, glossy, high quality"
              rows={3}
              className="resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Tip: include subject, style, mood and lighting for best results.</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
                <img src={result.url} alt={result.prompt} className="w-full max-h-72 object-contain" />
              </div>
              <p className="text-xs text-muted-foreground italic line-clamp-2">“{result.prompt}”</p>
              <div className="flex flex-wrap gap-2">
                {onUseAsCover && (
                  <Button size="sm" onClick={() => { onUseAsCover(result); close() }}>
                    <Check className="h-4 w-4 mr-1.5" /> Use as cover
                  </Button>
                )}
                {onInsertIntoContent && (
                  <Button size="sm" variant="outline" onClick={() => { onInsertIntoContent(result); close() }}>
                    <Plus className="h-4 w-4 mr-1.5" /> Insert into content
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(result.url); toast.success('Image URL copied.') }}>
                  Copy URL
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setResult(null) }}>Discard & regenerate</Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close}>Close</Button>
          <Button onClick={generate} disabled={loading || !prompt.trim()}>
            {loading ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Generating…</> : <><Sparkles className="h-4 w-4 mr-1.5" /> Generate image</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
