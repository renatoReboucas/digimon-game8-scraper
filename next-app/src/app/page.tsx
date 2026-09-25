import DigimonAtlas from '@/components/digimon-atlas'
import { loadDigimonData } from '@/lib/digimon-data'
import type { Digimon } from '@/types/DigimonTypes'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  try {
    const digimons: Digimon[] = await loadDigimonData()
    return <DigimonAtlas digimons={digimons} />
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar os Digimon.'
    return <DigimonAtlas digimons={[]} loadError={message} />
  }
}
