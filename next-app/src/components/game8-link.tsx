'use client'

import { SquareArrowOutUpRight } from 'lucide-react'
import type { Digimon } from '@/types/DigimonTypes'

interface Game8LinkProps {
  item: Pick<Digimon, 'url'>
}

export function Game8Link({ item }: Game8LinkProps) {
  return (
    <a
      className="game8-link"
      href={item.url ?? '#'}
      target="_blank"
      rel="noreferrer"
      title="Abrir no Game8"
      aria-label="Abrir página do Digimon no Game8"
    >
      <SquareArrowOutUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
    </a>
  )
}
