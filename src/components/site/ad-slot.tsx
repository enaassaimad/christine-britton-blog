'use client'

import { useSettings } from './settings-context'
import { Megaphone } from 'lucide-react'

interface AdSlotProps {
  slot?: 'header' | 'inArticle' | 'inContent' | 'sidebar' | 'footer'
  className?: string
  label?: string
  format?: 'horizontal' | 'rectangle' | 'vertical'
}

/**
 * AdSense ad slot. Renders a styled placeholder when AdSense is not configured
 * (so the layout is clearly "ad-ready" for AdSense approval), and injects the
 * real <ins class="adsbygoogle"> when a client ID + slot are present.
 */
export function AdSlot({ slot = 'inArticle', className = '', label }: AdSlotProps) {
  const { settings } = useSettings()

  const slotId = settings
    ? slot === 'header'
      ? settings.adsenseSlotHeader
      : slot === 'sidebar'
      ? settings.adsenseSlotSidebar
      : slot === 'footer'
      ? settings.adsenseSlotFooter
      : slot === 'inContent'
      ? settings.adsenseSlotInContent
      : settings.adsenseSlotInArticle
    : null

  const configured =
    settings?.adsEnabled &&
    settings?.adsenseClient &&
    slotId &&
    !settings.adsenseClient.includes('0000000000000000')

  const dimensions =
    slot === 'sidebar'
      ? 'min-h-[600px] max-w-[300px]'
      : slot === 'header' || slot === 'footer'
      ? 'min-h-[90px] md:min-h-[100px]'
      : 'min-h-[250px]'

  if (configured) {
    return (
      <div className={`w-full flex justify-center ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={settings.adsenseClient!}
          data-ad-slot={slotId!}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    )
  }

  // Placeholder — clearly labelled, AdSense-policy-friendly (no fake clicks)
  return (
    <aside
      className={`w-full ${dimensions} mx-auto rounded-lg border border-dashed border-border/80 bg-muted/40 flex flex-col items-center justify-center gap-2 text-muted-foreground/70 ${className}`}
      aria-label="Advertisement"
    >
      <Megaphone className="h-4 w-4" />
      <span className="text-[11px] uppercase tracking-[0.2em]">
        {label || 'Advertisement'}
      </span>
      <span className="text-[10px] text-muted-foreground/50">Ad space — {slot}</span>
    </aside>
  )
}
