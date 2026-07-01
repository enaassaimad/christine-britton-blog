'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { SiteSetting } from '@/lib/types'
import { api } from '@/lib/api'
import { getTheme, applyTheme } from '@/lib/themes'

interface SettingsCtx {
  settings: SiteSetting | null
  loading: boolean
  refresh: () => Promise<void>
}

const Ctx = createContext<SettingsCtx>({ settings: null, loading: true, refresh: async () => {} })

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSetting | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const { setting } = await api.settings.get()
      setSettings(setting)
      // Apply the full theme preset (colors + fonts) — supersedes the old
      // primaryColor-only approach. Falls back to the 'art' theme if unset.
      const theme = getTheme(setting.theme)
      applyTheme(theme)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return <Ctx.Provider value={{ settings, loading, refresh }}>{children}</Ctx.Provider>
}

export function useSettings() {
  return useContext(Ctx)
}
