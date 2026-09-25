// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithTooltip as render } from '../test/test-utils'
import { EvolutionSection } from './evolution-section'
import { Game8Link } from './game8-link'
import { Link } from './link'
import { DigimonImage } from './digimon-image'
import { DigimonMetadataGrid } from './digimon-metadata-grid'
import { ScrollToTop } from './scroll-to-top'

describe('DigimonImage', () => {
  it('usa a imagem local e recorre à URL remota quando ela falha', () => {
    render(<DigimonImage item={{ name: 'Agumon', localImageUrl: '/images/agumon.png', imageUrl: 'https://img.test/agumon.png' }} />)

    const image = screen.getByRole('img', { name: 'Agumon' })
    expect(image).toHaveAttribute('src', '/images/agumon.png')
    expect(image).toHaveAttribute('loading', 'lazy')

    fireEvent.error(image)
    expect(image).toHaveAttribute('src', 'https://img.test/agumon.png')
  })

  it('usa a imagem remota quando não há imagem local', () => {
    render(<DigimonImage item={{ name: 'Gabumon', imageUrl: 'https://img.test/gabumon.png' }} />)

    expect(screen.getByRole('img', { name: 'Gabumon' })).toHaveAttribute('src', 'https://img.test/gabumon.png')
  })

  it('não define uma origem vazia quando não existem imagens', () => {
    render(<DigimonImage item={{ name: 'Patamon' }} />)

    expect(screen.getByRole('img', { name: 'Patamon' })).not.toHaveAttribute('src')
  })
})

describe('DigimonMetadataGrid', () => {
  it('não renderiza sem Digimon e exibe campos com aliases de geração e data', () => {
    const empty = render(<DigimonMetadataGrid digimon={null} />)
    expect(empty.container).toBeEmptyDOMElement()
    empty.unmount()

    render(<DigimonMetadataGrid digimon={{
      id: '42',
      number: '7',
      generation: 'Champion',
      attribute: 'Vaccine',
      basePersonality: 'Brave',
      release_date: '2026-01-01',
    }} />)

    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Nível')).toBeInTheDocument()
    expect(screen.getByText('Champion')).toBeInTheDocument()
    expect(screen.getByText('Data de Lançamento')).toBeInTheDocument()
    expect(screen.getByText('2026-01-01')).toBeInTheDocument()
  })

  it('renderiza um nível explícito no lugar da geração e omite metadados vazios', () => {
    const { container } = render(<DigimonMetadataGrid digimon={{ level: 'Mega', generation: 'Ultimate', skills: [] }} />)

    expect(screen.getByText('Mega')).toBeInTheDocument()
    expect(screen.queryByText('Ultimate')).not.toBeInTheDocument()
    expect(container.querySelector('.metadata-item')).toBeInTheDocument()
  })

  it('prioriza campos modernos sobre aliases legados', () => {
    render(<DigimonMetadataGrid digimon={{
      releaseDate: '2026',
      release_date: '2025',
      level: 'Mega',
      generation: 'Ultimate',
    }} />)

    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.queryByText('2025')).not.toBeInTheDocument()
  })
})

describe('EvolutionSection', () => {
  it('mostra o estado vazio ou a lista de referências', () => {
    const { rerender } = render(<EvolutionSection title="Evolutions" items={[]} />)
    expect(screen.getByRole('heading', { name: 'Evolutions' })).toBeInTheDocument()
    expect(screen.getByText('Nenhum registro')).toBeInTheDocument()

    rerender(<EvolutionSection title="De-evolutions" items={['Koromon', { name: 'Agumon', id: '1' }]} />)
    expect(screen.getByRole('heading', { name: 'De-evolutions' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Expandir detalhes de Koromon' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Expandir detalhes de Agumon' })).toHaveLength(2)
  })
})

describe('Links externos', () => {
  it('monta o link Grindosaur com nome codificado e abre em nova aba', () => {
    render(<Link item={{ name: 'Agumon (Black)' }} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAccessibleName('Abrir Agumon (Black) no Grindosaur')
    expect(link).toHaveAttribute('href', 'https://www.grindosaur.com/en/games/digimon-story-time-stranger/digimon/agumon%20(black)')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
  })

  it('fornece um destino e nome acessível quando o nome do Digimon está ausente', () => {
    render(<Link item={{}} />)

    expect(screen.getByRole('link', { name: 'Abrir Digimon no Grindosaur' })).toHaveAttribute(
      'href',
      'https://www.grindosaur.com/en/games/digimon-story-time-stranger/digimon/',
    )
  })

  it('mantém um fallback de URL para links sem endereço Game8', () => {
    const { rerender } = render(<Game8Link item={{ url: 'https://game8.co/digimon/agumon' }} />)
    expect(screen.getByRole('link', { name: 'Abrir página do Digimon no Game8' })).toHaveAttribute('href', 'https://game8.co/digimon/agumon')

    rerender(<Game8Link item={{}} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '#')
  })
})

describe('ScrollToTop', () => {
  it('permanece sem destaque no topo e aparece ao passar do limite', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    render(<ScrollToTop />)

    const button = screen.getByRole('button', { name: 'Rolar para o começo' })
    expect(button).not.toHaveClass('is-visible')

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 300 })
    fireEvent.scroll(window)
    expect(button).toHaveClass('is-visible')
  })

  it('exibe o botão após rolagem e retorna ao topo ao ativá-lo', () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 300 })

    render(<ScrollToTop />)
    fireEvent.scroll(window)

    const button = screen.getByRole('button', { name: 'Rolar para o começo' })
    expect(button).toHaveClass('is-visible')
    fireEvent.click(button)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})