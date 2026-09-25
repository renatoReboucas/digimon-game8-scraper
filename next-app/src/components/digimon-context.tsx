'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Digimon, DigimonLookupInput } from '@/types/DigimonTypes'

interface DigimonContextValue {
  lookupDigimon: (item: DigimonLookupInput) => Digimon | null
  allDigimons: Digimon[]
}

export const DigimonContext = createContext<DigimonContextValue>({
  lookupDigimon: () => null,
  allDigimons: [],
})

interface DigimonProviderProps {
  digimons?: Digimon[]
  children: ReactNode
}

export function DigimonProvider({ digimons = [], children }: DigimonProviderProps) {
  const lookup = useMemo(() => {
    const byName = new Map<string, Digimon>()
    const byUrl = new Map<string, Digimon>()
    const byId = new Map<string, Digimon>()

    for (const d of digimons) {
      if (!d) continue
      const normalizedName = d.name?.trim()
      const normalizedUrl = d.url?.trim()
      const normalizedId = d.id != null ? String(d.id).trim() : ''

      if (normalizedName) byName.set(normalizedName.toLowerCase(), d)
      if (normalizedUrl) byUrl.set(normalizedUrl, d)
      if (normalizedId) byId.set(normalizedId, d)
    }

    return (item: DigimonLookupInput): Digimon | null => {
      if (!item) return null

      if (item.name) {
        const found = byName.get(item.name.trim().toLowerCase())
        if (found) return found
      }

      if (item.url) {
        const found = byUrl.get(item.url.trim())
        if (found) return found
      }

      if (item.id != null) {
        const found = byId.get(String(item.id).trim())
        if (found) return found
      }

      return null
    }
  }, [digimons])

  const value = useMemo<DigimonContextValue>(
    () => ({
      lookupDigimon: lookup,
      allDigimons: digimons,
    }),
    [lookup, digimons],
  )

  return <DigimonContext.Provider value={value}>{children}</DigimonContext.Provider>
}

export function useDigimonLookup() {
  return useContext(DigimonContext)
}
