import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './beatmapsetList.scss';

/**
 * Komponent wyświetlający listę beatmapsetów na głównej stronie
 */
export default function BeatmapsetList({ beatmapsets, onAddToCollection }) {
  if (!beatmapsets?.length) return <div className="beatmapset-list-empty">Brak wyników.</div>;
  return (
    <motion.div className="beatmapset-list" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.3 }}>
      {beatmapsets.map(set => (
        <BeatmapsetListItem key={set.id} set={set} onAddToCollection={onAddToCollection} />
      ))}
    </motion.div>
  );
}

function BeatmapsetListItem({ set, onAddToCollection }) {
  const [showDifficulties, setShowDifficulties] = useState(false);
  
  const handleMouseEnter = () => {
    setShowDifficulties(true);
  };
  
  const handleMouseLeave = () => {
    setShowDifficulties(false);
  };
  
  return (
    <motion.div
      className={`beatmapset-item-box${showDifficulties ? ' expanded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.15 }}
    >
      {/* Cover */}
      <div className="beatmapset-cover">
        <img 
          src={set.cover || `https://assets.ppy.sh/beatmaps/${set.id}/covers/card.jpg`} 
          alt={`${set.artist} - ${set.title}`} 
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = '/favicon.ico'; 
          }} 
        />
      </div>
      
      {/* Informacje */}
      <div className="beatmapset-info">
        <div className="beatmapset-title">
          <a 
            href={`https://osu.ppy.sh/beatmapsets/${set.id}`} 
            target="_blank"
            rel="noopener noreferrer"
            title={`${set.artist} - ${set.title}`}
          >
            {set.artist} - {set.title}
          </a>
        </div>
        <div className="beatmapset-creator">
          mapped by <a 
            href={`https://osu.ppy.sh/users/${set.creator_id || set.user_id}`} 
            target="_blank"
            rel="noopener noreferrer"
          >
            {set.creator || 'unknown'}
          </a>
        </div>
        
        {/* Znacznik kolekcji */}
        {set.inCollection && (
          <span className="beatmapset-in-collection" title="Beatmapa już w twojej kolekcji">
            ★
          </span>
        )}
      </div>
      
      {/* Przycisk dodawania */}
      <div className="beatmapset-action">
        <button
          className="add-to-collection-btn"
          onClick={() => onAddToCollection(set)}
          disabled={set.inCollection}
        >
          {set.inCollection ? 'Zapisane' : 'Dodaj'}
        </button>
      </div>
      
      {/* Panel trudności */}
      {showDifficulties && (
        <motion.div
          className="beatmapset-difficulties-panel"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <h4>Difficulties:</h4>
          <div className="beatmapset-difficulties">
            {(set.beatmaps || []).map(map => (
              <div
                key={map.id}
                className={`beatmapset-difficulty difficulty-${getDifficultyClass(map.difficulty_rating)}`}
              >
                <span className="diff-name">{map.version}</span>
                <span className="diff-stars">{map.difficulty_rating.toFixed(2)}★</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Funkcja pomocnicza formatująca trudność
function getDifficultyClass(difficultyRating) {
  if (!difficultyRating) return 'easy';
  if (difficultyRating < 2) return 'easy';
  if (difficultyRating < 3.5) return 'normal';
  if (difficultyRating < 5) return 'hard';
  if (difficultyRating < 6.5) return 'insane';
  if (difficultyRating < 8) return 'expert';
  return 'expertplus';
}
