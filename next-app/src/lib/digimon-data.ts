import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Digimon } from '@/types/DigimonTypes'
import { parseDigimonData } from '@/lib/digimon-data-schema'

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

  return parseDigimonData(source)
}
