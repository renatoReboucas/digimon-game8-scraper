'use client'

import { ChevronDown, ChevronUp, Funnel, Star } from 'lucide-react'
import type { Digimon } from '@/types/DigimonTypes'
import { DigimonImage } from './digimon-image'
import { DigimonMetadataGrid } from './digimon-metadata-grid'
import { EvolutionSection } from './evolution-section'
import { Link } from './link'

interface DigimonCardProps {
  item: Digimon
  isFavorite: boolean
  isExpanded: boolean
  onToggleFavorite: (id: string | number) => void
  onToggleExpanded: (id: string | number) => void
  onSelectParent?: (name: string) => void
}

export function DigimonCard({ item, isFavorite, isExpanded, onToggleFavorite, onToggleExpanded, onSelectParent }: DigimonCardProps) {
  const cardId = String(item.id ?? item.url ?? item.name ?? '')
  const relations = item.Digivolutions ?? { evolutions: [], deEvolutions: [] }

  return (
    <article className="digimon-card">
      <div
        className="card-header"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={(event) => {
          if (!(event.target as HTMLElement).closest('button, a')) onToggleExpanded(cardId)
        }}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
            event.preventDefault()
            onToggleExpanded(cardId)
          }
        }}
      >
        <DigimonImage item={item} className="main-image" />
        <div className="identity">
          <span className="card-index">No. {item.number}</span>
          <div className="title-row">
            <h2>{item.name}</h2>
            <button
              className="name-filter-button"
              type="button"
              title={`Filtrar ${item.name} na busca`}
              aria-label={`Filtrar ${item.name} na barra de busca`}
              onClick={(event) => {
                event.stopPropagation()
                onSelectParent?.(item.name ?? '')
              }}
            >
              <Funnel aria-hidden="true" size={15} strokeWidth={1.8} />
            </button>
          </div>
          <div className="tags">
            <span>{item.attribute}</span>
            <span>{item.generation}</span>
          </div>
        </div>
        <div className="card-actions">
          <button
            className={`favorite-button${isFavorite ? ' is-favorite' : ''}`}
            type="button"
            title={isFavorite ? 'Desfavoritar' : 'Favoritar'}
            aria-pressed={isFavorite}
            aria-label={`${isFavorite ? 'Desfavoritar' : 'Favoritar'} ${item.name}`}
            onClick={() => onToggleFavorite(cardId)}
          >
            <Star aria-hidden="true" size={17} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={1.8} />
            <span>{isFavorite ? 'Desfavoritar' : 'Favoritar'}</span>
          </button>
          <span className="expand-indicator" aria-hidden="true" title={isExpanded ? 'Recolher evolucoes' : 'Expandir evolucoes'}>
            {isExpanded ? <ChevronUp size={15} strokeWidth={1.8} /> : <ChevronDown size={15} strokeWidth={1.8} />}
          </span>
        </div>
      </div>
      <div className="card-meta-section">
        <DigimonMetadataGrid digimon={item} className="parent-metadata-grid" />
        <div className="card-meta-footer">
          <Link item={item} />
        </div>
      </div>
      {isExpanded && (
        <div className="evolution-details">
          <EvolutionSection title="Evolutions" items={relations.evolutions ?? []} onSelectParent={onSelectParent} />
          <div className="divider" role="separator" />
          <EvolutionSection title="De-evolutions" items={relations.deEvolutions ?? []} onSelectParent={onSelectParent} />
        </div>
      )}
    </article>
  )
}
