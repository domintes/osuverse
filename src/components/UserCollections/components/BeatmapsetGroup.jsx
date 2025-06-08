import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAtom } from 'jotai';
import { persistedExpandedBeatmapsetsAtom, initExpandedBeatmapsets } from '../../../store/expandedBeatmapsetsAtom';

/**
 * Komponent grupujący beatmapy według beatmapsetów, z możliwością rozwijania
 */
const BeatmapsetGroup = ({ 
  beatmapset, 
  children,
  defaultExpanded = false,
  showCount = true,
  className = ''
}) => {
  // Pobierz stan rozwinięcia z globalnego stanu
  const [expandedBeatmapsets, setExpandedBeatmapsets] = useAtom(persistedExpandedBeatmapsetsAtom);
  
  // Inicjalizacja stanu przy pierwszym renderowaniu
  useEffect(() => {
    const savedState = initExpandedBeatmapsets();
    if (Object.keys(expandedBeatmapsets).length === 0 && Object.keys(savedState).length > 0) {
      setExpandedBeatmapsets(savedState);
    }
  }, []);
  
  // Sprawdzanie czy beatmapset jest rozwinięty (domyślnie: true dla zestawów z 1 trudnością, false dla pozostałych)
  const isBeatmapsetExpanded = () => {
    if (beatmapset.id in expandedBeatmapsets) {
      return expandedBeatmapsets[beatmapset.id];
    }
    // Domyślna wartość zależy od liczby trudności
    return React.Children.count(children) === 1 ? true : defaultExpanded;
  };
  
  const [isExpanded, setIsExpanded] = useState(isBeatmapsetExpanded());
  const difficultiesCount = React.Children.count(children);
  
  // Aktualizacja stanu lokalnego po zmianie w globalnym stanie
  useEffect(() => {
    setIsExpanded(isBeatmapsetExpanded());
  }, [expandedBeatmapsets, beatmapset.id]);
  
  // Funkcja do zmiany stanu rozwinięcia
  const toggleExpand = () => {
    // Nie pozwalaj zwijać beatmapsetów z jedną trudnością
    if (difficultiesCount === 1) return;
    
    const newIsExpanded = !isExpanded;
    setIsExpanded(newIsExpanded);
    
    // Aktualizacja globalnego stanu
    setExpandedBeatmapsets({
      ...expandedBeatmapsets,
      [beatmapset.id]: newIsExpanded
    });
  };  // Stan lokalny dla "Pokaż wszystkie trudności"
  const [showAllDifficulties, setShowAllDifficulties] = useState(false);
  
  // Określ, które dzieci powinny być wyświetlone (wszystkie lub ograniczone do 3)
  const visibleChildren = React.Children.toArray(children);
  const maxVisibleDifficulties = 3;
  const shouldLimitDifficulties = difficultiesCount > maxVisibleDifficulties && !showAllDifficulties;
  const visibleChildrenLimited = shouldLimitDifficulties 
    ? visibleChildren.slice(0, maxVisibleDifficulties)
    : visibleChildren;

  return (
    <div className={`beatmapset-group ${className} ${difficultiesCount === 1 ? 'single-difficulty' : ''}`}>
      {/* Nagłówek beatmapsetu */}
      <div 
        className={`beatmapset-header ${isExpanded ? 'expanded' : 'collapsed'}`}
        onClick={difficultiesCount > 1 ? toggleExpand : undefined}
      >
        {/* Ikona coveru beatmapsetu */}
        {beatmapset.cover && (
          <div className="beatmapset-cover">
            <img 
              src={beatmapset.cover} 
              alt={`${beatmapset.artist} - ${beatmapset.title}`} 
              className="beatmapset-cover-img"
            />
          </div>
        )}
        
        {/* Informacje o beatmapsecie */}
        <div className="beatmapset-info">
          <div className="beatmapset-title">
            {beatmapset.artist} - {beatmapset.title}
          </div>
          <div className="beatmapset-creator">
            mapped by {beatmapset.creator}
            {showCount && difficultiesCount > 1 && (
              <span className="beatmapset-difficulty-count">
                {difficultiesCount} {difficultiesCount === 1 ? 'difficulty' : 'difficulties'}
              </span>
            )}
          </div>
        </div>
        
        {/* Ikona rozwijania/zwijania (tylko dla beatmapsetów z wieloma trudnościami) */}
        {difficultiesCount > 1 && (
          <div className="beatmapset-toggle">
            <svg 
              className={`beatmapset-toggle-icon ${isExpanded ? 'expanded' : ''}`} 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Zawartość (zawsze widoczna dla pojedynczej trudności, zwijalna dla wielu) */}
      {(isExpanded || difficultiesCount === 1) && (
        <div className="beatmapset-difficulties">
          {/* Wyświetlaj wszystkie dzieci lub tylko początkowe */}
          {visibleChildrenLimited}
          
          {/* Przycisk "Pokaż wszystkie trudności" */}
          {shouldLimitDifficulties && (
            <div 
              className="show-all-difficulties-button"
              onClick={() => setShowAllDifficulties(true)}
            >
              Pokaż wszystkie trudności ({difficultiesCount})
            </div>
          )}
        </div>
      )}
    </div>
  );
};

BeatmapsetGroup.propTypes = {
  beatmapset: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    artist: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    creator: PropTypes.string.isRequired,
    cover: PropTypes.string
  }).isRequired,
  children: PropTypes.node.isRequired,
  defaultExpanded: PropTypes.bool,
  showCount: PropTypes.bool,
  className: PropTypes.string
};

export default BeatmapsetGroup;
