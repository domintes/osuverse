'use client';

import React, { useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { collectionsReducerAtom } from '@/store/collectionsReducerAtom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Folder } from 'lucide-react';
import './quickAddModal.scss';

/**
 * Quick Add Modal - szybkie dodawanie beatmap do kolekcji
 * 
 * Features:
 * - Lista wszystkich kolekcji i podkolekcji
 * - Możliwość tworzenia nowej kolekcji
 * - Minimalistyczny design z dark purple theme
 * - Neon pink accents
 * - Szybkie akcje bez dodatkowych tagów
 */
export default function QuickAddModal({ isOpen, onClose, beatmap }) {
  const [state, dispatch] = useAtom(collectionsReducerAtom);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleAddToCollection = useCallback((collectionId, subcollectionId = null) => {
    if (!beatmap) return;

    dispatch({
      type: 'ADD_BEATMAP',
      payload: {
        beatmapData: beatmap,
        collectionId,
        subcollectionId,
        userTags: [] // Quick add nie dodaje tagów
      }
    });

    onClose();
  }, [beatmap, dispatch, onClose]);

  const handleCreateCollection = useCallback(() => {
    if (!newCollectionName.trim()) return;

    const newCollectionId = crypto.randomUUID();
    dispatch({
      type: 'ADD_COLLECTION',
      payload: {
        id: newCollectionId,
        name: newCollectionName.trim()
      }
    });

    // Dodaj beatmapę do nowej kolekcji
    if (beatmap) {
      handleAddToCollection(newCollectionId);
    }

    setNewCollectionName('');
    setShowCreateForm(false);
  }, [newCollectionName, dispatch, beatmap, handleAddToCollection]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleCreateCollection();
    }
  }, [handleCreateCollection]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="quick-add-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="quick-add-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title">
              <Plus size={20} />
              Quick Add to Collection
            </div>
            <motion.button
              className="close-btn"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Beatmap Info */}
          {beatmap && (
            <div className="beatmap-preview">
              <div className="beatmap-cover">
                <img
                  src={beatmap.covers?.card || beatmap.covers?.list || '/default-beatmap-cover.jpg'}
                  alt={`${beatmap.artist} - ${beatmap.title}`}
                  onError={(e) => {
                    e.target.src = '/default-beatmap-cover.jpg';
                  }}
                />
              </div>
              <div className="beatmap-info">
                <div className="beatmap-title">
                  {beatmap.artist} - {beatmap.title}
                </div>
                <div className="beatmap-creator">
                  by {beatmap.creator}
                </div>
              </div>
            </div>
          )}

          {/* Collections List */}
          <div className="collections-list">
            {state.collections
              ?.filter(c => !c.isSystemCollection || c.name === 'Favorites')
              ?.map((collection) => (
                <div key={collection.id} className="collection-group">
                  {/* Main Collection */}
                  <motion.div
                    className={`collection-item ${collection.isSystemCollection ? 'system' : ''}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCollection(collection.id)}
                  >
                    <div className="collection-icon">
                      <Folder size={16} />
                    </div>
                    <div className="collection-name">
                      {collection.name}
                    </div>
                    <div className="collection-count">
                      {Object.values(state.beatmaps || {})
                        .filter(b => b.collectionId === collection.id).length}
                    </div>
                  </motion.div>

                  {/* Subcollections */}
                  {collection.subcollections?.map((subcollection) => (
                    <motion.div
                      key={subcollection.id}
                      className="subcollection-item"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddToCollection(collection.id, subcollection.id)}
                    >
                      <div className="subcollection-icon">
                        <div className="subcollection-line" />
                        <Folder size={14} />
                      </div>
                      <div className="subcollection-name">
                        {subcollection.name}
                      </div>
                      <div className="subcollection-count">
                        {Object.values(state.beatmaps || {})
                          .filter(b => 
                            b.collectionId === collection.id && 
                            b.subcollectionId === subcollection.id
                          ).length}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
          </div>

          {/* Create New Collection */}
          <div className="create-collection-section">
            {!showCreateForm ? (
              <motion.button
                className="create-new-btn"
                onClick={() => setShowCreateForm(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} />
                Create New Collection
              </motion.button>
            ) : (
              <motion.div
                className="create-form"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <input
                  type="text"
                  placeholder="Collection name..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                  className="collection-name-input"
                />
                <div className="form-actions">
                  <motion.button
                    className="create-btn"
                    onClick={handleCreateCollection}
                    disabled={!newCollectionName.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check size={16} />
                    Create
                  </motion.button>
                  <motion.button
                    className="cancel-btn"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewCollectionName('');
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={16} />
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
