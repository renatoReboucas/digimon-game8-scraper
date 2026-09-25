// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Digimon } from '@/types/DigimonTypes'
import { FAVORITES_STORAGE_KEY } from './lib/favorites'
import DigimonAtlas from './digimon-atlas'
import { renderWithTooltip as render } from '../test/test-utils'

const digimons: Digimon[] = [
  { id: '1', name: 'Agumon', number: '007', url: 'https://game8.co/agumon' },
  { id: '2', name: 'Gabumon', number: '008', url: 'https://game8.co/gabumon' },
]

function renderAtlas(items = digimons, loadError = '', onUrlUpdate = vi.fn()) {
  const result = render(
    <NuqsTestingAdapter onUrlUpdate={onUrlUpdate}>
      <DigimonAtlas digimons={items} loadError={loadError} />
    </NuqsTestingAdapter>,
  )
  return { ...result, onUrlUpdate }
}

beforeEach(() => window.localStorage.clear())

describe('DigimonAtlas', () => {
  it('renderiza o catálogo com controles nomeados e sem violações axe', async () => {
    const { container } = renderAtlas()

    expect(screen.getByRole('heading', { level: 1, name: 'Digimon Atlas' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Pesquisar por nome' })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Apenas favoritos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Agumon' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Gabumon' })).toBeInTheDocument()

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.map(({ id, help }) => ({ id, help }))).toEqual([])
  })

  it('filtra enquanto digita, sincroniza a URL e permite limpar a pesquisa', async () => {
    const user = userEvent.setup()
    const { onUrlUpdate } = renderAtlas()
    const search = screen.getByRole('textbox', { name: 'Pesquisar por nome' })

    await user.type(search, '  AGU')
    expect(await screen.findByRole('heading', { level: 2, name: 'Agumon' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Gabumon' })).not.toBeInTheDocument()
    expect(onUrlUpdate).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Limpar pesquisa' }))
    expect(search).toHaveValue('')
    expect(await screen.findByRole('heading', { level: 2, name: 'Gabumon' })).toBeInTheDocument()
  })

  it('restaura, salva e filtra favoritos', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['2']))
    renderAtlas()

    const favoritesSwitch = screen.getByRole('switch', { name: 'Apenas favoritos' })
    await user.click(favoritesSwitch)
    expect(await screen.findByRole('heading', { level: 2, name: 'Gabumon' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Agumon' })).not.toBeInTheDocument()

    await user.click(favoritesSwitch)
    await user.click(screen.getByRole('button', { name: 'Favoritar Agumon' }))
    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe(JSON.stringify(['2', '1']))
    expect(screen.getByRole('button', { name: 'Desfavoritar Agumon' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(favoritesSwitch)
    expect(await screen.findByRole('heading', { level: 2, name: 'Agumon' })).toBeInTheDocument()
  })

  it('mostra estados vazios por catálogo e por pesquisa', async () => {
    const user = userEvent.setup()
    const { rerender } = renderAtlas([])
    expect(screen.getByText('Nenhum Digimon disponivel.')).toBeInTheDocument()

    rerender(
      <NuqsTestingAdapter>
        <DigimonAtlas digimons={digimons} />
      </NuqsTestingAdapter>,
    )
    await user.type(screen.getByRole('textbox', { name: 'Pesquisar por nome' }), 'Veemon')
    expect(await screen.findByText('Nenhum Digimon corresponde a pesquisa.')).toBeInTheDocument()
  })

  it('mostra um estado vazio específico quando não há favoritos', async () => {
    const user = userEvent.setup()
    renderAtlas()

    await user.click(screen.getByRole('switch', { name: 'Apenas favoritos' }))

    expect(screen.getByText('Nenhum favorito corresponde aos filtros atuais.')).toBeInTheDocument()
  })

  it('apresenta o erro de carregamento sem exibir o estado vazio', () => {
    renderAtlas([], 'Catálogo indisponível')

    expect(screen.getByText('Catálogo indisponível')).toBeInTheDocument()
    expect(screen.queryByText('Nenhum Digimon disponivel.')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Favoritar/ })).not.toBeInTheDocument()
  })

  it('filtra pelo botão de nome do card e move o foco para a busca', async () => {
    const user = userEvent.setup()
    renderAtlas()

    await user.click(screen.getByRole('button', { name: 'Filtrar Agumon na barra de busca' }))
    expect(screen.getByRole('textbox', { name: 'Pesquisar por nome' })).toHaveValue('Agumon')
    expect(screen.getByRole('textbox', { name: 'Pesquisar por nome' })).toHaveFocus()
    expect(screen.queryByRole('heading', { level: 2, name: 'Gabumon' })).not.toBeInTheDocument()
  })
})