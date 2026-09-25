import type {
  Digimon,
  DigimonEvolutionLink,
  DigimonFieldItem,
  DigimonSkill,
  Digivolutions,
} from '@/types/DigimonTypes'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isOptionalText(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === 'string'
}

function hasOptionalTextFields(value: UnknownRecord, keys: readonly string[]): boolean {
  return keys.every((key) => isOptionalText(value[key]))
}

function isDigimonFieldItem(value: unknown): value is DigimonFieldItem {
  return isRecord(value) && isOptionalText(value.name)
}

function isDigimonSkill(value: unknown): value is DigimonSkill {
  return isRecord(value) && hasOptionalTextFields(value, ['name', 'skillName', 'description', 'desc'])
}

function isDigimonEvolutionLink(value: unknown): value is DigimonEvolutionLink {
  if (!isRecord(value)) return false

  const validId = value.id === undefined || value.id === null
    || typeof value.id === 'string' || typeof value.id === 'number'

  return validId && hasOptionalTextFields(value, ['name', 'url', 'imageUrl', 'localImageUrl'])
}

function isEvolutionReference(value: unknown): boolean {
  return typeof value === 'string' || isDigimonEvolutionLink(value)
}

function isEvolutionList(value: unknown): boolean {
  return Array.isArray(value) && value.every(isEvolutionReference)
}

function isDigivolutions(value: unknown): value is Digivolutions {
  if (!isRecord(value)) return false

  return (value.evolutions === undefined || isEvolutionList(value.evolutions))
    && (value.deEvolutions === undefined || isEvolutionList(value.deEvolutions))
}

function isDigimon(value: unknown): value is Digimon {
  if (!isRecord(value)) return false

  const validId = value.id === undefined || value.id === null
    || typeof value.id === 'string' || typeof value.id === 'number'
  const textKeys: readonly string[] = [
    'name', 'imageUrl', 'url', 'number', 'attribute', 'generation', 'basePersonality',
    'agentRankReq', 'type', 'level', 'description', 'desc', 'flavorText', 'releaseDate',
    'release_date', 'localImageUrl',
  ]
  const validFields = value.fields === undefined || value.fields === null || typeof value.fields === 'string'
    || (Array.isArray(value.fields) && value.fields.every((field) => typeof field === 'string' || isDigimonFieldItem(field)))
  const validSkills = value.skills === undefined || value.skills === null || typeof value.skills === 'string'
    || (Array.isArray(value.skills) && value.skills.every((skill) => typeof skill === 'string' || isDigimonSkill(skill)))
  const validEvolutionLists = ['evolutions', 'deEvolutions', 'nextEvolutions', 'priorEvolutions']
    .every((key) => value[key] === undefined || isEvolutionList(value[key]))

  return validId
    && hasOptionalTextFields(value, textKeys)
    && validFields
    && validSkills
    && validEvolutionLists
    && (value.Digivolutions === undefined || value.Digivolutions === null || isDigivolutions(value.Digivolutions))
}

export function parseDigimonData(source: unknown): Digimon[] {
  const collectionSchema = isRecord(source) ? source.collectionArraySchema : undefined
  const items = isRecord(collectionSchema) ? collectionSchema.collectionItems : undefined

  if (!Array.isArray(items)) {
    throw new Error('JSON invalido: collectionArraySchema.collectionItems deve ser uma lista.')
  }

  if (!items.every(isDigimon)) {
    throw new Error('JSON invalido: cada item de collectionItems deve ser um Digimon valido.')
  }

  return items
}