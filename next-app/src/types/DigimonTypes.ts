export interface Digimon {
  id: string
  name: string
  imageUrl: string
  url: string
  number: string
  attribute: string
  generation: string
  basePersonality: string
  agentRankReq: string
  Digivolutions: Digivolutions
  localImageUrl: string
}

export interface Digivolutions {
  evolutions: Evolution[]
  deEvolutions: DeEvolution[]
}

export interface Evolution {
  name: string
  url: string
  imageUrl: string
  localImageUrl: string
}

export interface DeEvolution {
  name: string
  url: string
  imageUrl: string
  localImageUrl: string
}