import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Digimon } from '@/types/DigimonTypes'

const defaultDataFile = path.join(process.cwd(), 'data', 'digimon-enriched.json')

export async function loadDigimonData(): Promise<Digimon[]> {
  const dataFile = process.env.DIGIMON_DATA_FILE || defaultDataFile
  let source: unknown

  try {
    source = JSON.parse(await readFile(dataFile, 'utf8'))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Nao foi possivel carregar os dados de Digimon: ${message}`)
  }

  const items = (source as { collectionArraySchema?: { collectionItems?: unknown } } | null)?.collectionArraySchema?.collectionItems
  if (!Array.isArray(items)) {
    throw new Error('JSON invalido: collectionArraySchema.collectionItems deve ser uma lista.')
  }

  return items as Digimon[]
}
