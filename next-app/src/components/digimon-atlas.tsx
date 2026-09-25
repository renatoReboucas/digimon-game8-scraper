// @ts-nocheck
'use client';

import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DigimonCard } from './digimon-card';
import { readFavorites, saveFavorites } from './lib/favorites';

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

  function selectParent(name) {
    setSelectedParentId(null);
    setShowFavorites(false);
    setQuery(name || '');
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
