import { create } from 'zustand'
import { FAVORITES_STORAGE_KEY, readFavorites, saveFavorites } from './favorites'

export const FAVORITES_CONSENT_STORAGE_KEY = 'digimon-atlas:favorites-consent:v1'

export type FavoritesConsent = 'unknown' | 'granted' | 'denied'

interface FavoritesState {
  consent: FavoritesConsent
  favoriteIds: Set<string>
  initialize: () => void
  grantConsent: () => void
  denyConsent: () => void
  toggleFavorite: (id: string | number) => boolean
}

function readConsent(): FavoritesConsent {
  if (typeof window === 'undefined') return 'unknown'

  try {
    const consent = window.localStorage.getItem(FAVORITES_CONSENT_STORAGE_KEY)
    return consent === 'granted' || consent === 'denied' ? consent : 'unknown'
  } catch {
    return 'unknown'
  }
}

function writeConsent(consent: Exclude<FavoritesConsent, 'unknown'>) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(FAVORITES_CONSENT_STORAGE_KEY, consent)
  } catch {
    // The current session can still use consent when storage is unavailable.
  }
}

function clearStoredFavorites() {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(FAVORITES_STORAGE_KEY)
  } catch {
    // The current session can still clear its in-memory favorites.
  }
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  consent: 'unknown',
  favoriteIds: new Set<string>(),
  initialize: () => {
    const consent = readConsent()
    const favoriteIds = consent === 'granted' ? readFavorites() : new Set<string>()

    if (consent === 'denied') clearStoredFavorites()
    set({ consent, favoriteIds })
  },
  grantConsent: () => {
    writeConsent('granted')
    set({ consent: 'granted', favoriteIds: readFavorites() })
  },
  denyConsent: () => {
    writeConsent('denied')
    clearStoredFavorites()
    set({ consent: 'denied', favoriteIds: new Set<string>() })
  },
  toggleFavorite: (id) => {
    if (get().consent !== 'granted') return false

    const favoriteIds = new Set(get().favoriteIds)
    const normalizedId = String(id)
    if (favoriteIds.has(normalizedId)) favoriteIds.delete(normalizedId)
    else favoriteIds.add(normalizedId)

    saveFavorites(favoriteIds)
    set({ favoriteIds })
    return true
  },
}))