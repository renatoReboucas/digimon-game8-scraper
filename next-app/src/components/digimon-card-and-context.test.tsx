// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Digimon } from '@/types/DigimonTypes'
import { DigimonCard } from './digimon-card'
import { DigimonProvider, useDigimonLookup } from './digimon-context'
import { RelatedItem } from './related-item'
import { renderWithTooltip as render } from '../test/test-utils'

const catalog: Digimon[] = [
  {
    id: '1',
    name: 'Agumon',
    url: 'https://game8.co/agumon',
    number: '007',
    attribute: 'Vaccine',
    generation: 'Rookie',
    Digivolutions: { evolutions: [{ name: 'Greymon' }], deEvolutions: [] },
  },
  {
    id: '2',
    name: 'Greymon',
    url: 'https://game8.co/greymon',
    description: 'A brave dinosaur Digimon.',
    fields: ['Dragon', { name: 'Nature Spirits' }],
    skills: [{ skillName: 'Mega Flame', desc: 'A stream of fire.' }],
    priorEvolutions: ['Agumon'],
    evolutions: [{ name: 'MetalGreymon' }],
    customMetadata: { source: 'catalog' },
  },
]

function LookupSummary() {
  const { lookupDigimon, allDigimons } = useDigimonLookup()
  const byName = lookupDigimon({ name: ' agumon ' })
  const byUrl = lookupDigimon({ name: 'missing', url: 'https://game8.co/greymon' })
  const byId = lookupDigimon({ id: 2 })
  const missing = lookupDigimon({ name: 'missing' })

  return (
    <div>
      <span>{byName?.id}</span>
      <span>{byUrl?.name}</span>
      <span>{byId?.name}</span>
      <span>{String(missing)}</span>
      <span>{allDigimons.length}</span>
    </div>
  )
}

describe('DigimonProvider', () => {
  it('resolve referências por nome, URL e ID e expõe o catálogo', () => {
    render(<DigimonProvider digimons={catalog}><LookupSummary /></DigimonProvider>)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getAllByText('Greymon')).toHaveLength(2)
    expect(screen.getByText('null')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('usa catálogo vazio por padrão e retorna null sem provider', () => {
    function EmptySummary() {
      const { lookupDigimon, allDigimons } = useDigimonLookup()
      return <output>{`${allDigimons.length}:${lookupDigimon({ name: 'Agumon' })}`}</output>
    }

    render(<DigimonProvider><EmptySummary /></DigimonProvider>)
    expect(screen.getByText('0:null')).toBeInTheDocument()
  })

  it('ignora referências sem campos indexáveis e aceita IDs zero e nomes com espaços', () => {
    function SparseSummary() {
      const { lookupDigimon } = useDigimonLookup()
      return <output>{lookupDigimon({ id: 0 })?.name ?? 'not-found'}</output>
    }

    render(
      <DigimonProvider digimons={[
        {} as Digimon,
        { id: 0, name: 'Zero' },
        { id: '3', name: '   ', url: '   ' },
      ]}>
        <SparseSummary />
      </DigimonProvider>,
    )

    expect(screen.getByText('Zero')).toBeInTheDocument()
  })
})

describe('DigimonCard', () => {
  it('expande relações, alterna favorito e filtra pelo nome sem propagar os botões', () => {
    const onToggleFavorite = vi.fn()
    const onExpandedChange = vi.fn()
    const onSelectParent = vi.fn()
    const { getByRole } = render(
      <DigimonProvider digimons={catalog}>
        <DigimonCard
          item={catalog[0]!}
          isFavorite={false}
          initiallyExpanded={false}
          onToggleFavorite={onToggleFavorite}
          onExpandedChange={onExpandedChange}
          onSelectParent={onSelectParent}
        />
      </DigimonProvider>,
    )

    const expand = getByRole('button', { name: 'Expandir evoluções de Agumon' })
    fireEvent.click(getByRole('button', { name: 'Favoritar Agumon' }))
    expect(onToggleFavorite).toHaveBeenCalledWith('1')
    expect(expand).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(getByRole('button', { name: 'Filtrar Agumon na barra de busca' }))
    expect(onSelectParent).toHaveBeenCalledWith('Agumon')
    expect(expand).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(expand)
    expect(expand).toHaveAttribute('aria-expanded', 'true')
    expect(onExpandedChange).toHaveBeenCalledWith('1', true)
    expect(screen.getByRole('heading', { name: 'Evolutions' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'De-evolutions' })).toBeInTheDocument()
  })

  it('inicia expandido, recolhe pelo botão e também alterna ao clicar na área do artigo', () => {
    const onExpandedChange = vi.fn()
    const { getByRole, container } = render(
      <DigimonCard
        item={{ id: '3', name: 'Patamon' }}
        isFavorite
        initiallyExpanded
        onToggleFavorite={vi.fn()}
        onExpandedChange={onExpandedChange}
      />,
    )

    const expand = getByRole('button', { name: /Recolher evoluções.*Patamon/ })
    expect(expand).toHaveAttribute('aria-expanded', 'true')
    expect(container.querySelector('.card-index')).not.toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Filtrar Patamon na barra de busca' }))
    fireEvent.click(expand)
    expect(onExpandedChange).toHaveBeenCalledWith('3', false)

    fireEvent.click(getByRole('article'))
    expect(getByRole('button', { name: /Recolher evoluções.*Patamon/ })).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('RelatedItem', () => {
  it('revela detalhes, evoluções relacionadas e chama o filtro selecionado', () => {
    const onSelectParent = vi.fn()
    render(
      <DigimonProvider digimons={catalog}>
        <RelatedItem item={{ name: 'Greymon' }} onSelectParent={onSelectParent} />
      </DigimonProvider>,
    )

    const expandButtons = screen.getAllByRole('button', { name: 'Expandir detalhes de Greymon' })
    expect(expandButtons).toHaveLength(2)
    fireEvent.click(expandButtons[0]!)
    expect(screen.getByText('A brave dinosaur Digimon.')).toBeInTheDocument()
    expect(screen.getByText('Mega Flame')).toBeInTheDocument()
    expect(screen.getByText('A stream of fire.')).toBeInTheDocument()
    expect(screen.getByText('Dragon')).toBeInTheDocument()
    expect(screen.getByText('{"source":"catalog"}')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Filtrar pelo card de Agumon' }))
    expect(onSelectParent).toHaveBeenCalledWith('Agumon')
    expect(screen.getAllByRole('button', { name: 'Recolher detalhes de Greymon', expanded: true })).toHaveLength(2)
  })

  it('aceita referência textual e campos simples de texto', () => {
    render(<RelatedItem item="Koromon" />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Expandir detalhes de Koromon' })[0]!)
    expect(screen.getByText('Koromon')).toBeInTheDocument()
  })

  it('renderiza descrições, fields e skills em formato escalar e nomes alternativos', () => {
    render(<RelatedItem item={{
      name: 'ToyAgumon',
      desc: 'A toy-like Digimon.',
      releaseDate: '2025',
      fields: 'Metal Empire',
      skills: [{ skillName: 'Toy Flame', description: 'A small fire.' }, 'Toy Hammer'],
      nextEvolutions: ['Guardromon'],
      priorEvolutions: [{ name: 'Agumon', localImageUrl: '/agumon.png' }],
      customLabel: 'special',
    }} />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Expandir detalhes de ToyAgumon' })[0]!)
    expect(screen.getByText('A toy-like Digimon.')).toBeInTheDocument()
    expect(screen.getByText('Metal Empire')).toBeInTheDocument()
    expect(screen.getByText('Toy Flame')).toBeInTheDocument()
    expect(screen.getByText('A small fire.')).toBeInTheDocument()
    expect(screen.getByText('Toy Hammer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filtrar pelo card de Guardromon' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filtrar pelo card de Agumon' })).toBeInTheDocument()
    expect(screen.getByText('special')).toBeInTheDocument()
  })
})