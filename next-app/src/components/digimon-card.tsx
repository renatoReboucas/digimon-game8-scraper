'use client'

import { Funnel, Star } from 'lucide-react'
import type { Digimon } from '@/types/DigimonTypes'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card } from './ui/card'
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
    <Card className="digimon-card" role="article">
      <Accordion
        type="single"
        collapsible
        value={isExpanded ? cardId : ''}
        onValueChange={(value) => {
          if ((value === cardId) !== isExpanded) onToggleExpanded(cardId)
        }}
      >
        <AccordionItem value={cardId} className="digimon-accordion-item">
          <div className="card-header">
            <AccordionTrigger className="card-header-trigger" aria-label={`${isExpanded ? 'Recolher' : 'Expandir'} evolucoes de ${item.name ?? 'Digimon'}`}>
              <DigimonImage item={item} className="main-image" />
              <div className="identity">
                <Badge variant="outline" className="card-index">No. {item.number}</Badge>
                <div className="title-row">
                  <h2>{item.name}</h2>
                </div>
                <div className="tags">
                  {item.attribute && <Badge variant="secondary">{item.attribute}</Badge>}
                  {item.generation && <Badge variant="secondary">{item.generation}</Badge>}
                </div>
              </div>
            </AccordionTrigger>
            <div className="card-actions">
              <Button
                className="name-filter-button"
                variant="ghost"
                size="icon"
                type="button"
                title={`Filtrar ${item.name} na busca`}
                aria-label={`Filtrar ${item.name} na barra de busca`}
                onClick={(event) => {
                  event.stopPropagation()
                  onSelectParent?.(item.name ?? '')
                }}
              >
                <Funnel aria-hidden="true" size={15} strokeWidth={1.8} />
              </Button>
              <Button
                className={`favorite-button${isFavorite ? ' is-favorite' : ''}`}
                variant="ghost"
                type="button"
                title={isFavorite ? 'Desfavoritar' : 'Favoritar'}
                aria-pressed={isFavorite}
                aria-label={`${isFavorite ? 'Desfavoritar' : 'Favoritar'} ${item.name}`}
                onClick={() => onToggleFavorite(cardId)}
              >
                <Star aria-hidden="true" size={17} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={1.8} />
                <span>{isFavorite ? 'Desfavoritar' : 'Favoritar'}</span>
              </Button>
            </div>
          </div>
          <div className="card-meta-section">
            <DigimonMetadataGrid digimon={item} className="parent-metadata-grid" />
            <div className="card-meta-footer">
              <Link item={item} />
            </div>
          </div>
          <AccordionContent className="evolution-details">
            <EvolutionSection title="Evolutions" items={relations.evolutions ?? []} onSelectParent={onSelectParent} />
            <div className="divider" role="separator" />
            <EvolutionSection title="De-evolutions" items={relations.deEvolutions ?? []} onSelectParent={onSelectParent} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
