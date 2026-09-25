// @ts-nocheck
'use client';

import { useState } from 'react';

function imageSource(item) {
  return item.localImageUrl || item.imageUrl || '';
}

export function DigimonImage({ item, className }) {
  const [source, setSource] = useState(imageSource(item));

  return (
    <img
      className={className}
      src={source}
      alt={item.name || 'Digimon'}
      loading="lazy"
      onError={() => {
        if (source !== item.imageUrl && item.imageUrl) setSource(item.imageUrl);
      }}
    />
  );
}
