// @ts-nocheck
'use client';

import { ChevronDown, ChevronUp, Search, Star } from 'lucide-react';
import { DigimonImage } from './digimon-image';
import { EvolutionSection } from './evolution-section';
import { Game8Link } from './game8-link';

export function DigimonCard({ item, isFavorite, isExpanded, onToggleFavorite, onToggleExpanded, onSelectParent }) {
  const relations = item.Digivolutions || { evolutions: [], deEvolutions: [] };

  return (
    <article className="digimon-card">
      <div
        className="card-header"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={(event) => {
          if (!event.target.closest('button, a')) onToggleExpanded(item.id);
        }}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
            event.preventDefault();
            onToggleExpanded(item.id);
          }
        }}
      >
        <DigimonImage item={item} className="main-image" />
        <div className="identity">
          <span className="card-index">No. {item.number}</span>
          <h2>{item.name}</h2>
          <div className="tags">
            <span>{item.attribute}</span>
            <span>{item.generation}</span>
          </div>
        </div>
        <div className="card-actions">
          <button
            className="search-parent-button"
            type="button"
            title={`Pesquisar ${item.name} na busca`}
            aria-label={`Pesquisar ${item.name} na barra de busca`}
            onClick={(event) => {
              event.stopPropagation();
              onSelectParent?.(item.name);
            }}
          >
            <Search aria-hidden="true" size={15} strokeWidth={1.8} />
            <span>Buscar</span>
          </button>
          <button
            className={`favorite-button${isFavorite ? ' is-favorite' : ''}`}
            type="button"
            title={isFavorite ? 'Desfavoritar' : 'Favoritar'}
            aria-pressed={isFavorite}
            aria-label={`${isFavorite ? 'Desfavoritar' : 'Favoritar'} ${item.name}`}
            onClick={() => onToggleFavorite(item.id)}
          >
            <Star aria-hidden="true" size={17} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={1.8} />
            <span>{isFavorite ? 'Desfavoritar' : 'Favoritar'}</span>
          </button>
          <span className="expand-indicator" aria-hidden="true" title={isExpanded ? 'Recolher evolucoes' : 'Expandir evolucoes'}>
            {isExpanded ? <ChevronUp size={15} strokeWidth={1.8} /> : <ChevronDown size={15} strokeWidth={1.8} />}
          </span>
        </div>
      </div>
      <div className="card-meta">
        <span>Base Personality: {item.basePersonality}</span>
        <span>Agent Rank Req.: {item.agentRankReq}</span>
        <Game8Link item={item} />
      </div>
      {isExpanded && (
        <div className="evolution-details">
          <EvolutionSection title="Evolutions" items={relations.evolutions || []} onSelectParent={onSelectParent} />
          <div className="divider" role="separator" />
          <EvolutionSection title="De-evolutions" items={relations.deEvolutions || []} onSelectParent={onSelectParent} />
        </div>
      )}
    </article>
  );
}
