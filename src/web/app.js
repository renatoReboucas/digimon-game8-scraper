import { filterDigimons, readFavoriteIds, saveFavoriteIds, toggleFavorite } from './favorites.js';

const list = document.querySelector('#digimon-list');
const searchInput = document.querySelector('#search-input');
const favoritesToggle = document.querySelector('#favorites-toggle');
const resultCount = document.querySelector('#result-count');
let digimons = [];
let query = '';
let showFavorites = false;
let selectedParentId = null;
let favoriteIds;
const expanded = new Set();

try {
  favoriteIds = readFavoriteIds(window.localStorage);
} catch {
  favoriteIds = new Set();
}

function imageSource(item) {
  return item.localImageUrl || item.imageUrl || '';
}

function createImage(item, className) {
  const image = document.createElement('img');
  image.className = className;
  image.src = imageSource(item);
  image.alt = item.name || 'Digimon';
  image.loading = 'lazy';
  image.addEventListener('error', () => image.remove());
  return image;
}

function createGame8Button(item) {
  const link = document.createElement('a');
  link.className = 'game8-link';
  link.href = item.url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.title = 'Abrir no Game8';
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', 'external-link');
  link.append(icon, document.createTextNode('Game8'));
  return link;
}

function createRelatedItem(item, parentId) {
  const related = document.createElement('article');
  related.className = 'related-item';
  related.append(createImage(item, 'related-image'));
  const content = document.createElement('div');
  content.className = 'related-content';
  const name = document.createElement('h4');
  name.textContent = item.name;
  const actions = document.createElement('div');
  actions.className = 'related-actions';
  actions.append(createGame8Button(item));
  const parentButton = document.createElement('button');
  parentButton.className = 'parent-filter-button';
  parentButton.type = 'button';
  parentButton.title = 'Ver card pai';
  parentButton.setAttribute('aria-label', `Mostrar somente o card pai de ${item.name}`);
  const parentIcon = document.createElement('i');
  parentIcon.setAttribute('data-lucide', 'arrow-up');
  parentButton.append(parentIcon);
  parentButton.addEventListener('click', () => {
    const parent = digimons.find((candidate) => String(candidate.id) === String(parentId));
    selectedParentId = null;
    query = parent?.name || '';
    searchInput.value = query;
    render();
  });
  actions.append(parentButton);
  content.append(name, actions);
  related.append(content);
  return related;
}

function createSection(title, items, parentId) {
  const section = document.createElement('section');
  section.className = 'evolution-section';
  const heading = document.createElement('h3');
  heading.textContent = title;
  section.append(heading);
  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Nenhum registro';
    section.append(empty);
  } else {
    const grid = document.createElement('div');
    grid.className = 'related-grid';
    items.forEach((item) => grid.append(createRelatedItem(item, parentId)));
    section.append(grid);
  }
  return section;
}

function createCard(item) {
  const card = document.createElement('article');
  card.className = 'digimon-card';
  const header = document.createElement('div');
  header.className = 'card-header';
  header.append(createImage(item, 'main-image'));
  const identity = document.createElement('div');
  identity.className = 'identity';
  const name = document.createElement('h2');
  name.textContent = item.name;
  identity.append(name, createGame8Button(item));
  header.append(identity);
  const cardActions = document.createElement('div');
  cardActions.className = 'card-actions';
  const favoriteButton = document.createElement('button');
  const isFavorite = favoriteIds.has(String(item.id));
  favoriteButton.className = 'favorite-button';
  favoriteButton.type = 'button';
  favoriteButton.title = isFavorite ? 'Desfavoritar' : 'Favoritar';
  favoriteButton.setAttribute('aria-pressed', String(isFavorite));
  favoriteButton.setAttribute('aria-label', `${isFavorite ? 'Desfavoritar' : 'Favoritar'} ${item.name}`);
  const favoriteIcon = document.createElement('i');
  favoriteIcon.setAttribute('data-lucide', 'star');
  favoriteButton.append(favoriteIcon);
  favoriteButton.addEventListener('click', () => {
    favoriteIds = toggleFavorite(favoriteIds, item.id);
    try {
      saveFavoriteIds(window.localStorage, favoriteIds);
    } catch {
      saveFavoriteIds(null, favoriteIds);
    }
    render();
  });
  cardActions.append(favoriteButton);
  const expansionIndicator = document.createElement('span');
  expansionIndicator.className = 'expand-indicator';
  expansionIndicator.title = expanded.has(item.id) ? 'Recolher evoluções' : 'Ver evoluções';
  expansionIndicator.setAttribute('aria-hidden', 'true');
  const expansionIcon = document.createElement('i');
  expansionIcon.setAttribute('data-lucide', expanded.has(item.id) ? 'chevron-up' : 'chevron-down');
  expansionIndicator.append(expansionIcon);
  cardActions.append(expansionIndicator);
  const toggleExpansion = () => {
    if (expanded.has(item.id)) expanded.delete(item.id);
    else expanded.add(item.id);
    render();
  };
  header.setAttribute('role', 'button');
  header.tabIndex = 0;
  header.setAttribute('aria-expanded', String(expanded.has(item.id)));
  header.addEventListener('click', (event) => {
    if (event.target.closest('button, a')) return;
    toggleExpansion();
  });
  header.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target === header) {
      event.preventDefault();
      toggleExpansion();
    }
  });
  header.append(cardActions);
  card.append(header);

  if (expanded.has(item.id)) {
    const details = document.createElement('div');
    details.className = 'evolution-details';
    const relations = item.Digivolutions || { evolutions: [], deEvolutions: [] };
    details.append(createSection('Evolutions', relations.evolutions || [], item.id));
    const divider = document.createElement('div');
    divider.className = 'divider';
    divider.setAttribute('role', 'separator');
    details.append(divider, createSection('De-evolutions', relations.deEvolutions || [], item.id));
    card.append(details);
  }
  return card;
}

function render() {
  const filtered = filterDigimons(digimons, query, showFavorites, favoriteIds, selectedParentId);
  const favoriteCount = digimons.filter((item) => favoriteIds.has(String(item.id))).length;
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'Digimon encontrado' : 'Digimons encontrados'} · ${favoriteCount} favoritos`;
  list.replaceChildren();
  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'page-empty';
    empty.textContent = selectedParentId !== null
      ? 'O card pai não corresponde aos filtros atuais.'
      : showFavorites ? 'Nenhum favorito corresponde aos filtros atuais.'
      : query ? 'Nenhum Digimon corresponde à pesquisa.' : 'Nenhum Digimon disponível.';
    list.append(empty);
    return;
  }
  filtered.forEach((item) => list.append(createCard(item)));
  window.lucide?.createIcons();
}

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  render();
});

favoritesToggle.addEventListener('change', (event) => {
  showFavorites = event.target.checked;
  render();
});

fetch('/api/digimons')
  .then((response) => {
    if (!response.ok) throw new Error('Falha ao carregar os dados.');
    return response.json();
  })
  .then((items) => {
    digimons = Array.isArray(items) ? items : [];
    render();
  })
  .catch((error) => {
    resultCount.textContent = error.message;
  });
