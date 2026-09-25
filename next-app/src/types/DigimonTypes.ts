export type DigimonId = string | number
export type DigimonText = string | null

export interface DigimonSkill {
  name?: DigimonText
  skillName?: DigimonText
  description?: DigimonText
  desc?: DigimonText
}

export interface DigimonFieldItem {
  name?: DigimonText
}

export interface DigimonEvolutionLink {
  id?: DigimonId | null
  name?: DigimonText
  url?: DigimonText
  imageUrl?: DigimonText
  localImageUrl?: DigimonText
  [key: string]: unknown
}

export type DigimonEvolutionReference = DigimonEvolutionLink | string

export interface Digivolutions {
  evolutions?: DigimonEvolutionReference[]
  deEvolutions?: DigimonEvolutionReference[]
}

export interface Digimon {
  id?: DigimonId | null
  name?: DigimonText
  imageUrl?: DigimonText
  url?: DigimonText
  number?: DigimonText
  attribute?: DigimonText
  generation?: DigimonText
  basePersonality?: DigimonText
  agentRankReq?: DigimonText
  type?: DigimonText
  level?: DigimonText
  description?: DigimonText
  desc?: DigimonText
  flavorText?: DigimonText
  releaseDate?: DigimonText
  release_date?: DigimonText
  Digivolutions?: Digivolutions | null
  evolutions?: DigimonEvolutionReference[]
  deEvolutions?: DigimonEvolutionReference[]
  nextEvolutions?: DigimonEvolutionReference[]
  priorEvolutions?: DigimonEvolutionReference[]
  localImageUrl?: DigimonText
  fields?: Array<string | DigimonFieldItem> | string | null
  skills?: Array<string | DigimonSkill> | string | null
  [key: string]: unknown
}

export type DigimonLookupInput = Partial<Digimon> | null | undefined
export type Evolution = DigimonEvolutionLink
export type DeEvolution = DigimonEvolutionLink