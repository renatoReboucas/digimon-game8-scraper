'use client'

import { ChevronDown, Filter } from 'lucide-react'
import { useId, useState } from 'react'
import type { Digimon, DigimonEvolutionLink, DigimonEvolutionReference, DigimonLookupInput } from '@/types/DigimonTypes'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { DigimonImage } from './digimon-image'
import { DigimonMetadataGrid, hasValue } from './digimon-metadata-grid'
import { useDigimonLookup } from './digimon-context'
import { Link } from './link'
import { useAnimeDisclosure } from './anime-animations'

const KNOWN_KEYS = new Set<string>([
  'id',
  'number',
  'name',
  'level',
  'generation',
  'type',
  'attribute',
  'description',
  'desc',
  'flavorText',
  'imageUrl',
  'localImageUrl',
  'url',
  'skills',
  'fields',
  'releaseDate',
  'release_date',
  'basePersonality',
  'agentRankReq',
  'Digivolutions',
  'evolutions',
  'deEvolutions',
  'priorEvolutions',
  'nextEvolutions',
])

interface RelatedItemProps {
  item: DigimonEvolutionReference
  onSelectParent?: ((name: string) => void) | undefined
}

export function RelatedItem({ item, onSelectParent }: RelatedItemProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const { panelRef, isPanelVisible } = useAnimeDisclosure(isExpanded)
  const contentId = useId()
  const { lookupDigimon } = useDigimonLookup()

  const reference = typeof item === 'string' ? { name: item } : item
  const matched = lookupDigimon(reference satisfies DigimonLookupInput)
  const digimon: Digimon = matched ? { ...reference, ...matched } : reference

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev)
  }

  const priorEvolutions: DigimonEvolutionLink[] = Array.isArray(digimon.deEvolutions ?? digimon.priorEvolutions ?? digimon.Digivolutions?.deEvolutions)
    ? (digimon.deEvolutions ?? digimon.priorEvolutions ?? digimon.Digivolutions?.deEvolutions ?? [])
      .map((evolution) => typeof evolution === 'string' ? { name: evolution } : evolution)
    : []

  const nextEvolutions: DigimonEvolutionLink[] = Array.isArray(digimon.evolutions ?? digimon.nextEvolutions ?? digimon.Digivolutions?.evolutions)
    ? (digimon.evolutions ?? digimon.nextEvolutions ?? digimon.Digivolutions?.evolutions ?? [])
      .map((evolution) => typeof evolution === 'string' ? { name: evolution } : evolution)
    : []

  const level = digimon.level || digimon.generation || ''
  const description = digimon.description || digimon.desc || digimon.flavorText || ''
  const releaseDate = digimon.releaseDate || digimon.release_date || ''

  const extraEntries = Object.entries(digimon).filter(([key, val]) => {
    if (KNOWN_KEYS.has(key)) return false
    return hasValue(val)
  })

  return (
    <article className={`related-item${isExpanded ? ' is-expanded' : ''}`}>
      <div className="related-header">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="related-summary"
              type="button"
              aria-expanded={isExpanded}
              aria-controls={contentId}
              aria-label={`${isExpanded ? 'Recolher detalhes de' : 'Expandir detalhes de'} ${digimon.name}`}
              onClick={toggleExpanded}
            >
              <DigimonImage item={digimon} className="related-image" />
              <span className="related-content">
                <span className="related-name">{digimon.name}</span>
                <span className="related-quick-tags">
                  {hasValue(digimon.number) && <Badge variant="outline">No. {digimon.number}</Badge>}
                  {hasValue(level) && <Badge variant="secondary">{level}</Badge>}
                  {hasValue(digimon.attribute) && <Badge variant="secondary">{digimon.attribute}</Badge>}
                </span>
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent>{isExpanded ? 'Recolher' : 'Expandir'} detalhes de {digimon.name}</TooltipContent>
        </Tooltip>
        <div className="related-actions">
          {hasValue(digimon.url) && <Link item={digimon} />}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="parent-filter-button"
                variant="ghost"
                size="icon"
                type="button"
                aria-label={`Filtrar pelo card de ${digimon.name}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onSelectParent?.(digimon.name ?? '')
                }}
              >
                <Filter aria-hidden="true" size={14} strokeWidth={1.8} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Filtrar pelo card de {digimon.name}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={`related-expand-toggle${isExpanded ? ' is-expanded' : ''}`}
                variant="ghost"
                size="icon"
                type="button"
                aria-label={isExpanded ? `Recolher detalhes de ${digimon.name}` : `Expandir detalhes de ${digimon.name}`}
                aria-expanded={isExpanded}
                onClick={(event) => {
                  event.stopPropagation()
                  toggleExpanded()
                }}
              >
                <ChevronDown
                  aria-hidden="true"
                  size={16}
                  strokeWidth={2}
                  className={`expand-chevron${isExpanded ? ' is-rotated' : ''}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isExpanded ? 'Recolher' : 'Expandir'} detalhes de {digimon.name}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div
        id={contentId}
        ref={panelRef}
        className={`related-expand-wrapper${isExpanded ? ' is-expanded' : ''}`}
        aria-hidden={!isExpanded}
        hidden={!isPanelVisible}
        inert={!isExpanded}
      >
        <div className="related-expand-inner">
          <div className="related-expanded-details">
            {hasValue(description) && (
              <div className="related-detail-desc">
                <p>{description}</p>
              </div>
            )}

            <DigimonMetadataGrid digimon={digimon} />

            {hasValue(digimon.fields) && (
              <div className="related-detail-section">
                <span className="related-section-title">Fields</span>
                <div className="related-badges-list">
                  {Array.isArray(digimon.fields) ? (
                    digimon.fields.map((f, idx) => (
                      <Badge key={idx} variant="secondary" className="related-field-badge">
                        {typeof f === 'string' ? f : f?.name || JSON.stringify(f)}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="related-field-badge">{String(digimon.fields)}</Badge>
                  )}
                </div>
              </div>
            )}

            {hasValue(digimon.skills) && (
              <div className="related-detail-section">
                <span className="related-section-title">Skills</span>
                <div className="related-badges-list">
                  {Array.isArray(digimon.skills) ? (
                    digimon.skills.map((skill, idx) => {
                      const isObj = typeof skill === 'object' && skill !== null
                      const skillName = isObj ? skill.name || skill.skillName || 'Skill' : String(skill)
                      const skillDesc = isObj ? skill.description || skill.desc : null
                      return (
                        <div key={idx} className="related-skill-item">
                          <span className="skill-name">{skillName}</span>
                          {hasValue(skillDesc) && <span className="skill-description">{skillDesc}</span>}
                        </div>
                      )
                    })
                  ) : (
                    <span className="related-skill-item">
                      <span className="skill-name">{String(digimon.skills)}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {hasValue(priorEvolutions) && (
              <div className="related-detail-section">
                <span className="related-section-title">De-evolutions</span>
                <div className="related-badges-list">
                  {priorEvolutions.map((evo, idx) => {
                    const evoObj = typeof evo === 'string' ? { name: evo } : evo
                    const evoName = evoObj.name
                    if (!evoName) return null
                    const matchedEvo = lookupDigimon(evoObj)
                    const fullEvo: Digimon = matchedEvo ? { ...evoObj, ...matchedEvo } : evoObj
                    const hasImg = Boolean(fullEvo.localImageUrl || fullEvo.imageUrl)

                    return (
                      <Tooltip key={`${evoName}-${idx}`}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            className="related-sub-badge"
                            aria-label={`Filtrar pelo card de ${evoName}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectParent?.(evoName)
                            }}
                          >
                            {hasImg && <DigimonImage item={fullEvo} className="sub-badge-image" />}
                            <span>{evoName}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Filtrar pelo card de {evoName}</TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            )}

            {hasValue(nextEvolutions) && (
              <div className="related-detail-section">
                <span className="related-section-title">Evolutions</span>
                <div className="related-badges-list">
                  {nextEvolutions.map((evo, idx) => {
                    const evoObj = typeof evo === 'string' ? { name: evo } : evo
                    const evoName = evoObj.name
                    if (!evoName) return null
                    const matchedEvo = lookupDigimon(evoObj)
                    const fullEvo: Digimon = matchedEvo ? { ...evoObj, ...matchedEvo } : evoObj
                    const hasImg = Boolean(fullEvo.localImageUrl || fullEvo.imageUrl)

                    return (
                      <Tooltip key={`${evoName}-${idx}`}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            className="related-sub-badge"
                            aria-label={`Filtrar pelo card de ${evoName}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectParent?.(evoName)
                            }}
                          >
                            {hasImg && <DigimonImage item={fullEvo} className="sub-badge-image" />}
                            <span>{evoName}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Filtrar pelo card de {evoName}</TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            )}

            {extraEntries.length > 0 && (
              <div className="related-metadata-grid extra-grid">
                {extraEntries.map(([key, val]) => (
                  <div key={key} className="metadata-item">
                    <span className="metadata-label">{key}</span>
                    <span className="metadata-value">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
