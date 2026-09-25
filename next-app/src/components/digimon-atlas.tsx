'use client'

import { Search, X } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useEffect, useMemo, useState } from 'react'
import type { Digimon } from '@/types/DigimonTypes'
import { filterDigimons } from '@/lib/digimon-search'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { DigimonCard } from './digimon-card'
import { DigimonProvider } from './digimon-context'
import { readFavorites, saveFavorites } from './lib/favorites'
import { ScrollToTop } from './scroll-to-top'

interface DigimonAtlasProps {
  digimons: Digimon[]
  loadError?: string
}

export default function DigimonAtlas({ digimons, loadError = '' }: DigimonAtlasProps) {
  const [query, setQuery] = useQueryState('q', {
    defaultValue: '',
    history: 'replace',
    clearOnDefault: true,
  })
  const [showFavorites, setShowFavorites] = useState<boolean>(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set<string>())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set<string>())
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)

  useEffect(() => {
    setFavoriteIds(readFavorites())
  }, [])

  const filtered = useMemo(() => filterDigimons(digimons, {
    query,
    showFavorites,
    favoriteIds,
    selectedParentId,
  }), [digimons, favoriteIds, query, selectedParentId, showFavorites])

  function toggleFavorite(id: string | number) {
    const next = new Set(favoriteIds)
    const normalizedId = String(id)
    if (next.has(normalizedId)) next.delete(normalizedId)
    else next.add(normalizedId)
    setFavoriteIds(next)
    saveFavorites(next)
  }

  function toggleExpanded(id: string | number) {
    const next = new Set(expandedIds)
    const normalizedId = String(id)
    if (next.has(normalizedId)) next.delete(normalizedId)
    else next.add(normalizedId)
    setExpandedIds(next)
  }

  function selectParent(name?: string) {
    setSelectedParentId(null)
    setShowFavorites(false)
    void setQuery(name ?? '')
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        const input = document.getElementById('search-input')
        if (input) {
          input.focus()
          input.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    }
  }

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
          <label className="search-box" htmlFor="search-input">
            <Search aria-hidden="true" size={18} strokeWidth={1.8} />
            <Input
              className="search-input"
              id="search-input"
              type="text"
              placeholder="Pesquisar por nome..."
              autoComplete="off"
              value={query}
              onChange={(event) => void setQuery(event.target.value)}
            />
            {query && (
              <Button
                className="search-clear"
                variant="ghost"
                size="icon"
                type="button"
                title="Limpar pesquisa"
                aria-label="Limpar pesquisa"
                onClick={() => void setQuery('')}
              >
                <X aria-hidden="true" size={16} strokeWidth={2} />
              </Button>
            )}
          </label>
          <label className="favorites-filter" htmlFor="favorites-toggle">
            <Checkbox
              id="favorites-toggle"
              checked={showFavorites}
              onCheckedChange={(checked) => setShowFavorites(checked === true)}
            />
            <span>Apenas favoritos</span>
          </label>
          <div className="result-count" aria-live="polite">
            {loadError || <><Badge variant="secondary">{filtered.length} {filtered.length === 1 ? 'Digimon encontrado' : 'Digimons encontrados'}</Badge><span>{favoriteCount} favoritos</span></>}
          </div>
        </header>
        <section className="digimon-list" aria-live="polite">
          {!loadError && !filtered.length ? <p className="page-empty">{emptyMessage}</p> : null}
          {!loadError && filtered.map((item) => (
            <DigimonCard
              key={String(item.id ?? item.url ?? item.name ?? 'item')}
              item={item}
              isFavorite={favoriteIds.has(String(item.id))}
              isExpanded={expandedIds.has(String(item.id))}
              onToggleFavorite={toggleFavorite}
              onToggleExpanded={toggleExpanded}
              onSelectParent={selectParent}
            />
          ))}
        </section>
        <ScrollToTop />
      </main>
    </DigimonProvider>
  )
}
