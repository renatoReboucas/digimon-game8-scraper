'use client'

import { Search, X } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { Digimon } from '@/types/DigimonTypes'
import { filterDigimons } from '@/lib/digimon-search'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { Switch } from './ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { DigimonCard } from './digimon-card'
import { DigimonProvider } from './digimon-context'
import { readFavorites, saveFavorites } from './lib/favorites'
import { ScrollToTop } from './scroll-to-top'
import { animatePageScroll } from './anime-animations'

interface DigimonAtlasProps {
  digimons: Digimon[]
  loadError?: string
}

export default function DigimonAtlas({ digimons, loadError = '' }: DigimonAtlasProps) {
  const [urlQuery, setUrlQuery] = useQueryState('q', {
    defaultValue: '',
    history: 'replace',
    clearOnDefault: true,
  })
  const [query, setQuery] = useState(urlQuery)
  const deferredQuery = useDeferredValue(query)
  const [showFavorites, setShowFavorites] = useState<boolean>(false)
  const deferredShowFavorites = useDeferredValue(showFavorites)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set<string>())
  const expandedIds = useRef<Set<string>>(new Set<string>())
  const scrollAnimation = useRef<ReturnType<typeof animatePageScroll>>(null)
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)

  useEffect(() => {
    setFavoriteIds(readFavorites())
  }, [])

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => () => {
    scrollAnimation.current?.revert()
  }, [])

  const filtered = useMemo(() => filterDigimons(digimons, {
    query: deferredQuery,
    showFavorites: deferredShowFavorites,
    favoriteIds,
    selectedParentId,
  }), [digimons, favoriteIds, deferredQuery, selectedParentId, deferredShowFavorites])
  const isSearchPending = query !== deferredQuery
  const isFilterPending = showFavorites !== deferredShowFavorites
  const isListPending = isSearchPending || isFilterPending

  function updateQuery(value: string) {
    setQuery(value)
    void setUrlQuery(value)
  }

  const toggleFavorite = useCallback((id: string | number) => {
    const next = new Set(favoriteIds)
    const normalizedId = String(id)
    if (next.has(normalizedId)) next.delete(normalizedId)
    else next.add(normalizedId)
    setFavoriteIds(next)
    saveFavorites(next)
  }, [favoriteIds])

  const setExpanded = useCallback((id: string | number, expanded: boolean) => {
    const normalizedId = String(id)
    if (expanded) expandedIds.current.add(normalizedId)
    else expandedIds.current.delete(normalizedId)
  }, [])

  const selectParent = useCallback((name?: string) => {
    const nextQuery = name ?? ''
    setSelectedParentId(null)
    setShowFavorites(false)
    setQuery(nextQuery)
    void setUrlQuery(nextQuery)
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        const input = document.getElementById('search-input')
        if (input) {
          input.focus({ preventScroll: true })
          const top = input.getBoundingClientRect().top + window.scrollY
            - (window.innerHeight - input.offsetHeight) / 2
          scrollAnimation.current?.revert()
          scrollAnimation.current = animatePageScroll(Math.max(0, top))
        }
      })
    }
  }, [setUrlQuery])

  const favoriteCount = digimons.filter((item) => favoriteIds.has(String(item.id))).length
  const emptyMessage = selectedParentId !== null
    ? 'O card pai nao corresponde aos filtros atuais.'
    : showFavorites
      ? 'Nenhum favorito corresponde aos filtros atuais.'
      : query
        ? 'Nenhum Digimon corresponde a pesquisa.'
        : 'Nenhum Digimon disponivel.'

  return (
    <DigimonProvider digimons={digimons}>
      <main className="shell">
        <header className="hero">
          <p className="eyebrow">Digimon Story Time Stranger</p>
          <h1>Digimon Atlas</h1>
          <p className="subtitle">Pesquise a linha evolutiva completa do seu Digimon.</p>
          <div className="search-box">
            <label className="sr-only" htmlFor="search-input">Pesquisar por nome</label>
            <Search aria-hidden="true" size={18} strokeWidth={1.8} />
            <Input
              className="search-input"
              id="search-input"
              type="text"
              placeholder="Pesquisar por nome..."
              autoComplete="off"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
            />
            {query && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="search-clear"
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label="Limpar pesquisa"
                    onClick={() => updateQuery('')}
                  >
                    <X aria-hidden="true" size={16} strokeWidth={2} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Limpar pesquisa</TooltipContent>
              </Tooltip>
            )}
          </div>
          <label className="favorites-filter" htmlFor="favorites-toggle">
            <Tooltip>
              <TooltipTrigger asChild>
                <Switch
                  id="favorites-toggle"
                  checked={showFavorites}
                  onCheckedChange={(checked) => setShowFavorites(checked === true)}
                  aria-label="Apenas favoritos"
                />
              </TooltipTrigger>
              <TooltipContent>Mostrar apenas favoritos</TooltipContent>
            </Tooltip>
            <span>Apenas favoritos</span>
          </label>
          <div className="result-count" aria-live="polite">
            {loadError || <><Badge variant="secondary">{filtered.length} {filtered.length === 1 ? 'Digimon encontrado' : 'Digimons encontrados'}</Badge><span>{favoriteCount} favoritos</span></>}
          </div>
        </header>
        <section className="digimon-list" aria-busy={isListPending}>
          {isListPending && !loadError && Array.from({ length: 4 }, (_, index) => (
            <Card className="loading-card search-loading-card" key={`search-skeleton-${index}`} aria-hidden="true">
              <div className="skeleton-card-heading">
                <Skeleton className="skeleton-image" />
                <div className="skeleton-copy">
                  <Skeleton className="skeleton-line short" />
                  <Skeleton className="skeleton-line" />
                  <Skeleton className="skeleton-line medium" />
                </div>
              </div>
              <div className="skeleton-metadata">
                <Skeleton className="skeleton-line" />
                <Skeleton className="skeleton-line" />
                <Skeleton className="skeleton-line medium" />
              </div>
            </Card>
          ))}
          {!isListPending && !loadError && !filtered.length ? <p className="page-empty">{emptyMessage}</p> : null}
          {!isListPending && !loadError && filtered.map((item) => {
            const itemId = String(item.id ?? item.url ?? item.name ?? 'item')

            return (
              <DigimonCard
                key={itemId}
                item={item}
                isFavorite={favoriteIds.has(String(item.id))}
                initiallyExpanded={expandedIds.current.has(itemId)}
                onToggleFavorite={toggleFavorite}
                onExpandedChange={setExpanded}
                onSelectParent={selectParent}
              />
            )
          })}
        </section>
        <ScrollToTop />
      </main>
    </DigimonProvider>
  )
}
