import { describe, expect, it, vi } from 'vitest'
import { loadDigimonData } from '@/lib/digimon-data'
import { GET } from './route'

vi.mock('@/lib/digimon-data', () => ({ loadDigimonData: vi.fn() }))

const loadData = vi.mocked(loadDigimonData)

describe('GET /api/digimons', () => {
  it('retorna os registros do catálogo como JSON', async () => {
    const catalog = [{ id: '1', name: 'Agumon' }]
    loadData.mockResolvedValue(catalog)

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(catalog)
  })

  it('responde com status 500 e mensagem em falha de carregamento', async () => {
    loadData.mockRejectedValue(new Error('Arquivo indisponível'))

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'Arquivo indisponível' })
  })

  it('usa mensagem padrão para rejeições que não são Error', async () => {
    loadData.mockRejectedValue('falha')

    const response = await GET()

    await expect(response.json()).resolves.toEqual({ error: 'Erro ao carregar os Digimon.' })
  })
})