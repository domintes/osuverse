import React from 'react';
import PropTypes from 'prop-types';
import './BeatmapDifficulty.scss';

/**
 * Komponent pojedynczej trudności beatmapy - uproszczona wersja
 * Zawiera tylko podstawowe informacje o trudności, bez powtarzania zbędnych informacji
 */
const BeatmapDifficulty = ({ 
  beatmap, 
  onEdit, 
  onDelete, 
  onToggleFavorite,
  collections,
  showImage = false, // domyślnie nie pokazuj obrazu
  customTags = [] // opcjonalne dodatkowe tagi
}) => {
  // Formatuj gwiazdki trudności z dwoma miejscami po przecinku
  const formattedStars = beatmap.difficulty_rating 
    ? Number(beatmap.difficulty_rating).toFixed(2)
    : '?.??';
  
  // Tworzenie listy tagów
  const tags = beatmap.tags && beatmap.tags.length > 0
    ? beatmap.tags.map(tag => `#${tag}`).join(' ')
    : '';
  
  return (
    <div className="beatmapset-difficulty-item compact-view">
      <div className="beatmapset-difficulty-content">
        <div className="difficulty-info">
          <span className="difficulty-name">
            {beatmap.version} ({formattedStars}★)
          </span>
          
          {beatmap.creator && (
            <span className="difficulty-mapper">
              Mapper: {beatmap.creator}
            </span>
          )}
          
          {tags && (
            <span className="difficulty-tags">
              {tags}
            </span>
          )}
        </div>
      </div>
      
      {/* Przyciski akcji (edytuj/usuń) - widoczne tylko gdy są dostępne */}
      {(onEdit || onDelete || onToggleFavorite) && (
        <div className="beatmapset-difficulty-actions">
          {onEdit && (
            <button 
              className="action-button edit-button" 
              onClick={() => onEdit(beatmap)}
              title="Edit beatmap"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button 
              className="action-button delete-button" 
              onClick={() => onDelete(beatmap)}
              title="Remove from collection"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </button>
          )}
          
          {onToggleFavorite && (
            <button 
              className="action-button favorite-button" 
              onClick={() => onToggleFavorite(beatmap)}
              title="Add to favorites"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

BeatmapDifficulty.propTypes = {
  beatmap: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    version: PropTypes.string,
    difficulty_rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    creator: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object]))
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleFavorite: PropTypes.func,
  collections: PropTypes.array,
  showImage: PropTypes.bool,
  customTags: PropTypes.array
};

export default BeatmapDifficulty;
