'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { collectionsReducerAtom } from '@/store/collectionsReducerAtom';
import { authAtom } from '@/store/authAtom';
import { Lock, Unlock, Grid3X3, List, Settings, Plus, Heart, Pin, Star, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NeonBorderBox from './NeonBorderBox';
import QuickAddModal from './QuickAddModal';
import AdvancedAddModal from './AdvancedAddModal';
import SettingsModal from './SettingsModal';
import './advancedUserCollectionsPanel.scss';

/**
 * Zaawansowany panel kolekcji użytkownika z pełną funkcjonalnością
 * 
 * Funkcje:
 * - Drag & drop dla kolekcji, podkolekcji i beatmap
 * - Lock/unlock toggle z efektami neonowymi
 * - Smooth animations
 * - Column selector (1-5 kolumn)
 * - osu!-style beatmap display
 * - Priority system (-3 do +3)
 * - Favorites i Pin system
 * - Auto-generated tags
 * - Quick Add i Advanced Add modals
 */
export default function AdvancedUserCollectionsPanel() {
  const [state, dispatch] = useAtom(collectionsReducerAtom);
  const [authState] = useAtom(authAtom);
  const [isLocked, setIsLocked] = useState(false);
  const [columns, setColumns] = useState(3);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [advancedAddModalOpen, setAdvancedAddModalOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [selectedBeatmap, setSelectedBeatmap] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const dragRef = useRef(null);

  // Sprawdź czy jesteśmy po stronie klienta
  useEffect(() => {
    setIsClient(true);
    // Inicjuj systemowe kolekcje
    initializeSystemCollections();
  }, []);

  // Inicjalizacja systemowych kolekcji
  const initializeSystemCollections = useCallback(() => {
    if (!state.collections.some(c => c.isSystemCollection && c.name === 'Favorites')) {
      dispatch({
        type: 'ADD_SYSTEM_COLLECTION',
        payload: {
          name: 'Favorites',
          id: 'favorites-system-collection',
          isSystemCollection: true,
          order: -1000
        }
      });
    }
  }, [state.collections, dispatch]);

  // Funkcje obsługi drag & drop
  const handleDragStart = useCallback((e, item, type) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }

    setDraggedItem({ item, type });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, type }));
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
      dispatch({
        type: 'MOVE_BEATMAP',
        payload: {
          beatmapId: sourceItem.id,
          targetCollectionId: targetItem.id,
          sourceCollectionId: sourceItem.collectionId
        }
      });
    } else if (sourceType === 'beatmap' && targetType === 'subcollection') {
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
      dispatch({
        type: 'REORDER_COLLECTIONS',
        payload: {
          sourceId: sourceItem.id,
          targetId: targetItem.id
        }
      });
    } else if (sourceType === 'subcollection' && targetType === 'collection') {
      dispatch({
        type: 'MOVE_SUBCOLLECTION',
        payload: {
          subcollection: sourceItem,
          fromCollectionId: sourceItem.collectionId,
          toCollectionId: targetItem.id
        }
      });
    }

    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, isLocked, dispatch]);

  // Toggle lock/unlock
  const toggleLock = useCallback(() => {
    setIsLocked(prev => !prev);
  }, []);

  // Zmiana liczby kolumn
  const changeColumns = useCallback((newColumns) => {
    setColumns(Math.max(1, Math.min(5, newColumns)));
  }, []);

  // Auto-generated tags
  const generateAutoTags = useCallback((beatmap, beatmapset) => {
    const autoTags = [];
    
    if (beatmapset.artist) autoTags.push({ tag: `artist:${beatmapset.artist}`, isAuto: true });
    if (beatmap.difficulty_rating) {
      const difficulty = beatmap.difficulty_rating;
      if (difficulty < 2) autoTags.push({ tag: 'difficulty:easy', isAuto: true });
      else if (difficulty < 4) autoTags.push({ tag: 'difficulty:normal', isAuto: true });
      else if (difficulty < 6) autoTags.push({ tag: 'difficulty:hard', isAuto: true });
      else if (difficulty < 8) autoTags.push({ tag: 'difficulty:insane', isAuto: true });
      else autoTags.push({ tag: 'difficulty:expert', isAuto: true });
    }
    if (beatmap.ar) autoTags.push({ tag: `ar:${Math.round(beatmap.ar)}`, isAuto: true });
    if (beatmap.cs) autoTags.push({ tag: `cs:${Math.round(beatmap.cs)}`, isAuto: true });
    if (beatmap.od) autoTags.push({ tag: `od:${Math.round(beatmap.od)}`, isAuto: true });
    if (beatmap.hp) autoTags.push({ tag: `hp:${Math.round(beatmap.hp)}`, isAuto: true });
    if (beatmapset.ranked_date) autoTags.push({ tag: 'status:ranked', isAuto: true });
    else if (beatmapset.approved_date) autoTags.push({ tag: 'status:approved', isAuto: true });
    else autoTags.push({ tag: 'status:unranked', isAuto: true });

    return autoTags;
  }, []);

  // Calculate priority
  const calculatePriority = useCallback((userTags) => {
    if (!userTags || !userTags.length) return 0;
    return userTags.reduce((sum, tag) => sum + (tag.tag_value || 0), 0);
  }, []);

  // Render beatmap card w stylu osu!
  const renderBeatmapCard = useCallback((beatmap, index) => {
    const beatmapData = state.beatmaps[beatmap.id];
    const beatmapsetData = state.beatmapsets[beatmapData?.beatmapset_id];

    if (!beatmapData || !beatmapsetData) {
      console.warn('Missing beatmap data:', { beatmapId: beatmap.id, beatmapData, beatmapsetData });
      return null;
    }

    const autoTags = generateAutoTags(beatmapData, beatmapsetData);
    const priority = calculatePriority(beatmap.userTags);
    const isPinned = beatmap.pinned || false;
    const isFavorite = beatmap.favorite || false;

    return (
      <motion.div
        key={beatmap.id}
        className={`osu-beatmap-card ${draggedItem?.item?.id === beatmap.id ? 'dragging' : ''} ${dragOverItem?.item?.id === beatmap.id ? 'drag-over' : ''} ${isPinned ? 'pinned' : ''}`}
        draggable={!isLocked}
        onDragStart={(e) => handleDragStart(e, beatmap, 'beatmap')}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, beatmap, 'beatmap')}
        onDrop={(e) => handleDrop(e, beatmap, 'beatmap')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
        style={{ order: isPinned ? -1000 : priority }}
      >
        {/* Cover Image */}
        <div className="beatmap-cover">
          <img
            src={beatmapsetData.covers?.card || beatmapsetData.covers?.list || '/default-beatmap-cover.jpg'}
            alt={`${beatmapsetData.artist} - ${beatmapsetData.title}`}
            loading="lazy"
            onError={(e) => {
              e.target.src = '/default-beatmap-cover.jpg';
            }}
          />
          
          {/* Overlays */}
          <div className="beatmap-overlay">
            <div className="difficulty-rating">
              {beatmapData.difficulty_rating?.toFixed(2)}★
            </div>
            
            {isPinned && (
              <div className="pin-indicator">
                <Pin size={16} />
              </div>
            )}
            
            {isFavorite && (
              <div className="favorite-indicator">
                <Heart size={16} />
              </div>
            )}
            
            {priority !== 0 && (
              <div className={`priority-indicator ${priority > 0 ? 'positive' : 'negative'}`}>
                {priority > 0 ? '+' : ''}{priority}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="beatmap-info">
          <div className="beatmap-title">
            {beatmapsetData.artist} - {beatmapsetData.title}
          </div>
          <div className="beatmap-details">
            <span className="beatmap-version">[{beatmapData.version}]</span>
            <span className="beatmap-creator">by {beatmapsetData.creator}</span>
          </div>

          {/* User Tags */}
          {beatmap.userTags && beatmap.userTags.length > 0 && (
            <div className="beatmap-tags user-tags">
              {beatmap.userTags.slice(0, 3).map((tag, idx) => (
                <span 
                  key={idx} 
                  className={`tag user-tag priority-${tag.tag_value > 0 ? 'positive' : tag.tag_value < 0 ? 'negative' : 'neutral'}`}
                >
                  {typeof tag === 'string' ? tag : tag.tag}
                  {tag.tag_value && tag.tag_value !== 0 && (
                    <span className="tag-value">({tag.tag_value > 0 ? '+' : ''}{tag.tag_value})</span>
                  )}
                </span>
              ))}
              {beatmap.userTags.length > 3 && (
                <span className="tag more">+{beatmap.userTags.length - 3}</span>
              )}
            </div>
          )}

          {/* Auto Tags */}
          <div className="beatmap-tags auto-tags">
            {autoTags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="tag auto-tag">
                {tag.tag}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="beatmap-actions">
          <motion.button
            className={`action-btn favorite-btn ${isFavorite ? 'active' : ''}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({
                type: 'TOGGLE_FAVORITE',
                payload: { beatmapId: beatmap.id }
              });
            }}
          >
            <Heart size={14} />
          </motion.button>
          
          <motion.button
            className={`action-btn pin-btn ${isPinned ? 'active' : ''}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({
                type: 'TOGGLE_PIN',
                payload: { beatmapId: beatmap.id }
              });
            }}
          >
            <Pin size={14} />
          </motion.button>

          <motion.button
            className="action-btn more-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBeatmap(beatmap);
              setAdvancedAddModalOpen(true);
            }}
          >
            <MoreVertical size={14} />
          </motion.button>
        </div>
      </motion.div>
    );
  }, [state.beatmaps, state.beatmapsets, draggedItem, dragOverItem, isLocked, handleDragStart, handleDragEnd, handleDragOver, handleDrop, generateAutoTags, calculatePriority, dispatch]);

  // Render kolekcji
  const renderCollection = useCallback((collection, index) => {
    const isExpanded = state.expandedCollection === collection.id;
    const beatmaps = Object.values(state.beatmaps || {})
      .filter(b => b.collectionId === collection.id && !b.subcollectionId)
      .sort((a, b) => {
        // Pinned first
        if (a.pinned !== b.pinned) return b.pinned - a.pinned;
        // Then by priority
        const aPriority = calculatePriority(a.userTags);
        const bPriority = calculatePriority(b.userTags);
        return bPriority - aPriority;
      });

    const totalBeatmaps = Object.values(state.beatmaps || {})
      .filter(b => b.collectionId === collection.id).length;

    return (
      <motion.div
        key={collection.id}
        className={`advanced-collection ${isExpanded ? 'expanded' : ''} ${collection.isSystemCollection ? 'system' : ''} ${dragOverItem?.item?.id === collection.id ? 'drag-over' : ''}`}
        draggable={!isLocked && !collection.isSystemCollection}
        onDragStart={(e) => handleDragStart(e, collection, 'collection')}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, collection, 'collection')}
        onDrop={(e) => handleDrop(e, collection, 'collection')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div
          className="collection-header"
          onClick={() => dispatch({ type: 'TOGGLE_EXPANDED_COLLECTION', payload: collection.id })}
        >
          <div className="collection-info">
            <h3 className="collection-name">{collection.name}</h3>
            <div className="collection-stats">
              <span className="beatmaps-count">{totalBeatmaps} beatmaps</span>
              {collection.subcollections && collection.subcollections.length > 0 && (
                <span className="subcollections-count">
                  {collection.subcollections.length} subcollections
                </span>
              )}
            </div>
          </div>

          {!collection.isSystemCollection && !isLocked && (
            <div className="collection-actions">
              <motion.button
                className="action-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Add subcollection logic
                }}
              >
                <Plus size={16} />
              </motion.button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="collection-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Subcollections */}
              {collection.subcollections && collection.subcollections.map(subcollection =>
                renderSubcollection(subcollection, collection.id, index)
              )}

              {/* Direct beatmaps */}
              {beatmaps.length > 0 && (
                <div
                  className="beatmaps-grid"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: '16px',
                    padding: '16px'
                  }}
                >
                  {beatmaps.map((beatmap, idx) => renderBeatmapCard(beatmap, idx))}
                </div>
              )}

              {totalBeatmaps === 0 && (
                <div className="empty-collection">
                  <div className="empty-icon">
                    <Grid3X3 size={48} />
                  </div>
                  <p>This collection is empty</p>
                  <p>Drag beatmaps here or use the search to add them</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }, [state, columns, dragOverItem, isLocked, handleDragStart, handleDragEnd, handleDragOver, handleDrop, dispatch, renderBeatmapCard, calculatePriority]);

  // Render subcollection
  const renderSubcollection = useCallback((subcollection, parentCollectionId, parentIndex) => {
    const isExpanded = state.expandedSubcollection === subcollection.id;
    const beatmaps = Object.values(state.beatmaps || {})
      .filter(b => b.collectionId === parentCollectionId && b.subcollectionId === subcollection.id)
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned - a.pinned;
        const aPriority = calculatePriority(a.userTags);
        const bPriority = calculatePriority(b.userTags);
        return bPriority - aPriority;
      });

    return (
      <motion.div
        key={subcollection.id}
        className={`advanced-subcollection ${isExpanded ? 'expanded' : ''} ${dragOverItem?.item?.id === subcollection.id ? 'drag-over' : ''}`}
        draggable={!isLocked}
        onDragStart={(e) => handleDragStart(e, { ...subcollection, collectionId: parentCollectionId }, 'subcollection')}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, { ...subcollection, collectionId: parentCollectionId }, 'subcollection')}
        onDrop={(e) => handleDrop(e, { ...subcollection, collectionId: parentCollectionId }, 'subcollection')}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: parentIndex * 0.05 + 0.1 }}
      >
        <div
          className="subcollection-header"
          onClick={() => dispatch({ type: 'TOGGLE_EXPANDED_SUBCOLLECTION', payload: subcollection.id })}
        >
          <h4 className="subcollection-name">{subcollection.name}</h4>
          <span className="beatmaps-count">{beatmaps.length} beatmaps</span>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="subcollection-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {beatmaps.length > 0 && (
                <div
                  className="beatmaps-grid"
                  style={{
                    gridTemplateColumns: `repeat(${Math.max(1, columns - 1)}, 1fr)`,
                    gap: '12px',
                    padding: '12px'
                  }}
                >
                  {beatmaps.map((beatmap, idx) => renderBeatmapCard(beatmap, idx))}
                </div>
              )}
              
              {beatmaps.length === 0 && (
                <div className="empty-subcollection">
                  <p>No beatmaps in this subcollection</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }, [state, columns, dragOverItem, isLocked, handleDragStart, handleDragEnd, handleDragOver, handleDrop, dispatch, renderBeatmapCard, calculatePriority]);

  const beatmapsCount = isClient ? Object.keys(state.beatmaps || {}).length : 0;

  if (!isClient) {
    return <div className="loading-collections">Loading collections...</div>;
  }

  return (
    <NeonBorderBox className="advanced-user-collections-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title-section">
          <h2 className="panel-title">
            <Grid3X3 size={24} />
            Your Collections
          </h2>
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
          {/* Column Selector */}
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

          {/* Settings */}
          <motion.button
            className="settings-btn"
            onClick={() => setSettingsModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={20} />
          </motion.button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="panel-status">
        <div className="status-info">
          <span className="collections-count">
            {state.collections?.length || 0} collections
          </span>
          <span className="beatmaps-count">
            {beatmapsCount} total beatmaps
          </span>
          {authState.isAuthenticated && (
            <span className="user-info">
              Logged in as {authState.user?.username}
            </span>
          )}
        </div>
        
        {!isLocked && (
          <motion.span
            className="drag-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Drag and drop to reorganize
            </motion.div>
          </motion.span>
        )}
      </div>

      {/* Collections Container */}
      <div className="collections-container">
        {state.collections && state.collections.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {state.collections
              .sort((a, b) => {
                // System collections first
                if (a.isSystemCollection !== b.isSystemCollection) {
                  return a.isSystemCollection ? -1 : 1;
                }
                return (b.order || 0) - (a.order || 0);
              })
              .map((collection, index) => renderCollection(collection, index))}
          </AnimatePresence>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Grid3X3 size={64} />
            </div>
            <h3>No collections yet</h3>
            <p>Create your first collection to start organizing beatmaps</p>
            <motion.button
              className="create-collection-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                dispatch({
                  type: 'ADD_COLLECTION',
                  payload: { name: 'My First Collection' }
                });
              }}
            >
              <Plus size={20} />
              Create Collection
            </motion.button>
          </div>
        )}
      </div>

      {/* Modals */}
      <QuickAddModal
        isOpen={quickAddModalOpen}
        onClose={() => setQuickAddModalOpen(false)}
        beatmap={selectedBeatmap}
      />
      
      <AdvancedAddModal
        isOpen={advancedAddModalOpen}
        onClose={() => setAdvancedAddModalOpen(false)}
        beatmap={selectedBeatmap}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </NeonBorderBox>
  );
}
