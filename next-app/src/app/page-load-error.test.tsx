// @vitest-environment jsdom
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import HomePage from './page'

afterEach(() => vi.unstubAllEnvs())

describe('HomePage data loading failure', () => {
  it('shows the loader error when the configured catalog file is missing', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'digimon-page-'))
    vi.stubEnv('DIGIMON_DATA_FILE', path.join(directory, 'missing.json'))

    try {
      const page = await HomePage()
      render(
        <TooltipProvider>
          <NuqsTestingAdapter>{page}</NuqsTestingAdapter>
        </TooltipProvider>,
      )

      expect(screen.getByText(/Nao foi possivel carregar os dados de Digimon/)).toBeInTheDocument()
      expect(screen.queryByText('Nenhum Digimon disponivel.')).not.toBeInTheDocument()
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})