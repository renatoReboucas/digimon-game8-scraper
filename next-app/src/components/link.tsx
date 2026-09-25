'use client'

import { SquareArrowOutUpRight } from 'lucide-react'
import type { Digimon, DigimonEvolutionLink } from '@/types/DigimonTypes'

const WIKI_URL = 'https://www.grindosaur.com/en/games/digimon-story-time-stranger/digimon'

interface LinkProps {
  item: Pick<Digimon, 'name'> | DigimonEvolutionLink
}

export function Link({ item }: LinkProps) {
  const href = `${WIKI_URL}/${encodeURIComponent((item.name ?? '').toLowerCase())}`

  return (
    <a className="game8-link" href={href} target="_blank" rel="noreferrer" title="Abrir no grindosaur">
      <SquareArrowOutUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
    </a>
  )
}
