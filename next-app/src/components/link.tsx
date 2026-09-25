'use client';

import { SquareArrowOutUpRight } from 'lucide-react';
import type {Evolution} from '@/types/DigimonTypes'

const WIKI_URL = 'https://www.grindosaur.com/en/games/digimon-story-time-stranger/digimon'
export function Link({ item }:{item: Evolution}) {
  return (
    <a className="game8-link" href={`${WIKI_URL}/${item.name}`} target="_blank" rel="noreferrer" title="Abrir no grindosaur">
      <SquareArrowOutUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
    </a>
  );
}
