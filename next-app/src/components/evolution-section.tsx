'use client'

import type { DigimonEvolutionReference } from '@/types/DigimonTypes'
import { RelatedItem } from './related-item'

interface EvolutionSectionProps {
  title: string
  items: DigimonEvolutionReference[]
  onSelectParent?: ((name: string) => void) | undefined
}

export function EvolutionSection({ title, items, onSelectParent }: EvolutionSectionProps) {
  return (
    <section className="evolution-section">
      <h3>{title}</h3>
      {!items.length ? (
        <p className="empty-state">Nenhum registro</p>
      ) : (
        <div className="related-grid">
          {items.map((item, index) => {
            const key = typeof item === 'string' ? item : item.id ?? item.url ?? item.name ?? 'evolution'

            return (
              <RelatedItem
                key={`${key}-${index}`}
                item={item}
                onSelectParent={onSelectParent}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
