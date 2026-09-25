'use client'

import { useState } from 'react'
import type { Digimon } from '@/types/DigimonTypes'

function imageSource(item: Pick<Digimon, 'localImageUrl' | 'imageUrl'>): string {
  return item.localImageUrl || item.imageUrl || ''
}

interface DigimonImageProps {
  item: Pick<Digimon, 'name' | 'localImageUrl' | 'imageUrl'>
  className?: string
}

export function DigimonImage({ item, className }: DigimonImageProps) {
  const [source, setSource] = useState<string>(imageSource(item))

  return (
    <img
      className={className}
      src={source || undefined}
      alt={item.name || 'Digimon'}
      loading="lazy"
      onError={() => {
        if (source !== item.imageUrl && item.imageUrl) setSource(item.imageUrl)
      }}
    />
  )
}
