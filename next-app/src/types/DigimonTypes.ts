export type DigimonId = string | number

export interface DigimonSkill {
  name?: string
  skillName?: string
  description?: string
  desc?: string
  [key: string]: unknown
}

export interface DigimonFieldItem {
  name?: string
  [key: string]: unknown
}

export interface DigimonEvolutionLink {
  name?: string
  url?: string
  imageUrl?: string
  localImageUrl?: string
  [key: string]: unknown
}

export interface Digivolutions {
  evolutions?: DigimonEvolutionLink[]
  deEvolutions?: DigimonEvolutionLink[]
}

export interface Digimon {
  id?: DigimonId
  name?: string
  imageUrl?: string
  url?: string
  number?: string
  attribute?: string
  generation?: string
  basePersonality?: string
  agentRankReq?: string
  type?: string
  level?: string
  description?: string
  desc?: string
  flavorText?: string
  releaseDate?: string
  release_date?: string
  Digivolutions?: Digivolutions
  evolutions?: DigimonEvolutionLink[]
  deEvolutions?: DigimonEvolutionLink[]
  nextEvolutions?: DigimonEvolutionLink[]
  priorEvolutions?: DigimonEvolutionLink[]
  localImageUrl?: string
  fields?: Array<string | DigimonFieldItem>
  skills?: Array<string | DigimonSkill>
  [key: string]: unknown
}

export type DigimonLookupInput = Partial<Digimon> | null | undefined
export type Evolution = DigimonEvolutionLink
export type DeEvolution = DigimonEvolutionLink