'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { collectionsAtom } from '@/store/collectionAtom';
import classNames from 'classnames';
import AddBeatmapModal from './AddBeatmapModal';
import { findSystemCollection } from '@/components/UserCollections/utils/collectionUtils';
import './beatmapSearchResults.scss';
import './addBeatmapModal.scss';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { LuZap } from 'react-icons/lu';
import { BiSolidZap } from 'react-icons/bi';

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
  const openExpanded = (id) => setExpandedSets(prev => ({ ...prev, [id]: true }));
  const closeExpanded = (id) => setExpandedSets(prev => ({ ...prev, [id]: false }));
  const handleAddToCollection = (set, beatmap = null) => {
    setModalTarget({ set, beatmap, type: beatmap ? 'single' : 'all' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTarget(null);
  };  const handleAddBeatmapSubmit = (formData) => {
    if (!modalTarget) return;

    const { set, beatmap, type } = modalTarget;

    // Najpierw szukamy konkretnie kolekcji "Unsorted" używając funkcji pomocniczej
    const unsortedCollection = findSystemCollection(collections, 'Unsorted');
    // Find default "Unsorted" collection if none is selected
    const defaultCollectionId = unsortedCollection?.id;

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

  // Special lists helpers
  const getSystemCollectionByName = (name) => findSystemCollection(collections, name);
  const isSetFavorited = (set) => {
    const fav = getSystemCollectionByName('Favorites');
    if (!fav) return false;
    return (set.beatmaps || []).some(b => Object.values(collections.beatmaps || {}).some(x => x.id === b.id && x.collectionId === fav.id));
  };
  const toggleFavoriteSet = (set) => {
    const fav = getSystemCollectionByName('Favorites');
    const uns = getSystemCollectionByName('Unsorted');
    if (!fav) return;
    const already = isSetFavorited(set);
    setCollections(prev => {
      const newBeatmaps = { ...prev.beatmaps };
      (set.beatmaps || []).forEach(bm => {
        const exists = newBeatmaps[bm.id];
        if (already) {
          // move to unsorted or remove if no unsorted
          if (exists && uns) {
            newBeatmaps[bm.id] = { ...exists, collectionId: uns.id, subcollectionId: null };
          } else if (exists && !uns) {
            delete newBeatmaps[bm.id];
          }
        } else {
          // add/update into favorites
          const base = exists || {
            ...bm,
            setId: set.id,
            artist: set.artist,
            title: set.title,
            creator: set.creator,
            cover: set.covers?.cover || set.covers?.card,
            userTags: [],
            notes: '',
            beatmap_priority: 0
          };
          newBeatmaps[bm.id] = { ...base, collectionId: fav.id, subcollectionId: null };
        }
      });
      return { ...prev, beatmaps: newBeatmaps };
    });
  };
  const isSetInToCheck = (set) => {
    const tc = getSystemCollectionByName('To Check');
    if (!tc) return false;
    return (set.beatmaps || []).some(b => Object.values(collections.beatmaps || {}).some(x => x.id === b.id && x.collectionId === tc.id));
  };
  const quickAddToCheck = (set) => {
    const tc = getSystemCollectionByName('To Check');
    if (!tc) return;
    const already = isSetInToCheck(set);
    setCollections(prev => {
      const newBeatmaps = { ...prev.beatmaps };
      (set.beatmaps || []).forEach(bm => {
        const exists = newBeatmaps[bm.id];
        if (already) {
          // remove from To Check only
          if (exists && exists.collectionId === tc.id) {
            delete newBeatmaps[bm.id];
          }
        } else {
          const base = exists || {
            ...bm,
            setId: set.id,
            artist: set.artist,
            title: set.title,
            creator: set.creator,
            cover: set.covers?.cover || set.covers?.card,
            userTags: [],
            notes: '',
            beatmap_priority: 0
          };
          newBeatmaps[bm.id] = { ...base, collectionId: tc.id, subcollectionId: null };
        }
      });
      return { ...prev, beatmaps: newBeatmaps };
    });
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
              openExpanded={() => openExpanded(set.id)}
              closeExpanded={() => closeExpanded(set.id)}
              onAddToCollection={handleAddToCollection}
              onRemoveFromCollection={handleRemoveFromCollection}
              isBeatmapInCollection={isBeatmapInCollection}
              areAllBeatmapsInCollection={areAllBeatmapsInCollection}
              getDiffColor={getDiffColor}
              getDifficultyClass={getDifficultyClass}
              // Favorites / To Check helpers
              isSetFavorited={isSetFavorited}
              toggleFavoriteSet={toggleFavoriteSet}
              isSetInToCheck={isSetInToCheck}
              quickAddToCheck={quickAddToCheck}
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
        </div>
      )}

      <AddBeatmapModal
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
  openExpanded,
  closeExpanded,
  onAddToCollection,
  onRemoveFromCollection,
  isBeatmapInCollection,
  areAllBeatmapsInCollection,
  getDiffColor,
  getDifficultyClass,
  // injected helpers
  isSetFavorited,
  toggleFavoriteSet,
  isSetInToCheck,
  quickAddToCheck
}) {
  // Sortujemy beatmapy według poziomu trudności
  const sortedBeatmaps = [...(set.beatmaps || [])].sort((a, b) => a.difficulty_rating - b.difficulty_rating);
  const hardest = sortedBeatmaps[sortedBeatmaps.length - 1];

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
  const [hoverTimer, setHoverTimer] = useState(null);

  // Czyszczenie timeoutów przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
      }
    };
  }, [hoverTimer]);

  const handleImgError = () => {
    const idx = coverSources.indexOf(imgSrc);
    if (idx < coverSources.length - 1) setImgSrc(coverSources[idx + 1]);
  };

  // Usunięcie automatycznego rozwijania - tylko kliknięcie w beatmapset-preview rozwija
  const handleMouseLeave = (e) => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
  };

  return (
    <div
      className={classNames('beatmapset-item', { 'expanded': expanded })}
      onMouseLeave={(e) => { handleMouseLeave(e); closeExpanded && closeExpanded(set.id); }}
    >
      {/* Left edge vertical action (plus full-height) */}
      <div className="beatmapset-action-rail left">
        <button
          className="action-btn plus"
          title="Add to collection"
          onClick={(e) => { e.stopPropagation(); onAddToCollection(set); }}
          aria-label="Open add modal"
        >
          +
        </button>
      </div>
      <div className="beatmapset-cover">
        <img
          src={imgSrc}
          alt={`${set.artist} - ${set.title}`}
          onError={handleImgError}
        />
      </div>

      <div className="beatmapset-info">
        <div className="beatmapset-title">
          <div className="title-actions">

            <button
              className="action-btn zap"
              title={isSetInToCheck(set) ? 'Remove from To Check' : 'Quick add to To Check'}
              onClick={(e) => { e.stopPropagation(); quickAddToCheck(set); }}
              aria-label="Quick add To Check"
            >
              {isSetInToCheck(set) ? <BiSolidZap /> : <LuZap />}
            </button>
            <button
              className="action-btn star"
              title={isSetFavorited(set) ? 'Remove from Favourites' : 'Add to Favourites'}
              onClick={(e) => { e.stopPropagation(); toggleFavoriteSet(set); }}
              aria-label="Toggle favourite"
            >
              {isSetFavorited(set) ? <FaStar /> : <FaRegStar />}
            </button>
          </div>
          <a
            href={`https://osu.ppy.sh/beatmapsets/${set.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`${set.artist} - ${set.title}`}
          >
            {set.title}
          </a>
          {` `}
          <span>by</span>{` `}
          <a
            href={`/search?artist=${encodeURIComponent(set.artist || '')}`}
            title={`Search by artist: ${set.artist}`}
          >
            {set.artist}
          </a>
        </div>

        <div className="beatmapset-mapper">
          mapped by <a
            href={`/search?mapper=${encodeURIComponent(set.creator || '')}`}
            title={`Search by mapper: ${set.creator}`}
          >
            {set.creator}
          </a>
        </div>

        {/* Hardest difficulty topline with quick actions */}
        {hardest && (
          <div className="beatmapset-hardest">
            <span className="hardest-name">{hardest.version}</span>
            <span className="hardest-stars">{hardest.difficulty_rating.toFixed(2)}★</span>
            <span className="hardest-sep">•</span>
            <button
              className="hardest-action"
              onClick={(e) => { e.stopPropagation(); onAddToCollection(set, hardest); }}
            >Add diff</button>
            <span className="hardest-sep">|</span>
            <button
              className="hardest-action"
              onClick={(e) => { e.stopPropagation(); onAddToCollection(set); }}
            >Add mapset</button>
          </div>
        )}

        <div className="beatmapset-preview" onMouseEnter={() => openExpanded && openExpanded(set.id)} onClick={() => toggleExpanded()}>
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

      {expanded && (
        <motion.div
          className="beatmapset-difficulties"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onMouseLeave={(e) => {
            // Dodanie zabezpieczeń przed undefined
            const toElement = e.relatedTarget;
            const isMovingToParent = toElement &&
              ((toElement?.classList && toElement.classList.contains('beatmapset-item')) ||
                (toElement?.closest && toElement.closest('.beatmapset-item')));

            if (!isMovingToParent) {
              // Bezpieczne sprawdzanie, czy kursor jest nad elementem
              setTimeout(() => {
                try {
                  const isStillOverItem = document.querySelector('.beatmapset-item:hover');
                  const isStillOverPanel = document.querySelector('.beatmapset-difficulties:hover');

                  if (!isStillOverItem && !isStillOverPanel) {
                    toggleExpanded();
                  }
                } catch (error) {
                  console.log("Error during hover check:", error);
                }
              }, 100);
            }
          }}
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
                    <span className="beatmapset-difficulty-stars">
                      {diff.difficulty_rating.toFixed(2)}★
                    </span>
                    <a
                      href={`https://osu.ppy.sh/beatmaps/${diff.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="beatmapset-difficulty-name"
                    >
                      {diff.version}
                    </a>
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
                    {inCollection ? 'Remove' : 'Add'}
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
                  ? 'Remove all difficulties'
                  : 'Add all difficulties'}
              </button>
            </div>
          )}
        </motion.div>
      )}
      {/* Bottom-right download button */}
      <a
        className="download-btn"
        href={`https://osu.ppy.sh/beatmapsets/${set.id}/download`}
        target="_blank"
        rel="noopener noreferrer"
        title="Download from Bancho"
        onClick={(e) => e.stopPropagation()}
      >
        ⬇
      </a>
    </div>
  );
}
