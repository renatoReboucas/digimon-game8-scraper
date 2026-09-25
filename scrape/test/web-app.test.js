// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const catalog = [
  {
    id: '1',
    name: 'Agumon',
    url: 'https://game8.co/agumon',
    imageUrl: 'https://images.test/agumon.png',
    localImageUrl: '/images/agumon.png',
    Digivolutions: {
      evolutions: [{ name: 'Greymon', url: 'https://game8.co/greymon', imageUrl: '/images/greymon.png' }],
      deEvolutions: [],
    },
  },
  {
    id: '2',
    name: 'Gabumon',
    url: 'https://game8.co/gabumon',
    imageUrl: 'https://images.test/gabumon.png',
    Digivolutions: { evolutions: [], deEvolutions: [] },
  },
];
let moduleInstance = 0;

async function bootApp({ ok = true, items = catalog, error } = {}) {
  vi.resetModules();
  document.body.innerHTML = `
    <input id="search-input" aria-label="Pesquisar">
    <input id="favorites-toggle" type="checkbox" aria-label="Apenas favoritos">
    <p id="result-count" aria-live="polite"></p>
    <section id="digimon-list"></section>
  `;
  Object.defineProperty(window, 'lucide', { configurable: true, value: { createIcons: vi.fn() } });
  vi.stubGlobal('fetch', error
    ? vi.fn().mockRejectedValue(error)
    : vi.fn().mockResolvedValue({ ok, json: async () => items }));
  await import('../src/web/app.js');
  await vi.waitFor(() => {
    expect(document.querySelector('#result-count').textContent).not.toBe('');
  });
}

beforeEach(() => {
  vi.resetModules();
  window.localStorage.clear();
});

afterEach(() => {
  document.body.replaceChildren();
});

describe('frontend web legado', () => {
  it('carrega cartões com imagens locais prioritárias e links seguros', async () => {
    await bootApp()

    expect(document.querySelectorAll('.digimon-card')).toHaveLength(2)
    expect(document.querySelector('#result-count').textContent).toBe('2 Digimons encontrados · 0 favoritos')
    expect(document.querySelector('.main-image')).toHaveAttribute('src', '/images/agumon.png')
    expect(document.querySelector('.main-image')).toHaveAttribute('alt', 'Agumon')
    expect(document.querySelector('.digimon-card a')).toHaveAttribute('target', '_blank')
    expect(document.querySelector('.digimon-card a')).toHaveAttribute('rel', 'noreferrer')
    expect(window.lucide.createIcons).toHaveBeenCalled()
  })

  it('expande com clique/teclado, preserva links internos e filtra pelo card pai', async () => {
    await bootApp()
    const header = document.querySelector('.card-header')

    header.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(document.querySelector('.card-header')).toHaveAttribute('aria-expanded', 'true')
    expect(document.querySelectorAll('.evolution-section')).toHaveLength(2)
    expect(document.querySelector('.divider')).toHaveAttribute('role', 'separator')

    const relatedLink = document.querySelector('.related-item a')
    relatedLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(document.querySelector('.card-header')).toHaveAttribute('aria-expanded', 'true')

    document.querySelector('.parent-filter-button').click()
    expect(document.querySelector('#search-input')).toHaveValue('Agumon')
    expect(document.querySelectorAll('.digimon-card')).toHaveLength(1)

    const filteredHeader = document.querySelector('.card-header')
    filteredHeader.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
    expect(filteredHeader).toHaveAttribute('aria-expanded', 'true')
  })

  it('persiste favoritos e aplica filtro combinado com busca', async () => {
    await bootApp()
    document.querySelector('.favorite-button').click()

    expect(document.querySelector('.favorite-button')).toHaveAttribute('aria-pressed', 'true')
    expect(window.localStorage.getItem('digimon-atlas:favorites:v1')).toBe('["1"]')

    const favoritesToggle = document.querySelector('#favorites-toggle')
    favoritesToggle.checked = true
    favoritesToggle.dispatchEvent(new Event('change', { bubbles: true }))
    expect(document.querySelectorAll('.digimon-card')).toHaveLength(1)

    const search = document.querySelector('#search-input')
    search.value = 'Gabu'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    expect(document.querySelector('.page-empty')).toHaveTextContent('Nenhum favorito corresponde aos filtros atuais.')

    favoritesToggle.checked = false
    favoritesToggle.dispatchEvent(new Event('change', { bubbles: true }))
    expect(document.querySelector('.digimon-card h2')).toHaveTextContent('Gabumon')
  })

  it('apresenta estados vazios para catálogo e favoritos sem correspondência', async () => {
    await bootApp({ items: [] })
    expect(document.querySelector('.page-empty')).toHaveTextContent('Nenhum Digimon disponível.')

    await bootApp()
    const favoritesToggle = document.querySelector('#favorites-toggle')
    favoritesToggle.checked = true
    favoritesToggle.dispatchEvent(new Event('change', { bubbles: true }))
    expect(document.querySelector('.page-empty')).toHaveTextContent('Nenhum favorito corresponde aos filtros atuais.')
  })

  it('mostra falhas HTTP/rede e trata payload que não é uma lista', async () => {
    await bootApp({ ok: false })
    expect(document.querySelector('#result-count')).toHaveTextContent('Falha ao carregar os dados.')

    await bootApp({ error: new Error('Rede indisponível') })
    expect(document.querySelector('#result-count')).toHaveTextContent('Rede indisponível')

    await bootApp({ items: { records: [] } })
    expect(document.querySelector('.page-empty')).toHaveTextContent('Nenhum Digimon disponível.')
  })

  it('remove imagem que falha e suporta ativação do card com Enter', async () => {
    await bootApp()
    const image = document.querySelector('.main-image')
    image.dispatchEvent(new Event('error'))
    expect(image.isConnected).toBe(false)

    const header = document.querySelector('.card-header')
    header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    expect(document.querySelector('.card-header')).toHaveAttribute('aria-expanded', 'true')
  })
})