// @ts-nocheck
'use client';

import { ChevronDown, ChevronUp, Filter, MonitorCloud, Search, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const FAVORITES_STORAGE_KEY = 'digimon-atlas:favorites:v1';

function imageSource(item) {
  return item.localImageUrl || item.imageUrl || '';
}

function readFavorites() {
  try {
    const value = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
    return new Set(Array.isArray(value) ? value.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveFavorites(favoriteIds) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favoriteIds]));
  } catch {
    // A interface continua funcional quando o armazenamento estiver bloqueado.
  }
}

function Image({ item, className }) {
  const [source, setSource] = useState(imageSource(item));

  return (
    <img
      className={className}
      src={source}
      alt={item.name || 'Digimon'}
      loading="lazy"
      onError={() => {
        if (source !== item.imageUrl && item.imageUrl) setSource(item.imageUrl);
      }}
    />
  );
}

function Game8Link({ item }) {
  return (
    <a className="game8-link" href={item.url} target="_blank" rel="noreferrer" title="Abrir no Game8">
      <MonitorCloud aria-hidden="true" size={15} strokeWidth={1.8} />
      Game8
    </a>
  );
}

function RelatedItem({ item, onSelectParent }) {
  return (
    <article className="related-item">
      <Image item={item} className="related-image" />
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

function EvolutionSection({ title, items, onSelectParent }) {
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

function DigimonCard({ item, isFavorite, isExpanded, onToggleFavorite, onToggleExpanded, onSelectParent }) {
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
        <Image item={item} className="main-image" />
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

export default function DigimonAtlas({ digimons, loadError = '' }) {
  const [query, setQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [selectedParentId, setSelectedParentId] = useState(null);

  useEffect(() => setFavoriteIds(readFavorites()), []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    return digimons.filter((item) => {
      const matchesQuery = item.name?.toLocaleLowerCase('pt-BR').includes(normalizedQuery);
      const matchesFavorite = !showFavorites || favoriteIds.has(String(item.id));
      const matchesParent = selectedParentId === null || String(item.id) === String(selectedParentId);
      return matchesQuery && matchesFavorite && matchesParent;
    });
  }, [digimons, favoriteIds, query, selectedParentId, showFavorites]);

  function toggleFavorite(id) {
    const next = new Set(favoriteIds);
    const normalizedId = String(id);
    if (next.has(normalizedId)) next.delete(normalizedId);
    else next.add(normalizedId);
    setFavoriteIds(next);
    saveFavorites(next);
  }

  function toggleExpanded(id) {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  }

  function selectParent(id) {
    const parent = digimons.find((item) => String(item.id) === String(id));
    setSelectedParentId(null);
    setShowFavorites(false);
    setQuery(parent?.name || '');
  }

  const favoriteCount = digimons.filter((item) => favoriteIds.has(String(item.id))).length;
  const emptyMessage = selectedParentId !== null
    ? 'O card pai nao corresponde aos filtros atuais.'
    : showFavorites
      ? 'Nenhum favorito corresponde aos filtros atuais.'
      : query
        ? 'Nenhum Digimon corresponde a pesquisa.'
        : 'Nenhum Digimon disponivel.';

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">Digimon Story Time Stranger</p>
        <h1>Digimon Atlas</h1>
        <p className="subtitle">Pesquise a linha evolutiva completa do seu Digimon.</p>
        <label className="search-box" htmlFor="search-input">
          <Search aria-hidden="true" size={18} strokeWidth={1.8} />
          <input
            id="search-input"
            type="search"
            placeholder="Pesquisar por nome..."
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="favorites-filter" htmlFor="favorites-toggle">
          <input
            id="favorites-toggle"
            type="checkbox"
            checked={showFavorites}
            onChange={(event) => setShowFavorites(event.target.checked)}
          />
          <span>Apenas favoritos</span>
        </label>
        <p className="result-count" aria-live="polite">
          {loadError || `${filtered.length} ${filtered.length === 1 ? 'Digimon encontrado' : 'Digimons encontrados'} · ${favoriteCount} favoritos`}
        </p>
      </header>
      <section className="digimon-list" aria-live="polite">
        {!loadError && !filtered.length ? <p className="page-empty">{emptyMessage}</p> : null}
        {!loadError && filtered.map((item) => (
          <DigimonCard
            key={item.id}
            item={item}
            isFavorite={favoriteIds.has(String(item.id))}
            isExpanded={expandedIds.has(item.id)}
            onToggleFavorite={toggleFavorite}
            onToggleExpanded={toggleExpanded}
            onSelectParent={selectParent}
          />
        ))}
      </section>
    </main>
  );
}
