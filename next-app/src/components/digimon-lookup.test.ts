import { describe, it, expect } from 'vitest';

function createLookup(digimons) {
  const byName = new Map();
  const byUrl = new Map();
  const byId = new Map();

  for (const d of digimons) {
    if (!d) continue;
    if (d.name) byName.set(d.name.trim().toLowerCase(), d);
    if (d.url) byUrl.set(d.url.trim(), d);
    if (d.id != null) byId.set(String(d.id).trim(), d);
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
}

function hasValue(val) {
  if (val === undefined || val === null) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'object') return Object.keys(val).length > 0;
  return true;
}

describe('Digimon Lookup from main JSON', () => {
  const mainDataset = [
    {
      id: '1313037',
      name: 'Kuramon',
      number: '1',
      attribute: 'No Data',
      generation: 'In-Training I',
      basePersonality: 'Sly',
      agentRankReq: 'None',
      url: 'https://game8.co/games/Digimon-Story-Time-Stranger/archives/555193',
      Digivolutions: {
        evolutions: [
          { name: 'Pagumon', url: 'https://game8.co/games/Digimon-Story-Time-Stranger/archives/555166' },
          { name: 'Tsumemon', url: 'https://game8.co/games/Digimon-Story-Time-Stranger/archives/555170' }
        ],
        deEvolutions: []
      }
    },
    {
      id: '1313038',
      name: 'Pagumon',
      number: '2',
      attribute: 'Virus',
      generation: 'In-Training II',
      basePersonality: 'Calm',
      agentRankReq: 'Bronze',
      url: 'https://game8.co/games/Digimon-Story-Time-Stranger/archives/555166',
      skills: ['Poison Bubbles'],
      Digivolutions: {
        evolutions: [{ name: 'Gazimon' }],
        deEvolutions: [{ name: 'Kuramon' }]
      }
    }
  ];

  const lookup = createLookup(mainDataset);

  it('obtains full Digimon data matching by name (case-insensitive)', () => {
    const relatedItem = { name: 'pagumon' };
    const full = lookup(relatedItem);
    expect(full).toBeDefined();
    expect(full?.id).toBe('1313038');
    expect(full?.attribute).toBe('Virus');
    expect(full?.generation).toBe('In-Training II');
    expect(full?.basePersonality).toBe('Calm');
  });

  it('obtains full Digimon data matching by URL when name differs or is partial', () => {
    const relatedItem = { url: 'https://game8.co/games/Digimon-Story-Time-Stranger/archives/555193' };
    const full = lookup(relatedItem);
    expect(full).toBeDefined();
    expect(full?.name).toBe('Kuramon');
    expect(full?.id).toBe('1313037');
  });

  it('obtains full Digimon data matching by ID', () => {
    const relatedItem = { id: 1313038 };
    const full = lookup(relatedItem);
    expect(full).toBeDefined();
    expect(full?.name).toBe('Pagumon');
  });

  it('falls back to null for uncatalogued items without throwing errors', () => {
    const eggItem = { name: 'Digi-Egg of Courage' };
    const full = lookup(eggItem);
    expect(full).toBeNull();
  });
});

describe('Field validation (no empty/null/undefined rendering)', () => {
  it('correctly filters out null, undefined, empty strings, and empty arrays', () => {
    expect(hasValue(null)).toBe(false);
    expect(hasValue(undefined)).toBe(false);
    expect(hasValue('')).toBe(false);
    expect(hasValue('   ')).toBe(false);
    expect(hasValue([])).toBe(false);
    expect(hasValue({})).toBe(false);
  });

  it('correctly validates presence of non-empty values', () => {
    expect(hasValue('Virus')).toBe(true);
    expect(hasValue('Mega')).toBe(true);
    expect(hasValue(0)).toBe(true);
    expect(hasValue(['Pepper Breath'])).toBe(true);
    expect(hasValue({ name: 'Skill 1' })).toBe(true);
  });
});
