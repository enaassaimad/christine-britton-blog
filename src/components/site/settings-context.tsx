'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { SiteSetting } from '@/lib/types'
import { api } from '@/lib/api'

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
      // apply primary color as CSS var
      if (setting.primaryColor) {
        document.documentElement.style.setProperty('--ring', setting.primaryColor)
      }
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
