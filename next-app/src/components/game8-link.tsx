// @ts-nocheck
'use client';

import { SquareArrowOutUpRight } from 'lucide-react';
export function Game8Link({ item }) {
  return (
    <a className="game8-link" href={item.url} target="_blank" rel="noreferrer" title="Abrir no Game8">
      <SquareArrowOutUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
      Game8
    </a>
  );
}
