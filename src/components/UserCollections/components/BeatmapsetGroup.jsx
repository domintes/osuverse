import React, { useState } from 'react';
import PropTypes from 'prop-types';

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
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const difficultiesCount = React.Children.count(children);
  
  return (
    <div className={`beatmapset-group ${className}`}>
      {/* Nagłówek beatmapsetu */}
      <div 
        className={`beatmapset-header ${isExpanded ? 'expanded' : 'collapsed'}`}
        onClick={() => setIsExpanded(!isExpanded)}
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
            {showCount && (
              <span className="beatmapset-difficulty-count">
                {difficultiesCount} {difficultiesCount === 1 ? 'difficulty' : 'difficulties'}
              </span>
            )}
          </div>
        </div>
        
        {/* Ikona rozwijania/zwijania */}
        <div className="beatmapset-toggle">
          <svg 
            className={`beatmapset-toggle-icon ${isExpanded ? 'expanded' : ''}`} 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
      </div>
      
      {/* Rozwijana zawartość */}
      {isExpanded && (
        <div className="beatmapset-difficulties">
          {children}
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
