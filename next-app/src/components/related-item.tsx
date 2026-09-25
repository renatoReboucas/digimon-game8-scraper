// @ts-nocheck
'use client';

import { Filter } from 'lucide-react';
import { DigimonImage } from './digimon-image';
import { Game8Link } from './game8-link';

export function RelatedItem({ item, onSelectParent }) {
  return (
    <article className="related-item">
      <DigimonImage item={item} className="related-image" />
      <div className="related-content">
        <h4>{item.name}</h4>
        <div className="related-actions">
          <Game8Link item={item} />
          <button
            className="parent-filter-button"
            type="button"
            title="Filtrar pelo card pai"
            aria-label={`Filtrar pelo card pai de ${item.name}`}
            onClick={() => onSelectParent(item.id)}
          >
            <Filter aria-hidden="true" size={14} strokeWidth={1.8} />
            Filtrar
          </button>
        </div>
      </div>
    </article>
  );
}
