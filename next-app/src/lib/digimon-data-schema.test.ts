import { describe, expect, it } from 'vitest'
import digimonDataset from '../../data/digimon-enriched.json'
import { parseDigimonData } from './digimon-data-schema'

describe('parseDigimonData', () => {
  it('keeps Digimon records and additional fields intact', () => {
    const source = {
      collectionArraySchema: {
        collectionItems: [
          {
            id: '1',
            name: 'Agumon',
            customMetadata: { source: 'fixture' },
            Digivolutions: { evolutions: [{ name: 'Greymon' }], deEvolutions: [] },
          },
        ],
      },
    }

    expect(parseDigimonData(source)).toEqual(source.collectionArraySchema.collectionItems)
  })

  it('accepts nullable text and string evolution references', () => {
    expect(parseDigimonData({
      collectionArraySchema: {
        collectionItems: [{ name: null, evolutions: ['Agumon'], fields: null, skills: null }],
      },
    })).toEqual([{ name: null, evolutions: ['Agumon'], fields: null, skills: null }])
  })

  it('accepts every record in the distributed catalog', () => {
    expect(parseDigimonData(digimonDataset)).toHaveLength(475)
  })

  it('rejects a payload without a collection list', () => {
    expect(() => parseDigimonData({})).toThrow('collectionArraySchema.collectionItems deve ser uma lista')
  })

  it('rejects malformed Digimon fields instead of asserting the payload type', () => {
    expect(() => parseDigimonData({
      collectionArraySchema: { collectionItems: [{ name: 42 }] },
    })).toThrow('cada item de collectionItems deve ser um Digimon valido')
  })
})