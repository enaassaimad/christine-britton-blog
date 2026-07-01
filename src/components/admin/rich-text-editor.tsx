'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Media } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Undo2, Redo2, Heading2, Heading3, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Quote, Code2,
  Link2, ImagePlus, Images, Video, Minus, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

type ActiveState = {
  bold: boolean
  italic: boolean
  underline: boolean
  strikeThrough: boolean
  justifyLeft: boolean
  justifyCenter: boolean
  justifyRight: boolean
  insertUnorderedList: boolean
  insertOrderedList: boolean
  formatBlock: string
}

const EMPTY_ACTIVE: ActiveState = {
  bold: false, italic: false, underline: false, strikeThrough: false,
  justifyLeft: false, justifyCenter: false, justifyRight: false,
  insertUnorderedList: false, insertOrderedList: false, formatBlock: '',
}

/** Build a className for a toolbar button — toggled when its command is active. */
function btnClass(active: boolean): string {
  return cn(
    'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-sm transition-colors',
    'hover:bg-accent hover:text-accent-foreground',
    active && 'bg-primary/10 text-primary',
  )
}

const SEP = <span className="mx-0.5 h-5 w-px bg-border" />

export function RichTextEditor({ value, onChange, placeholder = 'Start writing…', minHeight = 320 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [active, setActive] = useState<ActiveState>(EMPTY_ACTIVE)
  const [uploading, setUploading] = useState(false)
  const [showMedia, setShowMedia] = useState(false)
  const [media, setMedia] = useState<Media[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [videoOpen, setVideoOpen] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')

  // Sync incoming value into the editable div — but ONLY when it differs,
  // so we don't clobber the user's caret position while typing.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.innerHTML === value) return
    el.innerHTML = value || ''
  }, [value])

  // Track active format states whenever the selection or content changes.
  const refreshActive = useCallback(() => {
    if (typeof document === 'undefined') return
    try {
      const q = (cmd: string) => document.queryCommandState(cmd)
      let block = ''
      try { block = (document.queryCommandValue('formatBlock') || '').toLowerCase() } catch {}
      setActive({
        bold: q('bold'),
        italic: q('italic'),
        underline: q('underline'),
        strikeThrough: q('strikeThrough'),
        justifyLeft: q('justifyLeft'),
        justifyCenter: q('justifyCenter'),
        justifyRight: q('justifyRight'),
        insertUnorderedList: q('insertUnorderedList'),
        insertOrderedList: q('insertOrderedList'),
        formatBlock: block,
      })
    } catch {
      // queryCommandState can throw in unsupported contexts — ignore.
    }
  }, [])

  // Mouse/keyup listeners on the document refresh active state.
  useEffect(() => {
    const handler = () => refreshActive()
    document.addEventListener('selectionchange', handler)
    return () => document.removeEventListener('selectionchange', handler)
  }, [refreshActive])

  const exec = useCallback((command: string, val?: string) => {
    if (typeof document === 'undefined') return
    ref.current?.focus()
    try {
      document.execCommand(command, false, val)
    } catch {
      // ignore
    }
    refreshActive()
    if (ref.current) onChange(ref.current.innerHTML)
  }, [onChange, refreshActive])

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML)
    refreshActive()
  }

  // --- Image upload ---
  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const { url } = await api.media.upload(file)
      insertHtml(`<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:0.5rem;" />`)
      toast.success('Image uploaded and inserted.')
    } catch {
      toast.error('Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  // --- Insert arbitrary HTML at the caret (or append if no selection) ---
  const insertHtml = (html: string) => {
    ref.current?.focus()
    const sel = window.getSelection()
    if (sel && sel.rangeCount && ref.current && ref.current.contains(sel.anchorNode)) {
      // Use insertHTML at the caret when the editor has focus
      try {
        document.execCommand('insertHTML', false, html)
      } catch {
        const range = sel.getRangeAt(0)
        range.deleteContents()
        const tpl = document.createElement('template')
        tpl.innerHTML = html
        range.insertNode(tpl.content.cloneNode(true))
      }
    } else {
      // No caret in editor — append to the end
      if (ref.current) {
        ref.current.innerHTML = (ref.current.innerHTML || '') + html
      }
    }
    if (ref.current) onChange(ref.current.innerHTML)
    refreshActive()
  }

  // --- Media library ---
  const openMediaLibrary = async () => {
    setShowMedia(true)
    setMediaLoading(true)
    try {
      const { media } = await api.media.list()
      setMedia(media)
    } catch {
      toast.error('Could not load media.')
    } finally {
      setMediaLoading(false)
    }
  }

  const insertMediaImage = (m: Media) => {
    insertHtml(`<img src="${m.url}" alt="${m.alt || ''}" style="max-width:100%;height:auto;border-radius:0.5rem;" />`)
    setShowMedia(false)
  }

  // --- Link dialog ---
  const openLinkDialog = () => {
    let selectedText = ''
    const sel = window.getSelection()
    if (sel && sel.rangeCount) selectedText = sel.toString()
    setLinkText(selectedText)
    setLinkUrl('https://')
    setLinkOpen(true)
  }
  const applyLink = () => {
    const url = linkUrl.trim()
    if (!url) { toast.error('Enter a URL.'); return }
    const text = linkText.trim() || url
    const safe = url.replace(/"/g, '&quot;')
    insertHtml(`<a href="${safe}" target="_blank" rel="noopener noreferrer">${text.replace(/</g, '&lt;')}</a>`)
    setLinkOpen(false)
  }

  // --- Video dialog ---
  const openVideoDialog = () => {
    setVideoUrl('')
    setVideoOpen(true)
  }
  const applyVideo = () => {
    const url = (videoUrl || '').trim()
    if (!url) { toast.error('Enter a video URL.'); return }
    let embed = ''
    // YouTube
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
    if (yt) {
      embed = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:0.5rem;margin:0.5rem 0;"><iframe src="https://www.youtube.com/embed/${yt[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div>`
    } else {
      const vm = url.match(/vimeo\.com\/(\d+)/)
      if (vm) {
        embed = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:0.5rem;margin:0.5rem 0;"><iframe src="https://player.vimeo.com/video/${vm[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`
      } else if (/\.(mp4|webm|ogg)$/i.test(url)) {
        embed = `<video controls style="max-width:100%;height:auto;border-radius:0.5rem;margin:0.5rem 0;"><source src="${url.replace(/"/g, '&quot;')}"></video>`
      } else {
        toast.error('Unsupported video URL. Use YouTube, Vimeo or .mp4.')
        return
      }
    }
    insertHtml(embed)
    setVideoOpen(false)
  }

  // Render helpers for the toolbar (plain buttons — not components-in-render)
  const tBtn = (
    onClick: () => void,
    icon: React.ReactNode,
    label: string,
    isActive: boolean = false,
  ) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => { e.preventDefault() }}
      onClick={onClick}
      className={btnClass(isActive)}
    >
      {icon}
    </button>
  )

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-secondary/30 px-2 py-1.5">
        {tBtn(() => exec('undo'), <Undo2 className="h-4 w-4" />, 'Undo')}
        {tBtn(() => exec('redo'), <Redo2 className="h-4 w-4" />, 'Redo')}
        {SEP}
        {tBtn(() => exec('formatBlock', 'h2'), <Heading2 className="h-4 w-4" />, 'Heading 2', active.formatBlock === 'h2')}
        {tBtn(() => exec('formatBlock', 'h3'), <Heading3 className="h-4 w-4" />, 'Heading 3', active.formatBlock === 'h3')}
        {tBtn(() => exec('formatBlock', 'p'), <span className="text-[11px] font-semibold px-1">P</span>, 'Paragraph', active.formatBlock === 'p' || active.formatBlock === '')}
        {SEP}
        {tBtn(() => exec('bold'), <Bold className="h-4 w-4" />, 'Bold (Ctrl+B)', active.bold)}
        {tBtn(() => exec('italic'), <Italic className="h-4 w-4" />, 'Italic (Ctrl+I)', active.italic)}
        {tBtn(() => exec('underline'), <Underline className="h-4 w-4" />, 'Underline (Ctrl+U)', active.underline)}
        {tBtn(() => exec('strikeThrough'), <Strikethrough className="h-4 w-4" />, 'Strikethrough', active.strikeThrough)}
        {SEP}
        {tBtn(() => exec('justifyLeft'), <AlignLeft className="h-4 w-4" />, 'Align left', active.justifyLeft)}
        {tBtn(() => exec('justifyCenter'), <AlignCenter className="h-4 w-4" />, 'Align center', active.justifyCenter)}
        {tBtn(() => exec('justifyRight'), <AlignRight className="h-4 w-4" />, 'Align right', active.justifyRight)}
        {SEP}
        {tBtn(() => exec('insertUnorderedList'), <List className="h-4 w-4" />, 'Bullet list', active.insertUnorderedList)}
        {tBtn(() => exec('insertOrderedList'), <ListOrdered className="h-4 w-4" />, 'Numbered list', active.insertOrderedList)}
        {tBtn(() => exec('formatBlock', 'blockquote'), <Quote className="h-4 w-4" />, 'Quote', active.formatBlock === 'blockquote')}
        {SEP}
        {tBtn(() => {
          // Inline code via wrapping <code> around selection
          const sel = window.getSelection()
          const text = sel && sel.rangeCount ? sel.toString() : ''
          if (text) insertHtml(`<code>${text.replace(/</g, '&lt;')}</code>`)
          else insertHtml('<code>code</code>')
        }, <Code2 className="h-4 w-4" />, 'Inline code')}
        {tBtn(openLinkDialog, <Link2 className="h-4 w-4" />, 'Insert link')}
        {tBtn(() => fileRef.current?.click(), uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />, 'Upload image')}
        {tBtn(openMediaLibrary, <Images className="h-4 w-4" />, 'Media library')}
        {tBtn(openVideoDialog, <Video className="h-4 w-4" />, 'Insert video')}
        {SEP}
        {tBtn(() => insertHtml('<hr style="margin:1rem 0;border:0;border-top:1px solid var(--border);" />'), <Minus className="h-4 w-4" />, 'Horizontal rule')}
      </div>

      {/* Editable surface */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onMouseUp={refreshActive}
        onKeyUp={refreshActive}
        data-placeholder={placeholder}
        className="prose prose-sm max-w-none px-4 py-3 outline-none focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
        style={{ minHeight }}
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) uploadImage(f)
          e.target.value = ''
        }}
      />

      {/* Media library dialog */}
      <Dialog open={showMedia} onOpenChange={setShowMedia}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Media library</DialogTitle>
          </DialogHeader>
          {mediaLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : media.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No media uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto">
              {media.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => insertMediaImage(m)}
                  className="group relative aspect-square overflow-hidden rounded-md border border-border hover:ring-2 ring-primary"
                >
                  <img src={m.url} alt={m.alt || ''} className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">Insert</span>
                </button>
              ))}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link dialog */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert link</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Link text</Label>
              <Input value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Visible text (defaults to URL)" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">URL</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" className="mt-1" autoFocus />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={applyLink}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video dialog */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert video</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">YouTube, Vimeo or direct video URL (.mp4, .webm, .ogg)</Label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" autoFocus />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={applyVideo}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
