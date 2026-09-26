'use client'

import Image from 'next/image'
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
  const sizes = className === 'main-image'
    ? '(max-width: 560px) 60px, 80px'
    : className === 'related-image'
      ? '44px'
      : className === 'sub-badge-image'
        ? '20px'
        : '80px'

  if (!source) {
    return <span className={className} role="img" aria-label={item.name || 'Digimon'} />
  }

  return (
    <Image
      className={className}
      src={source}
      alt={item.name || 'Digimon'}
      width={160}
      height={160}
      sizes={sizes}
      loading="lazy"
      onError={() => {
        if (source !== item.imageUrl && item.imageUrl) setSource(item.imageUrl)
      }}
    />
  )
}
