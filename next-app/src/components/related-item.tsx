// @ts-nocheck
'use client';

import { ChevronDown, Filter } from 'lucide-react';
import { useId, useState } from 'react';
import { DigimonImage } from './digimon-image';
import { useDigimonLookup } from './digimon-context';
import { Game8Link } from './game8-link';

function hasValue(val) {
  if (val === undefined || val === null) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'object') return Object.keys(val).length > 0;
  return true;
}

const KNOWN_KEYS = new Set([
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
]);

export function RelatedItem({ item, onSelectParent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();
  const { lookupDigimon } = useDigimonLookup();

  const matched = lookupDigimon?.(item);
  const digimon = matched ? { ...item, ...matched } : item;

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleHeaderClick = (event) => {
    if (event.target.closest('button, a')) return;
    toggleExpanded();
  };

  const handleKeyDown = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
      event.preventDefault();
      toggleExpanded();
    }
  };

  // Extrair evoluções anteriores e posteriores do Digimon completo
  const priorEvolutions =
    digimon.deEvolutions ||
    digimon.priorEvolutions ||
    digimon.Digivolutions?.deEvolutions ||
    [];

  const nextEvolutions =
    digimon.evolutions ||
    digimon.nextEvolutions ||
    digimon.Digivolutions?.evolutions ||
    [];

  const level = digimon.level || digimon.generation;
  const description = digimon.description || digimon.desc || digimon.flavorText;
  const releaseDate = digimon.releaseDate || digimon.release_date;

  // Filtrar outros dados complementares presentes no JSON que não estejam em KNOWN_KEYS
  const extraEntries = Object.entries(digimon).filter(([key, val]) => {
    if (KNOWN_KEYS.has(key)) return false;
    return hasValue(val);
  });

  return (
    <article className={`related-item${isExpanded ? ' is-expanded' : ''}`}>
      <div
        className="related-header"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        aria-label={`${isExpanded ? 'Recolher detalhes de' : 'Expandir detalhes de'} ${digimon.name}`}
        onClick={handleHeaderClick}
        onKeyDown={handleKeyDown}
      >
        <DigimonImage item={digimon} className="related-image" />
        <div className="related-content">
          <h4>{digimon.name}</h4>
          <div className="related-quick-tags">
            {hasValue(digimon.number) && <span className="quick-tag">No. {digimon.number}</span>}
            {hasValue(level) && <span className="quick-tag">{level}</span>}
            {hasValue(digimon.attribute) && <span className="quick-tag">{digimon.attribute}</span>}
          </div>
        </div>
        <div className="related-actions">
          {hasValue(digimon.url) && <Game8Link item={digimon} />}
          <button
            className="parent-filter-button"
            type="button"
            title={`Filtrar pelo card de ${digimon.name}`}
            aria-label={`Filtrar pelo card de ${digimon.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onSelectParent?.(digimon.name);
            }}
          >
            <Filter aria-hidden="true" size={14} strokeWidth={1.8} />
            Filtrar
          </button>
          <button
            className={`related-expand-toggle${isExpanded ? ' is-expanded' : ''}`}
            type="button"
            title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
            aria-label={isExpanded ? `Recolher detalhes de ${digimon.name}` : `Expandir detalhes de ${digimon.name}`}
            aria-expanded={isExpanded}
            onClick={(event) => {
              event.stopPropagation();
              toggleExpanded();
            }}
          >
            <ChevronDown
              aria-hidden="true"
              size={16}
              strokeWidth={2}
              className={`expand-chevron${isExpanded ? ' is-rotated' : ''}`}
            />
          </button>
        </div>
      </div>

      <div
        id={contentId}
        className={`related-expand-wrapper${isExpanded ? ' is-expanded' : ''}`}
        aria-hidden={!isExpanded}
      >
        <div className="related-expand-inner">
          <div className="related-expanded-details">
            {/* Descrição */}
            {hasValue(description) && (
              <div className="related-detail-desc">
                <p>{description}</p>
              </div>
            )}

            {/* Metadados e Atributos */}
            <div className="related-metadata-grid">
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

            {/* Fields */}
            {hasValue(digimon.fields) && (
              <div className="related-detail-section">
                <span className="related-section-title">Fields</span>
                <div className="related-badges-list">
                  {Array.isArray(digimon.fields) ? (
                    digimon.fields.map((f, idx) => (
                      <span key={idx} className="related-field-badge">
                        {typeof f === 'string' ? f : f?.name || JSON.stringify(f)}
                      </span>
                    ))
                  ) : (
                    <span className="related-field-badge">{String(digimon.fields)}</span>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {hasValue(digimon.skills) && (
              <div className="related-detail-section">
                <span className="related-section-title">Skills</span>
                <div className="related-badges-list">
                  {Array.isArray(digimon.skills) ? (
                    digimon.skills.map((skill, idx) => {
                      const isObj = typeof skill === 'object' && skill !== null;
                      const skillName = isObj ? skill.name || skill.skillName || 'Skill' : String(skill);
                      const skillDesc = isObj ? skill.description || skill.desc : null;
                      return (
                        <div key={idx} className="related-skill-item">
                          <span className="skill-name">{skillName}</span>
                          {hasValue(skillDesc) && <span className="skill-description">{skillDesc}</span>}
                        </div>
                      );
                    })
                  ) : (
                    <span className="related-skill-item">
                      <span className="skill-name">{String(digimon.skills)}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* De-evolutions */}
            {hasValue(priorEvolutions) && (
              <div className="related-detail-section">
                <span className="related-section-title">De-evolutions</span>
                <div className="related-badges-list">
                  {priorEvolutions.map((evo, idx) => {
                    const evoObj = typeof evo === 'object' && evo !== null ? evo : { name: evo };
                    const evoName = evoObj.name;
                    if (!evoName) return null;
                    const matchedEvo = lookupDigimon?.(evoObj);
                    const fullEvo = matchedEvo ? { ...evoObj, ...matchedEvo } : evoObj;
                    const hasImg = Boolean(fullEvo.localImageUrl || fullEvo.imageUrl);

                    return (
                      <button
                        key={`${evoName}-${idx}`}
                        type="button"
                        className="related-sub-badge"
                        title={`Filtrar pelo card de ${evoName}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectParent?.(evoName);
                        }}
                      >
                        {hasImg && <DigimonImage item={fullEvo} className="sub-badge-image" />}
                        <span>{evoName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Evolutions */}
            {hasValue(nextEvolutions) && (
              <div className="related-detail-section">
                <span className="related-section-title">Evolutions</span>
                <div className="related-badges-list">
                  {nextEvolutions.map((evo, idx) => {
                    const evoObj = typeof evo === 'object' && evo !== null ? evo : { name: evo };
                    const evoName = evoObj.name;
                    if (!evoName) return null;
                    const matchedEvo = lookupDigimon?.(evoObj);
                    const fullEvo = matchedEvo ? { ...evoObj, ...matchedEvo } : evoObj;
                    const hasImg = Boolean(fullEvo.localImageUrl || fullEvo.imageUrl);

                    return (
                      <button
                        key={`${evoName}-${idx}`}
                        type="button"
                        className="related-sub-badge"
                        title={`Filtrar pelo card de ${evoName}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectParent?.(evoName);
                        }}
                      >
                        {hasImg && <DigimonImage item={fullEvo} className="sub-badge-image" />}
                        <span>{evoName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Outros dados complementares do JSON */}
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
  );
}
