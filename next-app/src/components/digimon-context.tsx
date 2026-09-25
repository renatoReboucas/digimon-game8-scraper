// @ts-nocheck
'use client';

import { createContext, useContext, useMemo } from 'react';

export const DigimonContext = createContext({
  lookupDigimon: () => null,
  allDigimons: [],
});

export function DigimonProvider({ digimons = [], children }) {
  const lookup = useMemo(() => {
    const byName = new Map();
    const byUrl = new Map();
    const byId = new Map();

    for (const d of digimons) {
      if (!d) continue;
      if (d.name) {
        byName.set(d.name.trim().toLowerCase(), d);
      }
      if (d.url) {
        byUrl.set(d.url.trim(), d);
      }
      if (d.id != null) {
        byId.set(String(d.id).trim(), d);
      }
    }

    return (item) => {
      if (!item) return null;
      if (item.name) {
        const found = byName.get(item.name.trim().toLowerCase());
        if (found) return found;
      }
      if (item.url) {
        const found = byUrl.get(item.url.trim());
        if (found) return found;
      }
      if (item.id != null) {
        const found = byId.get(String(item.id).trim());
        if (found) return found;
      }
      return null;
    };
  }, [digimons]);

  const value = useMemo(
    () => ({
      lookupDigimon: lookup,
      allDigimons: digimons,
    }),
    [lookup, digimons]
  );

  return <DigimonContext.Provider value={value}>{children}</DigimonContext.Provider>;
}

export function useDigimonLookup() {
  return useContext(DigimonContext);
}
