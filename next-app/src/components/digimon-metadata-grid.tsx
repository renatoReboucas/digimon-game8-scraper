'use client'

import type { Digimon } from '@/types/DigimonTypes'

export function hasValue<T>(val: T | null | undefined): boolean {
  if (val === undefined || val === null) return false
  if (typeof val === 'string') return val.trim().length > 0
  if (Array.isArray(val)) return val.length > 0
  if (typeof val === 'object') return Object.keys(val).length > 0
  return true
}

interface DigimonMetadataGridProps {
  digimon?: Digimon | null
  className?: string
}

export function DigimonMetadataGrid({ digimon, className = 'related-metadata-grid' }: DigimonMetadataGridProps) {
  if (!digimon) return null

  const level = digimon.level || digimon.generation
  const releaseDate = digimon.releaseDate || digimon.release_date

  return (
    <div className={className}>
      {hasValue(digimon.id) && (
        <div className="metadata-item">
          <span className="metadata-label">ID</span>
          <span className="metadata-value">{digimon.id}</span>
        </div>
      )}
      {hasValue(digimon.number) && (
        <div className="metadata-item">
          <span className="metadata-label">Número</span>
          <span className="metadata-value">No. {digimon.number}</span>
        </div>
      )}
      {hasValue(level) && (
        <div className="metadata-item">
          <span className="metadata-label">Nível</span>
          <span className="metadata-value">{level}</span>
        </div>
      )}
      {hasValue(digimon.type) && (
        <div className="metadata-item">
          <span className="metadata-label">Tipo</span>
          <span className="metadata-value">{digimon.type}</span>
        </div>
      )}
      {hasValue(digimon.attribute) && (
        <div className="metadata-item">
          <span className="metadata-label">Atributo</span>
          <span className="metadata-value">{digimon.attribute}</span>
        </div>
      )}
      {hasValue(digimon.basePersonality) && (
        <div className="metadata-item">
          <span className="metadata-label">Personalidade</span>
          <span className="metadata-value">{digimon.basePersonality}</span>
        </div>
      )}
      {hasValue(digimon.agentRankReq) && (
        <div className="metadata-item">
          <span className="metadata-label">Agent Rank Req</span>
          <span className="metadata-value">{digimon.agentRankReq}</span>
        </div>
      )}
      {hasValue(releaseDate) && (
        <div className="metadata-item">
          <span className="metadata-label">Data de Lançamento</span>
          <span className="metadata-value">{releaseDate}</span>
        </div>
      )}
    </div>
  )
}
