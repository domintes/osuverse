import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './beatmapsetList.scss';

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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18 }}
    >
      <div className="beatmapset-content">
        <div className="beatmapset-cover" style={{ backgroundImage: `url(${set.covers?.cover || set.cover || ''})` }} />
        <div className="beatmapset-info">
          <div className="title">{set.artist} – {set.title}</div>
          <div className="mapper">mapped by <span>{set.creator}</span></div>
          <div className="tags">
            {(set.tags || []).map(tag => (
              <span className="tag-chip" key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
        <button className="add-btn" onClick={() => onAddToCollection?.(set)}>Add to Collection</button>
      </div>
      
      {set.beatmaps && (
        <motion.div
          className="beatmap-difficulty-list"
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: showDifficulties ? 1 : 0,
            height: showDifficulties ? 'auto' : 0
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="difficulties-container">
            {set.beatmaps.map(diff => (
              <div 
                className="beatmapset-difficulty-item" 
                key={diff.id} 
                title={diff.version} 
                style={{ 
                  background: getDiffColor(diff.difficulty_rating),
                  borderColor: `${getDiffColor(diff.difficulty_rating)}66` // Półprzezroczysty kolor obramowania
                }}
              >
                <span>{diff.version}</span>
                <span className="stars">{diff.difficulty_rating?.toFixed(2)}★</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function getDiffColor(star) {
  if (star >= 6.5) return '#ff1744';
  if (star >= 5.5) return '#ff9100';
  if (star >= 4.5) return '#ffd600';
  if (star >= 3.5) return '#00e676';
  return '#00bcd4';
}
