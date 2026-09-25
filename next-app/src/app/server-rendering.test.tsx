// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { loadDigimonData } from '@/lib/digimon-data'
import HomePage from './page'
import RootLayout, { metadata } from './layout'
import Loading from './loading'

vi.mock('@/lib/digimon-data', () => ({ loadDigimonData: vi.fn() }))
vi.mock('nuqs/adapters/next/app', () => ({
  NuqsAdapter: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

const loadData = vi.mocked(loadDigimonData)

function renderPage(element: ReactNode) {
  return render(
    <TooltipProvider>
      <NuqsTestingAdapter>{element}</NuqsTestingAdapter>
    </TooltipProvider>,
  )
}

beforeEach(() => loadData.mockReset())

describe('HomePage', () => {
  it('carrega dados no servidor e compõe o catálogo client-side', async () => {
    loadData.mockResolvedValue([{ id: '1', name: 'Agumon' }])

    renderPage(await HomePage())

    expect(loadData).toHaveBeenCalledOnce()
    expect(screen.getByRole('heading', { level: 1, name: 'Digimon Atlas' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Agumon' })).toBeInTheDocument()
  })

  it('renderiza o estado vazio quando o catálogo não contém registros', async () => {
    loadData.mockResolvedValue([])

    renderPage(await HomePage())

    expect(screen.getByText('Nenhum Digimon disponivel.')).toBeInTheDocument()
  })

})

describe('RootLayout', () => {
  it('define idioma, metadata e compõe o conteúdo com os providers', () => {
    render(<RootLayout><p>Conteúdo da página</p></RootLayout>, {
      container: document as unknown as HTMLElement,
    })

    expect(document.documentElement).toHaveAttribute('lang', 'pt-BR')
    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument()
    expect(metadata.title).toBe('Digimon Atlas')
    expect(metadata.description).toContain('Digimon')
  })
})

describe('Loading', () => {
  it('anuncia o carregamento e marca o shell como ocupado', () => {
    render(<Loading />)

    expect(screen.getByRole('status')).toHaveTextContent('Carregando o catálogo de Digimon.')
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true')
  })
})