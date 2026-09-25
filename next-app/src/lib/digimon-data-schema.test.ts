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

  it('accepts nullable IDs and structured optional fields and evolution variants', () => {
    const item = {
      id: null,
      name: null,
      fields: [{ name: null }],
      skills: [{ name: null, skillName: null, description: null, desc: null }],
      Digivolutions: { evolutions: ['Agumon', { id: 0, name: null }], deEvolutions: [] },
      nextEvolutions: [{ id: 1, url: null }],
    }

    expect(parseDigimonData({ collectionArraySchema: { collectionItems: [item] } })).toEqual([item])
  })

  it('rejects malformed IDs, fields, skills and evolution references', () => {
    const invalidItems = [
      { id: true },
      { fields: [{ name: 42 }] },
      { skills: [{ description: 42 }] },
      { Digivolutions: { evolutions: [42] } },
      { evolutions: [{ id: {} }] },
    ]

    for (const item of invalidItems) {
      expect(() => parseDigimonData({ collectionArraySchema: { collectionItems: [item] } }))
        .toThrow('cada item de collectionItems deve ser um Digimon valido')
    }
  })
})