// Theme system — 12 niche-specific presets.
// Each preset defines a primary + accent color pair, a background, fonts, and a
// short description. `applyTheme` writes all of them to the document root as
// CSS custom properties so the rest of the app can consume them via Tailwind
// utilities (bg-primary, text-foreground, font-display, etc.).

export interface ThemeColors {
  /** Main brand color — used for primary buttons, links, accents */
  primary: string
  /** Secondary accent — used for highlights, badges, hover states */
  accent: string
  /** Page background */
  background: string
  /** Default body text color */
  foreground: string
  /** Card / surface background */
  card: string
  /** Secondary surface (subtle backgrounds, hover) */
  secondary: string
  /** Muted surface (input fills, separators) */
  muted: string
  /** Border color */
  border: string
}

export interface ThemePreset {
  id: string
  name: string
  niche: string
  description: string
  colors: ThemeColors
  fontSerif: string
  fontSans: string
}

const INTER = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

export const THEMES: ThemePreset[] = [
  {
    id: 'art',
    name: 'Art Studio',
    niche: 'Art & Painting',
    description: 'Warm terracotta on cream paper — perfect for art tutorials, galleries and creative journals.',
    colors: {
      primary: '#b45309',
      accent: '#9a3412',
      background: '#fdfaf3',
      foreground: '#1f1a14',
      card: '#ffffff',
      secondary: '#f4ece0',
      muted: '#efe7d8',
      border: '#e4dcc9',
    },
    fontSerif: '"Playfair Display", Georgia, "Times New Roman", serif',
    fontSans: INTER,
  },
  {
    id: 'food',
    name: 'Recipe Book',
    niche: 'Food & Cooking',
    description: 'Sage green on warm white — clean and appetising for food blogs and recipe collections.',
    colors: {
      primary: '#4a7c59',
      accent: '#b5832e',
      background: '#fefcf7',
      foreground: '#243027',
      card: '#ffffff',
      secondary: '#f3efe4',
      muted: '#efe9da',
      border: '#e0d8c4',
    },
    fontSerif: 'Lora, Georgia, "Times New Roman", serif',
    fontSans: INTER,
  },
  {
    id: 'tech',
    name: 'Tech Pulse',
    niche: 'Technology',
    description: 'Emerald on dark slate — modern and developer-friendly for tech blogs and product reviews.',
    colors: {
      primary: '#059669',
      accent: '#22d3ee',
      background: '#0f172a',
      foreground: '#e2e8f0',
      card: '#1e293b',
      secondary: '#1e293b',
      muted: '#273449',
      border: '#334155',
    },
    fontSerif: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSans: INTER,
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Mag',
    niche: 'Lifestyle',
    description: 'Rose on lavender — soft and elegant for lifestyle, wellness and personal-brand blogs.',
    colors: {
      primary: '#be185d',
      accent: '#7c3aed',
      background: '#fdfaff',
      foreground: '#1f1430',
      card: '#ffffff',
      secondary: '#f5eef9',
      muted: '#efe6f5',
      border: '#e3d6ef',
    },
    fontSerif: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
    fontSans: INTER,
  },
  {
    id: 'fashion',
    name: 'Fashion House',
    niche: 'Fashion',
    description: 'Gold on black — luxe and editorial for fashion lookbooks and style magazines.',
    colors: {
      primary: '#a67c00',
      accent: '#d4af37',
      background: '#1a1a1a',
      foreground: '#f5f1e6',
      card: '#232323',
      secondary: '#2a2a2a',
      muted: '#2f2f2f',
      border: '#3a3a3a',
    },
    fontSerif: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
    fontSans: INTER,
  },
  {
    id: 'travel',
    name: 'Wanderlust',
    niche: 'Travel',
    description: 'Ocean blue with sandy accents — fresh and adventurous for travel journals and guides.',
    colors: {
      primary: '#0284c7',
      accent: '#f59e0b',
      background: '#fbfcfd',
      foreground: '#0f1c2a',
      card: '#ffffff',
      secondary: '#eaf2f8',
      muted: '#e3edf4',
      border: '#cddbe7',
    },
    fontSerif: 'Lora, Georgia, "Times New Roman", serif',
    fontSans: INTER,
  },
  {
    id: 'wellness',
    name: 'Wellness Flow',
    niche: 'Health & Wellness',
    description: 'Calming teal with sage accents — grounded and serene for yoga, mindfulness and wellness blogs.',
    colors: {
      primary: '#0d9488',
      accent: '#65a30d',
      background: '#f8fbf9',
      foreground: '#10241f',
      card: '#ffffff',
      secondary: '#e8f3ef',
      muted: '#dfefe9',
      border: '#c5dfd6',
    },
    fontSerif: 'Lora, Georgia, "Times New Roman", serif',
    fontSans: INTER,
  },
  {
    id: 'business',
    name: 'Boardroom',
    niche: 'Business & Finance',
    description: 'Navy with silver — professional and authoritative for business, finance and consulting blogs.',
    colors: {
      primary: '#1e40af',
      accent: '#475569',
      background: '#fbfcfd',
      foreground: '#0f172a',
      card: '#ffffff',
      secondary: '#eef2f7',
      muted: '#e6ecf3',
      border: '#cdd6e3',
    },
    fontSerif: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSans: INTER,
  },
  {
    id: 'photography',
    name: 'Darkroom',
    niche: 'Photography',
    description: 'Amber on charcoal — high-contrast and gallery-like for photography portfolios.',
    colors: {
      primary: '#f59e0b',
      accent: '#fb923c',
      background: '#18181b',
      foreground: '#f4f4f5',
      card: '#27272a',
      secondary: '#27272a',
      muted: '#2f2f33',
      border: '#3f3f46',
    },
    fontSerif: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSans: INTER,
  },
  {
    id: 'gaming',
    name: 'Arcade',
    niche: 'Gaming',
    description: 'Purple with cyan — bold and playful for gaming reviews, streams and esports blogs.',
    colors: {
      primary: '#9333ea',
      accent: '#06b6d4',
      background: '#0c0a14',
      foreground: '#ece9f5',
      card: '#171327',
      secondary: '#171327',
      muted: '#1f1a32',
      border: '#2a2342',
    },
    fontSerif: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSans: INTER,
  },
  {
    id: 'education',
    name: 'Scholar',
    niche: 'Education',
    description: 'Indigo with yellow highlights — friendly and readable for courses, tutorials and academic blogs.',
    colors: {
      primary: '#4f46e5',
      accent: '#eab308',
      background: '#fbfbfe',
      foreground: '#161436',
      card: '#ffffff',
      secondary: '#eeeefb',
      muted: '#e8e8f8',
      border: '#d6d6ee',
    },
    fontSerif: 'Lora, Georgia, "Times New Roman", serif',
    fontSans: INTER,
  },
  {
    id: 'minimal',
    name: 'Plain',
    niche: 'Minimal',
    description: 'Pure black on white — distraction-free minimalism for writers, essays and personal blogs.',
    colors: {
      primary: '#000000',
      accent: '#525252',
      background: '#ffffff',
      foreground: '#0a0a0a',
      card: '#ffffff',
      secondary: '#f5f5f5',
      muted: '#f0f0f0',
      border: '#e5e5e5',
    },
    fontSerif: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSans: INTER,
  },
]

const THEME_MAP: Record<string, ThemePreset> = Object.fromEntries(
  THEMES.map((t) => [t.id, t]),
)

export function getTheme(id?: string | null): ThemePreset {
  if (id && THEME_MAP[id]) return THEME_MAP[id]
  return THEMES[0]
}

/**
 * Compute a readable foreground color (black or white) for a given hex
 * background. Used to pick primary-foreground, card-foreground, etc.
 */
function readableForeground(hex: string): string {
  const m = hex.replace('#', '')
  if (m.length !== 6) return '#ffffff'
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  // Relative luminance (sRGB) per WCAG
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  return L > 0.45 ? '#0a0a0a' : '#ffffff'
}

/** Slightly darken a hex color by a factor (0..1, lower = darker). */
function darken(hex: string, factor: number): string {
  const m = hex.replace('#', '')
  if (m.length !== 6) return hex
  const r = Math.max(0, Math.round(parseInt(m.slice(0, 2), 16) * factor))
  const g = Math.max(0, Math.round(parseInt(m.slice(2, 4), 16) * factor))
  const b = Math.max(0, Math.round(parseInt(m.slice(4, 6), 16) * factor))
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/** Slightly lighten a hex color by mixing it with white (0..1). */
function lighten(hex: string, amount: number): string {
  const m = hex.replace('#', '')
  if (m.length !== 6) return hex
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  const r = mix(parseInt(m.slice(0, 2), 16))
  const g = mix(parseInt(m.slice(2, 4), 16))
  const b = mix(parseInt(m.slice(4, 6), 16))
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/**
 * Apply a theme preset to the document root by setting CSS custom properties.
 * Safe to call on the client only.
 */
export function applyTheme(theme: ThemePreset): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const { colors } = theme

  const set = (key: string, value: string) => root.style.setProperty(key, value)

  // Core palette
  set('--primary', colors.primary)
  set('--primary-foreground', readableForeground(colors.primary))
  set('--accent', colors.accent)
  set('--accent-foreground', readableForeground(colors.accent))
  set('--background', colors.background)
  set('--foreground', colors.foreground)
  set('--card', colors.card)
  set('--card-foreground', colors.foreground)
  set('--popover', colors.card)
  set('--popover-foreground', colors.foreground)
  set('--secondary', colors.secondary)
  set('--secondary-foreground', colors.foreground)
  set('--muted', colors.muted)
  set('--muted-foreground', darken(colors.foreground, 0.55))
  set('--border', colors.border)
  set('--input', colors.border)
  set('--ring', colors.primary)

  // Chart colors derived from palette
  set('--chart-1', colors.primary)
  set('--chart-2', colors.accent)
  set('--chart-3', lighten(colors.primary, 0.25))
  set('--chart-4', darken(colors.accent, 0.85))
  set('--chart-5', lighten(colors.accent, 0.3))

  // Sidebar mirrors the card palette
  set('--sidebar', colors.card)
  set('--sidebar-foreground', colors.foreground)
  set('--sidebar-primary', colors.primary)
  set('--sidebar-primary-foreground', readableForeground(colors.primary))
  set('--sidebar-accent', colors.secondary)
  set('--sidebar-accent-foreground', colors.foreground)
  set('--sidebar-border', colors.border)
  set('--sidebar-ring', colors.primary)

  // Destructive stays a standard red but tinted toward the brand
  set('--destructive', '#dc2626')
  set('--destructive-foreground', '#ffffff')

  // Fonts — also inject a Google Fonts link so the chosen serif loads
  set('--font-serif', theme.fontSerif)
  set('--font-sans', theme.fontSans)
  set('--font-inter', theme.fontSans)
  loadGoogleFonts(theme)
}

/**
 * Inject (or replace) a Google Fonts stylesheet link so the theme's serif font
 * is actually available. Sans is always Inter (already loaded in layout.tsx).
 */
function loadGoogleFonts(theme: ThemePreset): void {
  if (typeof document === 'undefined') return
  const families: string[] = []
  const f = theme.fontSerif
  if (f.startsWith('"Playfair Display"') || f.startsWith('Playfair Display')) {
    families.push('Playfair+Display:wght@400;500;600;700;800;900')
  } else if (f.startsWith('"Cormorant Garamond"') || f.startsWith('Cormorant Garamond')) {
    families.push('Cormorant+Garamond:wght@400;500;600;700')
  } else if (f.startsWith('Lora')) {
    families.push('Lora:wght@400;500;600;700')
  }
  // If the serif is Inter (tech/business/etc.), nothing extra to load.
  if (families.length === 0) return
  const href = `https://fonts.googleapis.com/css2?${families.map((fam) => `family=${fam}`).join('&')}&display=swap`
  let link = document.getElementById('theme-fonts') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = 'theme-fonts'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}
