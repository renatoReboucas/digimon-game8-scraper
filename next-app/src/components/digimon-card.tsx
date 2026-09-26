'use client'

import { ChevronDown, Funnel, Star } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import type { Digimon } from '@/types/DigimonTypes'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { DigimonImage } from './digimon-image'
import { DigimonMetadataGrid } from './digimon-metadata-grid'
import { EvolutionSection } from './evolution-section'
import { Link } from './link'
import { observeCardEntrance, useAnimeDisclosure } from './anime-animations'

interface DigimonCardProps {
  item: Digimon
  isFavorite: boolean
  canSaveFavorites?: boolean
  initiallyExpanded: boolean
  onToggleFavorite: (id: string | number) => void
  onExpandedChange: (id: string | number, expanded: boolean) => void
  onSelectParent?: (name: string) => void
}

function DigimonCardComponent({ item, isFavorite, canSaveFavorites = true, initiallyExpanded, onToggleFavorite, onExpandedChange, onSelectParent }: DigimonCardProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded)
  const { panelRef, isPanelVisible } = useAnimeDisclosure(isExpanded, initiallyExpanded)
  const contentRef = useRef<HTMLDivElement>(null)
  const cardId = String(item.id ?? item.url ?? item.name ?? '')
  const relations = item.Digivolutions ?? { evolutions: [], deEvolutions: [] }

  useEffect(() => {
    const card = contentRef.current?.closest('.digimon-card')
    if (!(card instanceof HTMLElement)) return
    return observeCardEntrance(card)
  }, [])

  function toggleExpanded() {
    const nextExpanded = !isExpanded
    setIsExpanded(nextExpanded)
    onExpandedChange(cardId, nextExpanded)
  }

  return (
    <Card
      className="digimon-card"
      role="article"
      onClick={(event) => {
        if (!(event.target instanceof Element)) return
        if (event.target.closest('button, a, .evolution-details')) return
        toggleExpanded()
      }}
    >
      <div className="digimon-accordion-item" ref={contentRef}>
        <div className="card-header">
          <DigimonImage item={item} className="main-image" />
          <div className="identity">
            {item.number != null && <Badge variant="outline" className="card-index">No. {item.number}</Badge>}
            <div className="title-row">
              <h2>{item.name}</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="card-expand-button accordion-trigger"
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? 'Recolher' : 'Expandir'} evoluções de ${item.name ?? 'Digimon'}`}
                    onClick={toggleExpanded}
                  >
                    <ChevronDown className={`accordion-chevron${isExpanded ? ' is-rotated' : ''}`} aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isExpanded ? 'Recolher' : 'Expandir'} evoluções de {item.name ?? 'Digimon'}</TooltipContent>
              </Tooltip>
            </div>
            <div className="tags">
              {item.attribute && <Badge variant="secondary">{item.attribute}</Badge>}
              {item.generation && <Badge variant="secondary">{item.generation}</Badge>}
            </div>
          </div>
          <div className="card-actions">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="name-filter-button"
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label={`Filtrar ${item.name} na barra de busca`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelectParent?.(item.name ?? '')
                    }}
                  >
                    <Funnel aria-hidden="true" size={15} strokeWidth={1.8} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Filtrar {item.name} na busca</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className={`favorite-button${isFavorite ? ' is-favorite' : ''}${canSaveFavorites ? '' : ' needs-consent'}`}
                    variant="ghost"
                    type="button"
                    aria-pressed={isFavorite}
                    aria-label={`${isFavorite ? 'Desfavoritar' : 'Favoritar'} ${item.name}`}
                    onClick={() => onToggleFavorite(cardId)}
                  >
                    <Star aria-hidden="true" size={17} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={1.8} />
                    <span>{isFavorite ? 'Desfavoritar' : 'Favoritar'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFavorite ? 'Remover dos favoritos' : canSaveFavorites ? 'Adicionar aos favoritos' : 'Autorize o salvamento para favoritar'}
                </TooltipContent>
              </Tooltip>
          </div>
        </div>
        <div className="card-meta-section">
          <DigimonMetadataGrid digimon={item} className="parent-metadata-grid" />
          <div className="card-meta-footer">
            <Link item={item} />
          </div>
        </div>
        {isPanelVisible && (
          <div
            className="evolution-details"
            ref={panelRef}
            aria-hidden={!isExpanded}
            inert={!isExpanded}
          >
            <EvolutionSection title="Evolutions" items={relations.evolutions ?? []} onSelectParent={onSelectParent} />
            <div className="divider" role="separator" />
            <EvolutionSection title="De-evolutions" items={relations.deEvolutions ?? []} onSelectParent={onSelectParent} />
          </div>
        )}
      </div>
    </Card>
  )
}

export const DigimonCard = memo(DigimonCardComponent)
