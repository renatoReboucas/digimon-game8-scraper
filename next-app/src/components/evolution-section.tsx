'use client'

import type { Digimon } from '@/types/DigimonTypes'
import { RelatedItem } from './related-item'

interface EvolutionSectionProps {
  title: string
  items: Array<Partial<Digimon>>
  onSelectParent?: (name: string) => void
}

export function EvolutionSection({ title, items, onSelectParent }: EvolutionSectionProps) {
  return (
    <section className="evolution-section">
      <h3>{title}</h3>
      {!items.length ? (
        <p className="empty-state">Nenhum registro</p>
      ) : (
        <div className="related-grid">
          {items.map((item, index) => (
            <RelatedItem
              key={`${item.id ?? item.url ?? item.name ?? 'evolution'}-${index}`}
              item={item as Digimon}
              onSelectParent={onSelectParent}
            />
          ))}
        </div>
      )}
    </section>
  )
}
