'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { collectionsReducerAtom } from '@/store/collectionsReducerAtom';
import { Lock, Unlock, Grid3X3, List, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NeonBorderBox from './NeonBorderBox';
import SettingsModal from './SettingsModal';
import './newUserCollectionsPanel.scss';

/**
 * Nowy, przebudowany panel kolekcji użytkownika z zaawansowanymi funkcjami
 * - Drag & drop dla kolekcji, podkolekcji i beatmap
 * - Lock/unlock toggle z efektami neonowymi
 * - Smooth animations
 * - Column selector (1-5 kolumn)
 * - Osu!-style beatmap display
 */
export default function NewUserCollectionsPanel() {
  const [state, dispatch] = useAtom(collectionsReducerAtom);
  const [isLocked, setIsLocked] = useState(false);
  const [columns, setColumns] = useState(3);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const dragRef = useRef(null);

  // Sprawdź czy jesteśmy po stronie klienta
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Oblicz liczbę beatmap
  const beatmapsCount = isClient ? Object.keys(state.beatmaps || {}).length : 0;

  // Funkcje obsługi drag & drop
  const handleDragStart = useCallback((e, item, type) => {
    if (isLocked) return;

    setDraggedItem({ item, type });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, type }));

    // Dodaj klasę dragging do elementu
    e.target.classList.add('dragging');
  }, [isLocked]);

  const handleDragEnd = useCallback((e) => {
    setDraggedItem(null);
    setDragOverItem(null);
    e.target.classList.remove('dragging');
  }, []);

  const handleDragOver = useCallback((e, item, type) => {
    if (isLocked) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem({ item, type });
  }, [isLocked]);

  const handleDrop = useCallback((e, targetItem, targetType) => {
    if (isLocked || !draggedItem) return;

    e.preventDefault();

    const { item: sourceItem, type: sourceType } = draggedItem;

    // Logika przenoszenia elementów
    if (sourceType === 'beatmap' && targetType === 'collection') {
      // Przenieś beatmapę do innej kolekcji
      dispatch({
        type: 'MOVE_BEATMAP',
        payload: {
          beatmapId: sourceItem.id,
          targetCollectionId: targetItem.id,
          sourceCollectionId: sourceItem.collectionId
        }
      });
    } else if (sourceType === 'beatmap' && targetType === 'subcollection') {
      // Przenieś beatmapę do podkolekcji
      dispatch({
        type: 'MOVE_BEATMAP_TO_SUBCOLLECTION',
        payload: {
          beatmapId: sourceItem.id,
          targetCollectionId: targetItem.collectionId,
          targetSubcollectionId: targetItem.id,
          sourceCollectionId: sourceItem.collectionId,
          sourceSubcollectionId: sourceItem.subcollectionId
        }
      });
    } else if (sourceType === 'collection' && targetType === 'collection') {
      // Zmień kolejność kolekcji
      dispatch({
        type: 'REORDER_COLLECTIONS',
        payload: {
          sourceId: sourceItem.id,
          targetId: targetItem.id
        }
      });
    }

    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, isLocked, dispatch]);

  // Funkcja toggle lock/unlock
  const toggleLock = useCallback(() => {
    setIsLocked(prev => !prev);
  }, []);

  // Funkcja zmiany liczby kolumn
  const changeColumns = useCallback((newColumns) => {
    setColumns(Math.max(1, Math.min(5, newColumns)));
  }, []);

  // Render beatmapy w stylu osu!
  const renderBeatmapCard = useCallback((beatmap, index) => {
    // Sprawdź czy mamy dane beatmapy
    const beatmapData = state.beatmaps[beatmap.id];
    if (!beatmapData) {
      console.warn('Beatmap data not found for ID:', beatmap.id);
      return null;
    }

    // Sprawdź czy mamy dane beatmapset
    const beatmapsetData = state.beatmapsets[beatmapData.beatmapset_id];
    if (!beatmapsetData) {
      console.warn('Beatmapset data not found for beatmapset ID:', beatmapData.beatmapset_id);
      return null;
    }

    return (
      <motion.div
        key={beatmap.id}
        className={`beatmap-card ${draggedItem?.item?.id === beatmap.id ? 'dragging' : ''} ${dragOverItem?.item?.id === beatmap.id ? 'drag-over' : ''}`}
        draggable={!isLocked}
        onDragStart={(e) => handleDragStart(e, beatmap, 'beatmap')}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, beatmap, 'beatmap')}
        onDrop={(e) => handleDrop(e, beatmap, 'beatmap')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={!isLocked ? { scale: 1.02 } : {}}
        whileTap={!isLocked ? { scale: 0.98 } : {}}
      >
        <div className="beatmap-cover">
          <img
            src={beatmapsetData.covers?.card || beatmapsetData.covers?.list || '/default-beatmap-cover.jpg'}
            alt={`${beatmapsetData.artist} - ${beatmapsetData.title}`}
            loading="lazy"
            onError={(e) => {
              e.target.src = '/default-beatmap-cover.jpg';
            }}
          />
          <div className="beatmap-difficulty">
            {beatmapData.difficulty_rating?.toFixed(2)}★
          </div>
        </div>

        <div className="beatmap-info">
          <div className="beatmap-title">
            {beatmapsetData.artist} - {beatmapsetData.title}
          </div>
          <div className="beatmap-details">
            <span className="beatmap-version">{beatmapData.version}</span>
            <span className="beatmap-creator">by {beatmapsetData.creator}</span>
          </div>

          {beatmap.userTags && beatmap.userTags.length > 0 && (
            <div className="beatmap-tags">
              {beatmap.userTags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="tag">
                  {typeof tag === 'string' ? tag : tag.tag}
                </span>
              ))}
              {beatmap.userTags.length > 3 && (
                <span className="tag more">+{beatmap.userTags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="beatmap-actions">
          {beatmap.pinned && <div className="pinned-indicator">📌</div>}
          {beatmap.priority > 0 && <div className="priority-indicator">⭐</div>}
        </div>
      </motion.div>
    );
  }, [state.beatmaps, state.beatmapsets, draggedItem, dragOverItem, isLocked, handleDragStart, handleDragEnd, handleDragOver, handleDrop]);

  // Render kolekcji
  const renderCollection = useCallback((collection, index) => {
    const isExpanded = state.expandedCollection === collection.id;
    const beatmaps = Object.values(state.beatmaps || {}).filter(b =>
      b.collectionId === collection.id && !b.subcollectionId
    );

    return (
      <motion.div
        key={collection.id}
        className={`collection ${isExpanded ? 'expanded' : ''} ${collection.isSystemCollection ? 'system' : ''} ${dragOverItem?.item?.id === collection.id ? 'drag-over' : ''}`}
        draggable={!isLocked && !collection.isSystemCollection}
        onDragStart={(e) => handleDragStart(e, collection, 'collection')}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, collection, 'collection')}
        onDrop={(e) => handleDrop(e, collection, 'collection')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div
          className="collection-header"
          onClick={() => dispatch({ type: 'TOGGLE_EXPANDED_COLLECTION', payload: collection.id })}
        >
          <h3 className="collection-name">{collection.name}</h3>
          <div className="collection-stats">
            <span className="beatmaps-count">{beatmaps.length} beatmaps</span>
            {collection.subcollections && collection.subcollections.length > 0 && (
              <span className="subcollections-count">
                {collection.subcollections.length} subcollections
              </span>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="collection-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Beatmapy w kolekcji */}
              {beatmaps.length > 0 && (
                <div
                  className="beatmaps-grid"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: '16px'
                  }}
                >
                  {beatmaps.map((beatmap, idx) => renderBeatmapCard(beatmap, idx))}
                </div>
              )}

              {/* Podkolekcje */}
              {collection.subcollections && collection.subcollections.map(subcollection =>
                renderSubcollection(subcollection, collection.id, index)
              )}

              {beatmaps.length === 0 && (!collection.subcollections || collection.subcollections.length === 0) && (
                <div className="empty-collection">
                  <p>This collection is empty</p>
                  <p>Drag beatmaps here or create subcollections</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }, [state.expandedCollection, state.beatmaps, columns, dragOverItem, isLocked, handleDragStart, handleDragEnd, handleDragOver, handleDrop, dispatch, renderBeatmapCard]);

  // Render podkolekcji
  const renderSubcollection = useCallback((subcollection, parentCollectionId, parentIndex) => {
    const isExpanded = state.expandedSubcollection === subcollection.id;
    const beatmaps = Object.values(state.beatmaps || {}).filter(b =>
      b.collectionId === parentCollectionId && b.subcollectionId === subcollection.id
    );

    return (
      <motion.div
        key={subcollection.id}
        className={`subcollection ${isExpanded ? 'expanded' : ''} ${dragOverItem?.item?.id === subcollection.id ? 'drag-over' : ''}`}
        draggable={!isLocked}
        onDragStart={(e) => handleDragStart(e, { ...subcollection, collectionId: parentCollectionId }, 'subcollection')}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, { ...subcollection, collectionId: parentCollectionId }, 'subcollection')}
        onDrop={(e) => handleDrop(e, { ...subcollection, collectionId: parentCollectionId }, 'subcollection')}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: parentIndex * 0.1 + 0.2 }}
      >
        <div
          className="subcollection-header"
          onClick={() => dispatch({ type: 'TOGGLE_EXPANDED_SUBCOLLECTION', payload: subcollection.id })}
        >
          <h4 className="subcollection-name">{subcollection.name}</h4>
          <span className="beatmaps-count">{beatmaps.length} beatmaps</span>
        </div>

        <AnimatePresence>
          {isExpanded && beatmaps.length > 0 && (
            <motion.div
              className="subcollection-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="beatmaps-grid"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap: '12px'
                }}
              >
                {beatmaps.map((beatmap, idx) => renderBeatmapCard(beatmap, idx))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }, [state.expandedSubcollection, state.beatmaps, columns, dragOverItem, isLocked, handleDragStart, handleDragEnd, handleDragOver, handleDrop, dispatch, renderBeatmapCard]);

  // Funkcja do dodania testowych danych (tylko do developmentu)
  const addTestData = useCallback(() => {
    const testBeatmapset = {
      id: 12345,
      title: "Test Beatmap",
      artist: "Test Artist",
      creator: "Test Creator",
      covers: {
        card: "https://assets.ppy.sh/beatmaps/12345/covers/card.jpg",
        list: "https://assets.ppy.sh/beatmaps/12345/covers/list.jpg"
      }
    };

    const testBeatmap = {
      id: 12345,
      beatmapset_id: 12345,
      version: "Hard",
      difficulty_rating: 4.5,
      userTags: [{ tag: "test", tag_value: 1 }],
      notes: "Test beatmap",
      pinned: false,
      priority: 0,
      collectionId: state.collections[0]?.id || '00000000-0000-0000-0000-000000000000',
      subcollectionId: null
    };

    dispatch({ type: 'ADD_BEATMAPSET', payload: { beatmapsetData: testBeatmapset } });
    dispatch({ type: 'ADD_BEATMAP', payload: { beatmapData: testBeatmap, collectionId: testBeatmap.collectionId } });
  }, [state.collections, dispatch]);

  // Dodaj testowe dane przy pierwszym renderowaniu (tylko w development)
  useEffect(() => {
    if (isClient && process.env.NODE_ENV === 'development' && Object.keys(state.beatmaps || {}).length === 0) {
      // addTestData(); // Odkomentuj aby dodać testowe dane
    }
  }, [isClient, state.beatmaps, addTestData]);

  return (
    <NeonBorderBox className="new-user-collections-panel">
      {/* Panel header */}
      <div className="panel-header">
        <div className="panel-title-section">
          <h2 className="panel-title">Your Collections</h2>
          <motion.button
            className={`lock-toggle ${isLocked ? 'locked' : 'unlocked'}`}
            onClick={toggleLock}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
            <span>{isLocked ? 'Locked' : 'Unlocked'}</span>
          </motion.button>
        </div>

        <div className="panel-controls">
          {/* Column selector */}
          <div className="column-selector">
            <button
              className="column-btn"
              onClick={() => changeColumns(columns - 1)}
              disabled={columns <= 1}
            >
              <List size={16} />
            </button>
            <span className="columns-display">
              <Grid3X3 size={16} />
              {columns}
            </span>
            <button
              className="column-btn"
              onClick={() => changeColumns(columns + 1)}
              disabled={columns >= 5}
            >
              <Grid3X3 size={16} />
            </button>
          </div>

          {/* Settings button */}
          <motion.button
            className="settings-btn"
            onClick={() => setSettingsModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={20} />
          </motion.button>

          {/* Test data button (tylko w development) */}
          {process.env.NODE_ENV === 'development' && (
            <motion.button
              className="test-data-btn"
              onClick={addTestData}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '8px 12px',
                background: 'rgba(255, 0, 150, 0.2)',
                border: '1px solid #ff0096',
                borderRadius: '6px',
                color: '#ff0096',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Add Test Data
            </motion.button>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="panel-status">
        <span className="collections-count">
          {state.collections?.length || 0} collections
        </span>
        <span className="beatmaps-count">
          {beatmapsCount} total beatmaps
        </span>
        {!isLocked && isClient && (
          <motion.span
            className="drag-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Drag and drop to reorganize
          </motion.span>
        )}
      </div>

      {/* Collections list */}
      <div className="collections-container">
        {state.collections && state.collections.length > 0 ? (
          <AnimatePresence>
            {state.collections
              .sort((a, b) => (b.order || 0) - (a.order || 0))
              .map((collection, index) => renderCollection(collection, index))}
          </AnimatePresence>
        ) : (
          <div className="empty-state">
            <p>No collections found</p>
            <p>Your collections will appear here</p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </NeonBorderBox>
  );
}
