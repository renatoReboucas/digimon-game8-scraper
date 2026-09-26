// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { FAVORITES_STORAGE_KEY } from './favorites'
import { FAVORITES_CONSENT_STORAGE_KEY, useFavoritesStore } from './favorites-store'

beforeEach(() => {
  window.localStorage.clear()
  useFavoritesStore.setState({ consent: 'unknown', favoriteIds: new Set<string>() })
})

describe('favorites consent store', () => {
  it('does not load or save favorites before consent', () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, '["1"]')
    useFavoritesStore.getState().initialize()

    expect(useFavoritesStore.getState().consent).toBe('unknown')
    expect(useFavoritesStore.getState().favoriteIds).toEqual(new Set())
    expect(useFavoritesStore.getState().toggleFavorite('2')).toBe(false)
    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe('["1"]')
  })

  it('loads and persists favorites after consent is granted', () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, '["1"]')

    useFavoritesStore.getState().grantConsent()
    expect(useFavoritesStore.getState().favoriteIds).toEqual(new Set(['1']))
    expect(useFavoritesStore.getState().toggleFavorite('2')).toBe(true)
    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe('["1","2"]')
    expect(window.localStorage.getItem(FAVORITES_CONSENT_STORAGE_KEY)).toBe('granted')
  })

  it('restores consent and favorites after reload', () => {
    window.localStorage.setItem(FAVORITES_CONSENT_STORAGE_KEY, 'granted')
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, '["1"]')

    useFavoritesStore.getState().initialize()

    expect(useFavoritesStore.getState().consent).toBe('granted')
    expect(useFavoritesStore.getState().favoriteIds).toEqual(new Set(['1']))
  })

  it('clears stored favorites when consent is denied or revoked', () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, '["1"]')
    useFavoritesStore.getState().denyConsent()

    expect(useFavoritesStore.getState().consent).toBe('denied')
    expect(useFavoritesStore.getState().favoriteIds).toEqual(new Set())
    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBeNull()
    expect(window.localStorage.getItem(FAVORITES_CONSENT_STORAGE_KEY)).toBe('denied')
    expect(useFavoritesStore.getState().toggleFavorite('2')).toBe(false)
  })
})