import { filterDigimons, readFavoriteIds, saveFavoriteIds, toggleFavorite } from './favorites.js';

const list = document.querySelector('#digimon-list');
const searchInput = document.querySelector('#search-input');
const favoritesToggle = document.querySelector('#favorites-toggle');
const resultCount = document.querySelector('#result-count');
let digimons = [];
let query = '';
let showFavorites = false;
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
  link.textContent = 'Ver no Game8';
  return link;
}

function createRelatedItem(item) {
  const related = document.createElement('article');
  related.className = 'related-item';
  related.append(createImage(item, 'related-image'));
  const content = document.createElement('div');
  content.className = 'related-content';
  const name = document.createElement('h4');
  name.textContent = item.name;
  content.append(name, createGame8Button(item));
  related.append(content);
  return related;
}

function createSection(title, items) {
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
    items.forEach((item) => grid.append(createRelatedItem(item)));
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
  const favoriteButton = document.createElement('button');
  const isFavorite = favoriteIds.has(String(item.id));
  favoriteButton.className = 'favorite-button';
  favoriteButton.type = 'button';
  favoriteButton.textContent = isFavorite ? 'Favoritado' : 'Favoritar';
  favoriteButton.setAttribute('aria-pressed', String(isFavorite));
  favoriteButton.setAttribute('aria-label', `${isFavorite ? 'Desfavoritar' : 'Favoritar'} ${item.name}`);
  favoriteButton.addEventListener('click', () => {
    favoriteIds = toggleFavorite(favoriteIds, item.id);
    try {
      saveFavoriteIds(window.localStorage, favoriteIds);
    } catch {
      saveFavoriteIds(null, favoriteIds);
    }
    render();
  });
  header.append(favoriteButton);
  const toggle = document.createElement('button');
  toggle.className = 'expand-button';
  toggle.type = 'button';
  toggle.textContent = expanded.has(item.id) ? 'Recolher' : 'Ver evoluções';
  toggle.setAttribute('aria-expanded', String(expanded.has(item.id)));
  toggle.addEventListener('click', () => {
    if (expanded.has(item.id)) expanded.delete(item.id);
    else expanded.add(item.id);
    render();
  });
  header.append(toggle);
  card.append(header);

  if (expanded.has(item.id)) {
    const details = document.createElement('div');
    details.className = 'evolution-details';
    const relations = item.Digivolutions || { evolutions: [], deEvolutions: [] };
    details.append(createSection('Evolutions', relations.evolutions || []));
    const divider = document.createElement('div');
    divider.className = 'divider';
    divider.setAttribute('role', 'separator');
    details.append(divider, createSection('De-evolutions', relations.deEvolutions || []));
    card.append(details);
  }
  return card;
}

function render() {
  const filtered = filterDigimons(digimons, query, showFavorites, favoriteIds);
  const favoriteCount = digimons.filter((item) => favoriteIds.has(String(item.id))).length;
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'Digimon encontrado' : 'Digimons encontrados'} · ${favoriteCount} favoritos`;
  list.replaceChildren();
  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'page-empty';
    empty.textContent = showFavorites
      ? 'Nenhum favorito corresponde aos filtros atuais.'
      : query ? 'Nenhum Digimon corresponde à pesquisa.' : 'Nenhum Digimon disponível.';
    list.append(empty);
    return;
  }
  filtered.forEach((item) => list.append(createCard(item)));
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
