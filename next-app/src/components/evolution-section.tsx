// @ts-nocheck
'use client';

import { RelatedItem } from './related-item';

export function EvolutionSection({ title, items, onSelectParent }) {
  return (
    <section className="evolution-section">
      <h3>{title}</h3>
      {!items.length ? (
        <p className="empty-state">Nenhum registro</p>
      ) : (
        <div className="related-grid">
          {items.map((item, index) => (
            <RelatedItem
              key={`${item.id || item.url || item.name}-${index}`}
              item={item}
              onSelectParent={onSelectParent}
            />
          ))}
        </div>
      )}
    </section>
  );
}
