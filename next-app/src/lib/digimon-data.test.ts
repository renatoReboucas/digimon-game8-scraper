import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { loadDigimonData } from './digimon-data'

const temporaryDirectories: string[] = []

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

async function createDataFile(contents: string) {
  const directory = await mkdtemp(path.join(tmpdir(), 'digimon-data-'))
  temporaryDirectories.push(directory)
  const filePath = path.join(directory, 'catalog.json')
  await writeFile(filePath, contents, 'utf8')
  vi.stubEnv('DIGIMON_DATA_FILE', filePath)
  return filePath
}

describe('loadDigimonData', () => {
  it('carrega e valida a coleção definida por DIGIMON_DATA_FILE', async () => {
    await createDataFile(JSON.stringify({ collectionArraySchema: { collectionItems: [{ id: '1', name: 'Agumon' }] } }))

    await expect(loadDigimonData()).resolves.toEqual([{ id: '1', name: 'Agumon' }])
  })

  it('rejeita JSON inválido com contexto de carregamento', async () => {
    await createDataFile('{ inválido')

    await expect(loadDigimonData()).rejects.toThrow('Nao foi possivel carregar os dados de Digimon')
  })

  it('rejeita uma coleção ausente ou inválida', async () => {
    await createDataFile(JSON.stringify({ collectionArraySchema: { collectionItems: [{ name: 42 }] } }))

    await expect(loadDigimonData()).rejects.toThrow('cada item de collectionItems deve ser um Digimon valido')
  })

  it('preserva o erro útil quando o arquivo de dados não existe', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'digimon-data-'))
    temporaryDirectories.push(directory)
    vi.stubEnv('DIGIMON_DATA_FILE', path.join(directory, 'missing.json'))

    await expect(loadDigimonData()).rejects.toThrow('Nao foi possivel carregar os dados de Digimon')
  })
})