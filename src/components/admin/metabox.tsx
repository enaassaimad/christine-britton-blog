'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetaboxProps {
  title: string
  icon?: React.ReactNode
  description?: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  /** Optional header-right content (e.g. a small badge or button) */
  action?: React.ReactNode
}

/** WordPress-style collapsible metabox used in the post editor sidebar. */
export function Metabox({ title, icon, description, children, defaultOpen = true, className, action }: MetaboxProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      <header
        className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/40 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <h3 className="text-sm font-semibold flex-1">{title}</h3>
        {action}
        <button type="button" className="text-muted-foreground hover:text-foreground" aria-label={open ? 'Collapse' : 'Expand'}>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </header>
      {open && (
        <div className="p-4">
          {description && <p className="text-xs text-muted-foreground mb-3">{description}</p>}
          {children}
        </div>
      )}
    </section>
  )
}
