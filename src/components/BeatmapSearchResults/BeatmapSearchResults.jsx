'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { collectionsAtom } from '@/store/collectionAtom';
import classNames from 'classnames';
import AddBeatmapModal from './AddBeatmapModal';
import './beatmapSearchResults.scss';
import './beatmapModal.scss';

export default function BeatmapSearchResults({ 
  results, 
  currentPage, 
  itemsPerPage, 
  rowCount, 
  onPageChange,
  totalResults 
}) {
  const [collections, setCollections] = useAtom(collectionsAtom);
  const [expandedSets, setExpandedSets] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState(null);

  // Liczenie całkowitej liczby stron
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  
  // Obsługa rozwinięcia/zwinięcia szczegółów beatmapsetu
  const toggleExpanded = (id) => {
    setExpandedSets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const handleAddToCollection = (set, beatmap = null) => {
    setModalTarget({ set, beatmap, type: beatmap ? 'single' : 'all' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTarget(null);
  };
  const handleAddBeatmapSubmit = (formData) => {
    if (!modalTarget) return;
    
    const { set, beatmap, type } = modalTarget;
    
    // Find default "Unsorted" collection if none is selected
    const defaultCollectionId = collections.collections.find(c => c.isSystemCollection && c.name === 'Unsorted')?.id;
    
    // Use the selected collection or fall back to the default
    const collectionId = formData.collectionId || defaultCollectionId;
    const subcollectionId = formData.subcollectionId || null;
    
    if (!collectionId) {
      console.error('No collection selected and no default collection found');
      return;
    }
    
    setCollections(prev => {
      const newBeatmaps = { ...prev.beatmaps };
      const newTags = { ...prev.tags };
      
      // Prepare tags with values
      const userTags = (formData.tags || []).map(tag => {
        if (typeof tag === 'object' && tag.tag) return tag;
        // default tag_value = 0
        return { tag: tag, tag_value: 0 };
      });
      
      // Calculate beatmap_priority based on tag values sum
      const beatmap_priority = userTags.reduce((sum, t) => sum + (parseInt(t.tag_value) || 0), 0);
      
      // Update tag statistics
      userTags.forEach(tagObj => {
        const tagName = tagObj.tag;
        if (!tagName) return;
        
        if (!newTags[tagName]) {
          newTags[tagName] = { count: 0, beatmapIds: [] };
        }
      });
      
      if (type === 'all') {
        set.beatmaps.forEach(bm => {
          const beatmapData = { 
            ...bm, 
            setId: set.id,
            artist: set.artist,
            title: set.title,
            creator: set.creator,
            cover: set.covers?.cover || set.covers?.card,
            userTags: userTags,
            notes: formData.notes || '',
            beatmap_priority,
            collectionId,
            subcollectionId
          };
          
          newBeatmaps[bm.id] = beatmapData;
          
          // Update tag statistics
          userTags.forEach(tagObj => {
            const tagName = tagObj.tag;
            if (!tagName) return;
            
            if (!newTags[tagName].beatmapIds.includes(bm.id)) {
              newTags[tagName].count++;
              newTags[tagName].beatmapIds.push(bm.id);
            }
          });
        });
      } else if (beatmap) {
        const beatmapData = { 
          ...beatmap, 
          setId: set.id,
          artist: set.artist,
          title: set.title,
          creator: set.creator,
          cover: set.covers?.cover || set.covers?.card,
          userTags: userTags,
          notes: formData.notes || '',
          beatmap_priority,
          collectionId,
          subcollectionId
        };
        
        newBeatmaps[beatmap.id] = beatmapData;
        
        // Update tag statistics
        userTags.forEach(tagObj => {
          const tagName = tagObj.tag;
          if (!tagName) return;
          
          if (!newTags[tagName].beatmapIds.includes(beatmap.id)) {
            newTags[tagName].count++;
            newTags[tagName].beatmapIds.push(beatmap.id);
          }
        });
      }
      
      return { 
        ...prev, 
        beatmaps: newBeatmaps,
        tags: newTags
      };
    });
    
    closeModal();
  };

  const handleRemoveFromCollection = (beatmapId) => {
    setCollections(prev => {
      const newBeatmaps = { ...prev.beatmaps };
      delete newBeatmaps[beatmapId];
      return { ...prev, beatmaps: newBeatmaps };
    });
  };

  const isBeatmapInCollection = (beatmapId) => {
    return Object.values(collections.beatmaps || {}).some(bm => bm.id === beatmapId);
  };

  const areAllBeatmapsInCollection = (beatmaps) => {
    return beatmaps.every(bm => isBeatmapInCollection(bm.id));
  };

  // Funkcja określająca kolor trudności
  const getDiffColor = (star) => {
    if (star >= 6.5) return { background: '#ff1744', color: '#fff' };
    if (star >= 5.5) return { background: '#ff9100', color: '#fff' };
    if (star >= 4.5) return { background: '#ffd600', color: '#000' };
    if (star >= 3.5) return { background: '#00e676', color: '#000' };
    return { background: '#00bcd4', color: '#000' };
  };

  // Funkcja określająca klasę dla trudności
  const getDifficultyClass = (star) => {
    if (star >= 6.5) return 'extreme';
    if (star >= 5.5) return 'insane';
    if (star >= 4.5) return 'hard';
    if (star >= 3.5) return 'normal';
    return 'easy';
  };

  return (
    <div className="beatmap-search-results-container">
      <div className={`beatmap-search-results beatmap-search-results-${rowCount}-columns`}>
        {results.length === 0 ? (
          <div className="beatmap-search-results-empty">Any results foundn't</div>
        ) : (
          results.map(set => (
            <BeatmapsetItem
              key={set.id}
              set={set}
              expanded={!!expandedSets[set.id]}
              toggleExpanded={() => toggleExpanded(set.id)}
              onAddToCollection={handleAddToCollection}
              onRemoveFromCollection={handleRemoveFromCollection}
              isBeatmapInCollection={isBeatmapInCollection}
              areAllBeatmapsInCollection={areAllBeatmapsInCollection}
              getDiffColor={getDiffColor}
              getDifficultyClass={getDifficultyClass}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="beatmap-search-pagination">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="beatmap-search-pagination-button"
          >
            First
          </button>
          
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="beatmap-search-pagination-button"
          >
            Previous
          </button>
          
          <span className="beatmap-search-pagination-info">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="beatmap-search-pagination-button"
          >
            Next
          </button>
          
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="beatmap-search-pagination-button"
          >
            Last
          </button>
        </div>      )}      <AddBeatmapModal
        isOpen={modalOpen && modalTarget !== null}
        onClose={closeModal}
        beatmapset={modalTarget?.set}
        beatmap={modalTarget?.beatmap}
        onSubmit={handleAddBeatmapSubmit}
        initialTags={[]}
      />
    </div>
  );
}

// Komponent dla pojedynczego beatmapsetu
function BeatmapsetItem({ 
  set, 
  expanded, 
  toggleExpanded, 
  onAddToCollection, 
  onRemoveFromCollection, 
  isBeatmapInCollection, 
  areAllBeatmapsInCollection,
  getDiffColor,
  getDifficultyClass
}) {
  // Sortujemy beatmapy według poziomu trudności
  const sortedBeatmaps = [...(set.beatmaps || [])].sort((a, b) => a.difficulty_rating - b.difficulty_rating);
  
  // Fallback dla obrazków okładek
  const coverSources = [
    set.covers?.card,
    set.covers?.cover,
    set.covers?.list,
    set.covers?.slimcover,
    set.id ? `https://assets.ppy.sh/beatmaps/${set.id}/covers/cover.jpg` : null,
    set.id ? `https://assets.ppy.sh/beatmaps/${set.id}/covers/card.jpg` : null,
    '/favicon.ico'
  ].filter(Boolean);

  const [imgSrc, setImgSrc] = useState(coverSources[0]);
  
  const handleImgError = () => {
    const idx = coverSources.indexOf(imgSrc);
    if (idx < coverSources.length - 1) setImgSrc(coverSources[idx + 1]);
  };
  
  return (
    <div className={classNames('beatmapset-item', { 'expanded': expanded })}>
      <div className="beatmapset-main" onClick={toggleExpanded}>
        <div className="beatmapset-cover">
          <img 
            src={imgSrc} 
            alt={`${set.artist} - ${set.title}`} 
            onError={handleImgError} 
          />
        </div>
        
        <div className="beatmapset-info">
          <div className="beatmapset-title">
            <a 
              href={`https://osu.ppy.sh/beatmapsets/${set.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {set.artist} - {set.title}
            </a>
          </div>
          
          <div className="beatmapset-mapper">
            mapped by <a 
              href={`https://osu.ppy.sh/users/${set.user_id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {set.creator}
            </a>
          </div>
          
          <div className="beatmapset-preview">
            <div className="beatmapset-difficulty-squares">
              {sortedBeatmaps.map(diff => (
                <div 
                  key={diff.id}
                  className={`beatmapset-difficulty-square difficulty-${getDifficultyClass(diff.difficulty_rating)}`}
                  title={`${diff.version} (${diff.difficulty_rating.toFixed(2)}★)`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {!expanded && (
          <button className="beatmapset-toggle-button">
            ▼
          </button>
        )}
        
        {expanded && (
          <button className="beatmapset-toggle-button open">
            ▲
          </button>
        )}
      </div>
      
      {expanded && (
        <motion.div 
          className="beatmapset-difficulties"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="beatmapset-difficulties-list">
            {sortedBeatmaps.map(diff => {
              const inCollection = isBeatmapInCollection(diff.id);
              return (
                <div 
                  key={diff.id} 
                  className="beatmapset-difficulty-item"
                  style={{ 
                    borderColor: getDiffColor(diff.difficulty_rating).background 
                  }}
                >
                  <div className="beatmapset-difficulty-info">
                    <div 
                      className={`beatmapset-difficulty-indicator difficulty-${getDifficultyClass(diff.difficulty_rating)}`}
                      style={{ backgroundColor: getDiffColor(diff.difficulty_rating).background }}
                    ></div>
                    <a 
                      href={`https://osu.ppy.sh/beatmaps/${diff.id}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="beatmapset-difficulty-name"
                    >
                      {diff.version}
                    </a>
                    <span className="beatmapset-difficulty-stars">
                      {diff.difficulty_rating.toFixed(2)}★
                    </span>
                  </div>
                  <button 
                    className={classNames('beatmapset-difficulty-action', {
                      'add': !inCollection,
                      'remove': inCollection
                    })}
                    onClick={(e) => {
                      e.stopPropagation();
                      inCollection 
                        ? onRemoveFromCollection(diff.id)
                        : onAddToCollection(set, diff);
                    }}
                  >
                    {inCollection ? 'Usuń' : 'Dodaj'}
                  </button>
                </div>
              );
            })}
          </div>
          
          {sortedBeatmaps.length > 1 && (
            <div className="beatmapset-add-all">
              <button
                className={classNames('beatmapset-add-all-button', {
                  'remove': areAllBeatmapsInCollection(sortedBeatmaps)
                })}
                onClick={(e) => {
                  e.stopPropagation();
                  if (areAllBeatmapsInCollection(sortedBeatmaps)) {
                    sortedBeatmaps.forEach(bm => onRemoveFromCollection(bm.id));
                  } else {
                    onAddToCollection(set);
                  }
                }}
              >
                {areAllBeatmapsInCollection(sortedBeatmaps) 
                  ? 'Usuń wszystkie poziomy trudności' 
                  : 'Dodaj wszystkie poziomy trudności'}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
