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
  const [expanded, setExpanded] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(null);
  const handleMouseEnter = () => {
    // Anuluj poprzedni timer jeśli istnieje
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }
      const timer = setTimeout(() => {
      setExpanded(true);
    }, 1000); // 1000ms (1s) opóźnienie przed rozwinięciem zgodnie z wymaganiem
    setHoverTimer(timer);
  };
  
  // Czyszczenie timeoutów przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
      }
    };
  }, [hoverTimer]);
  const handleMouseLeave = (e) => {
    // Sprawdź, czy opuszczamy element i nie wchodzimy na panel trudności
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    
    // Sprawdź, czy nie najeżdżamy na panel trudności
    const toElement = e.relatedTarget;
    const isMovingToDifficulties = toElement && 
      (toElement.classList.contains('difficulties-panel') || 
       toElement.closest('.difficulties-panel'));
    
    // Dodatkowe zabezpieczenie przed przypadkowym zwinięciem
    // Jeśli nie przechodzimy na panel trudności, ustaw timeout przed zwinięciem
    if (!isMovingToDifficulties) {
      // Opóźnienie przed zwinięciem, aby zapobiec migotaniu przy szybkim ruchu kursora
      setTimeout(() => {
        // Sprawdzenie ponownie, czy panel nie powinien pozostać rozwinięty
        // (jeśli użytkownik w międzyczasie wrócił kursorem)
        const isStillOverElement = document.querySelector('.beatmapset-list-item:hover') === e.currentTarget;
        const isStillOverPanel = document.querySelector('.difficulties-panel:hover') !== null;
        
        if (!isStillOverElement && !isStillOverPanel) {
          setExpanded(false);
        }
      }, 100);
    }
  };
  
  return (
    <motion.div
      className={`beatmapset-list-item${expanded ? ' expanded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18 }}
    >
      <div className="beatmapset-main">
        <div className="cover" style={{ backgroundImage: `url(${set.covers?.cover || set.cover || ''})` }} />
        <div className="info">
          <div className="title">{set.artist} – {set.title}</div>
          <div className="mapper">mapped by <span>{set.creator}</span></div>
          <div className="tags">
            {(set.tags || []).map(tag => (
              <span className="tag-chip" key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
        <button className="add-btn" onClick={() => onAddToCollection?.(set)}>Dodaj do kolekcji</button>
      </div>      {expanded && (        <motion.div
          className="difficulties-panel"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}          onMouseLeave={(e) => {
            // Sprawdź, czy opuszczamy panel i nie wchodzimy z powrotem na beatmapset-item
            const toElement = e.relatedTarget;
            const isMovingToParent = toElement && 
              (toElement.classList.contains('beatmapset-list-item') || 
               toElement.closest('.beatmapset-list-item') === e.currentTarget.parentNode);
              
            // Dodatkowe zabezpieczenie przed przypadkowym zwinięciem
            if (!isMovingToParent) {
              // Opóźnienie przed zwinięciem, aby zapobiec migotaniu przy szybkim ruchu kursora
              setTimeout(() => {
                // Sprawdzenie ponownie, czy panel powinien pozostać rozwinięty
                const isStillOverItem = document.querySelector('.beatmapset-list-item:hover') === e.currentTarget.parentNode;
                const isStillOverPanel = document.querySelector('.difficulties-panel:hover') !== null;
                
                if (!isStillOverItem && !isStillOverPanel) {
                  setExpanded(false);
                }
              }, 100);
            }
          }}
        >
          <div className="difficulties-list">
            {set.beatmaps?.map(diff => (
              <div 
                className="difficulty-rect" 
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
