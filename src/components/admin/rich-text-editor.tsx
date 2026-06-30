'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Media } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Bold, Italic, Underline, Strikethrough, Heading2, Heading3, List, ListOrdered,
  Quote, Link2, Code, Image as ImageIcon, Video, Minus, Undo, Redo, Upload,
  AlignLeft, AlignCenter, AlignRight, Loader2, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export function RichTextEditor({ value, onChange, placeholder = 'Start writing…', minHeight = 400 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [media, setMedia] = useState<Media[]>([])
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const isInternalChange = useRef(false)

  // Load media library
  useEffect(() => {
    let active = true
    api.media.list().then(({ media }) => { if (active) setMedia(media) })
    return () => { active = false }
  }, [])

  // Set initial content when value changes externally (e.g. loading a post)
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      const current = editorRef.current.innerHTML
      if (current !== value) {
        editorRef.current.innerHTML = value || ''
      }
    }
    isInternalChange.current = false
  }, [value])

  // Track active formatting on selection change
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>()
    try {
      if (document.queryCommandState('bold')) formats.add('bold')
      if (document.queryCommandState('italic')) formats.add('italic')
      if (document.queryCommandState('underline')) formats.add('underline')
      if (document.queryCommandState('strikeThrough')) formats.add('strikethrough')
      if (document.queryCommandState('insertUnorderedList')) formats.add('ul')
      if (document.queryCommandState('insertOrderedList')) formats.add('ol')
      const block = document.queryCommandValue('formatBlock').toLowerCase()
      if (block === 'h2') formats.add('h2')
      if (block === 'h3') formats.add('h3')
      if (block === 'blockquote') formats.add('quote')
    } catch {}
    setActiveFormats(formats)
  }, [])

  const exec = (command: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, val)
    handleInput()
    updateActiveFormats()
  }

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
    updateActiveFormats()
  }

  const formatBlock = (tag: string) => {
    exec('formatBlock', tag)
  }

  const insertLink = () => {
    const selection = window.getSelection()
    const selectedText = selection?.toString() || ''
    setLinkText(selectedText)
    setLinkUrl('https://')
    setShowLinkDialog(true)
  }

  const confirmLink = () => {
    if (!linkUrl.trim()) { toast.error('URL is required'); return }
    editorRef.current?.focus()
    // Restore selection
    const sel = window.getSelection()
    if (linkText && (!sel || sel.toString() === '')) {
      // Insert new link with text
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
      document.execCommand('insertHTML', false, linkHtml)
    } else {
      document.execCommand('createLink', false, linkUrl)
      // Add target="_blank" to the created link
      const links = editorRef.current?.querySelectorAll('a:not([target])')
      links?.forEach((l) => { l.setAttribute('target', '_blank'); l.setAttribute('rel', 'noopener noreferrer') })
    }
    handleInput()
    setShowLinkDialog(false)
    setLinkUrl('')
    setLinkText('')
  }

  const insertImage = (url: string, alt: string) => {
    editorRef.current?.focus()
    const imgHtml = `<img src="${url}" alt="${alt || ''}" style="max-width:100%;height:auto;border-radius:0.5rem;margin:1rem 0;" />`
    document.execCommand('insertHTML', false, imgHtml)
    handleInput()
    setShowMediaPicker(false)
  }

  const uploadImage = async (file: File) => {
    toast.loading('Uploading image…', { id: 'upload' })
    try {
      const { url } = await api.media.upload(file)
      setMedia((m) => [{ id: url, url, type: 'image', createdAt: new Date().toISOString() }, ...m])
      insertImage(url, file.name)
      toast.success('Image uploaded and inserted.', { id: 'upload' })
    } catch {
      toast.error('Upload failed.', { id: 'upload' })
    }
  }

  const insertVideo = () => {
    setShowVideoDialog(true)
    setVideoUrl('')
  }

  const confirmVideo = () => {
    if (!videoUrl.trim()) { toast.error('Video URL is required'); return }
    editorRef.current?.focus()
    let embedHtml = ''
    // YouTube
    const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (ytMatch) {
      embedHtml = `<div style="position:relative;padding-bottom:56.25%;height:0;margin:1rem 0;"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:0.5rem;" allowfullscreen></iframe></div>`
    }
    // Vimeo
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      embedHtml = `<div style="position:relative;padding-bottom:56.25%;height:0;margin:1rem 0;"><iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:0.5rem;" allowfullscreen></iframe></div>`
    }
    // Direct video file
    if (!embedHtml && /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl)) {
      embedHtml = `<video controls style="max-width:100%;border-radius:0.5rem;margin:1rem 0;"><source src="${videoUrl}"></video>`
    }
    if (!embedHtml) {
      toast.error('Unsupported video URL. Use YouTube, Vimeo, or direct .mp4/.webm link.')
      return
    }
    document.execCommand('insertHTML', false, embedHtml)
    handleInput()
    setShowVideoDialog(false)
    setVideoUrl('')
  }

  const insertHR = () => exec('insertHorizontalRule')
  const insertCode = () => {
    const sel = window.getSelection()
    const text = sel?.toString() || ''
    const codeHtml = `<code>${text || 'code'}</code>`
    document.execCommand('insertHTML', false, codeHtml)
    handleInput()
  }

  const fmtBtn = (active: boolean) => cn(
    'h-8 min-w-8 px-2 rounded flex items-center justify-center text-sm transition-colors',
    active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
  )

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b border-border bg-secondary/40 sticky top-0 z-10">
        <button type="button" onClick={() => exec('undo')} className={fmtBtn(false)} title="Undo"><Undo className="h-4 w-4" /></button>
        <button type="button" onClick={() => exec('redo')} className={fmtBtn(false)} title="Redo"><Redo className="h-4 w-4" /></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button type="button" onClick={() => formatBlock('h2')} className={fmtBtn(!!activeFormats.has('h2'))} title="Heading 2"><Heading2 className="h-4 w-4" /></button>
        <button type="button" onClick={() => formatBlock('h3')} className={fmtBtn(!!activeFormats.has('h3'))} title="Heading 3"><Heading3 className="h-4 w-4" /></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button type="button" onClick={() => exec('bold')} className={fmtBtn(!!activeFormats.has('bold'))} title="Bold"><Bold className="h-4 w-4" /></button>
        <button type="button" onClick={() => exec('italic')} className={fmtBtn(!!activeFormats.has('italic'))} title="Italic"><Italic className="h-4 w-4" /></button>
        <button type="button" onClick={() => exec('underline')} className={fmtBtn(!!activeFormats.has('underline'))} title="Underline"><Underline className="h-4 w-4" /></button>
        <button type="button" onClick={() => exec('strikeThrough')} className={fmtBtn(!!activeFormats.has('strikethrough'))} title="Strikethrough"><Strikethrough className="h-4 w-4" /></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button type="button" onClick={() => exec('justifyLeft')} className={fmtBtn(!!activeFormats.has('alignLeft'))} title="Align Left"><AlignLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => exec('justifyCenter')} className={fmtBtn(false)} title="Align Center"><AlignCenter className="h-4 w-4" /></button>
        <button type="button" onClick={() => exec('justifyRight')} className={fmtBtn(false)} title="Align Right"><AlignRight className="h-4 w-4" /></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button type="button" onClick={() => exec('insertUnorderedList')} className={fmtBtn(!!activeFormats.has('ul'))} title="Bullet List"><List className="h-4 w-4" /></button>
        <button type="button" onClick={() => exec('insertOrderedList')} className={fmtBtn(!!activeFormats.has('ol'))} title="Numbered List"><ListOrdered className="h-4 w-4" /></button>
        <button type="button" onClick={() => formatBlock('blockquote')} className={fmtBtn(!!activeFormats.has('quote'))} title="Quote"><Quote className="h-4 w-4" /></button>
        <button type="button" onClick={insertCode} className={fmtBtn(false)} title="Inline Code"><Code className="h-4 w-4" /></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button type="button" onClick={insertLink} className={fmtBtn(false)} title="Insert Link"><Link2 className="h-4 w-4" /></button>
        <button type="button" onClick={() => fileRef.current?.click()} className={fmtBtn(false)} title="Upload Image"><Upload className="h-4 w-4" /></button>
        <button type="button" onClick={() => setShowMediaPicker(!showMediaPicker)} className={fmtBtn(!!showMediaPicker)} title="Media Library"><ImageIcon className="h-4 w-4" /></button>
        <button type="button" onClick={insertVideo} className={fmtBtn(false)} title="Insert Video"><Video className="h-4 w-4" /></button>
        <button type="button" onClick={insertHR} className={fmtBtn(false)} title="Horizontal Rule"><Minus className="h-4 w-4" /></button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = '' }} />
      </div>

      {/* Media library picker */}
      {showMediaPicker && (
        <div className="p-3 border-b border-border bg-muted/30 max-h-48 overflow-y-auto scroll-lumen">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Media Library — click to insert</p>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowMediaPicker(false)}><X className="h-3.5 w-3.5" /></Button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {media.length === 0 ? (
              <p className="col-span-full text-center text-xs text-muted-foreground py-3">No images yet. Upload using the Upload button.</p>
            ) : media.map((m) => (
              <button key={m.id} type="button" onClick={() => insertImage(m.url, m.alt || '')} className="aspect-square overflow-hidden rounded-md border border-border hover:ring-2 ring-primary">
                <img src={m.url} alt={m.alt || ''} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onMouseUp={updateActiveFormats}
        onKeyUp={updateActiveFormats}
        data-placeholder={placeholder}
        className="article-prose !text-foreground px-6 py-4 outline-none focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
        style={{ minHeight: `${minHeight}px`, cursor: 'text' }}
      />

      {/* Link dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Insert Link</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Link text (optional if text is selected)</Label>
              <Input value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Click here to read more" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">URL</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" className="font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
            <Button onClick={confirmLink}><Link2 className="h-4 w-4 mr-1.5" /> Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Insert Video</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Video URL (YouTube, Vimeo, or direct .mp4/.webm)</Label>
              <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" className="font-mono" />
            </div>
            <p className="text-xs text-muted-foreground">The video will be embedded as a responsive iframe.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoDialog(false)}>Cancel</Button>
            <Button onClick={confirmVideo}><Video className="h-4 w-4 mr-1.5" /> Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
