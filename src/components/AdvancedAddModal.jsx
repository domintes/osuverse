'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useAtom } from 'jotai';
import { collectionsReducerAtom } from '@/store/collectionsReducerAtom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Folder, Tag, Star, Hash, Save, Trash2 } from 'lucide-react';
import './advancedAddModal.scss';

/**
 * Advanced Add Modal - zaawansowane dodawanie beatmap z tagami i priorytetami
 * 
 * Features:
 * - Wybór kolekcji i podkolekcji
 * - System user tagów z prioritetami (-3 do +3)
 * - Auto-generated tags preview
 * - Tworzenie nowych kolekcji
 * - Pin i favorite toggles
 * - Notatki użytkownika
 */
export default function AdvancedAddModal({ isOpen, onClose, beatmap }) {
  const [state, dispatch] = useAtom(collectionsReducerAtom);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [selectedSubcollectionId, setSelectedSubcollectionId] = useState('');
  const [userTags, setUserTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagPriority, setNewTagPriority] = useState(0);
  const [notes, setNotes] = useState('');
  const [pinned, setPinned] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [showAutoTags, setShowAutoTags] = useState(true);

  // Auto-generated tags
  const autoTags = useMemo(() => {
    if (!beatmap) return [];

    const tags = [];
    if (beatmap.artist) tags.push(`artist:${beatmap.artist}`);
    if (beatmap.difficulty_rating) {
      const diff = beatmap.difficulty_rating;
      if (diff < 2) tags.push('difficulty:easy');
      else if (diff < 4) tags.push('difficulty:normal');
      else if (diff < 6) tags.push('difficulty:hard');
      else if (diff < 8) tags.push('difficulty:insane');
      else tags.push('difficulty:expert');
    }
    if (beatmap.ar) tags.push(`ar:${Math.round(beatmap.ar)}`);
    if (beatmap.cs) tags.push(`cs:${Math.round(beatmap.cs)}`);
    if (beatmap.od) tags.push(`od:${Math.round(beatmap.od)}`);
    if (beatmap.hp) tags.push(`hp:${Math.round(beatmap.hp)}`);
    
    // Status tag
    if (beatmap.ranked_date) tags.push('status:ranked');
    else if (beatmap.approved_date) tags.push('status:approved');
    else tags.push('status:unranked');

    return tags;
  }, [beatmap]);

  // Calculate total priority
  const totalPriority = useMemo(() => {
    return userTags.reduce((sum, tag) => sum + (tag.priority || 0), 0);
  }, [userTags]);

  // Handle add tag
  const handleAddTag = useCallback(() => {
    if (!newTagName.trim()) return;

    const newTag = {
      id: crypto.randomUUID(),
      tag: newTagName.trim(),
      tag_value: newTagPriority
    };

    setUserTags(prev => [...prev, newTag]);
    setNewTagName('');
    setNewTagPriority(0);
  }, [newTagName, newTagPriority]);

  // Handle remove tag
  const handleRemoveTag = useCallback((tagId) => {
    setUserTags(prev => prev.filter(tag => tag.id !== tagId));
  }, []);

  // Handle tag priority change
  const handleTagPriorityChange = useCallback((tagId, priority) => {
    setUserTags(prev => prev.map(tag =>
      tag.id === tagId ? { ...tag, tag_value: priority } : tag
    ));
  }, []);

  // Handle add to collection
  const handleAddToCollection = useCallback(() => {
    if (!selectedCollectionId || !beatmap) return;

    dispatch({
      type: 'ADD_BEATMAP',
      payload: {
        beatmapData: {
          ...beatmap,
          userTags,
          notes,
          pinned,
          favorite
        },
        collectionId: selectedCollectionId,
        subcollectionId: selectedSubcollectionId || null
      }
    });

    // Add to favorites if marked as favorite
    if (favorite) {
      const favoritesCollection = state.collections.find(c => 
        c.isSystemCollection && c.name === 'Favorites'
      );
      if (favoritesCollection) {
        dispatch({
          type: 'ADD_BEATMAP',
          payload: {
            beatmapData: {
              ...beatmap,
              userTags,
              notes,
              pinned: false, // Don't pin in favorites automatically
              favorite: true
            },
            collectionId: favoritesCollection.id
          }
        });
      }
    }

    onClose();
  }, [selectedCollectionId, selectedSubcollectionId, beatmap, userTags, notes, pinned, favorite, state.collections, dispatch, onClose]);

  const selectedCollection = state.collections?.find(c => c.id === selectedCollectionId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="advanced-add-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="advanced-add-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title">
              <Tag size={20} />
              Add to Collection
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

          {/* Content */}
          <div className="modal-content">
            {/* Beatmap Info */}
            {beatmap && (
              <div className="beatmap-preview">
                <div className="beatmap-cover">
                  <img
                    src={beatmap.covers?.card || '/default-beatmap-cover.jpg'}
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
                  <div className="beatmap-stats">
                    <span className="difficulty">
                      {beatmap.difficulty_rating?.toFixed(2)}★
                    </span>
                    <span className="version">
                      [{beatmap.version}]
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Collection Selection */}
            <div className="section">
              <h3 className="section-title">
                <Folder size={16} />
                Select Collection
              </h3>
              
              <div className="collection-selector">
                <select
                  value={selectedCollectionId}
                  onChange={(e) => {
                    setSelectedCollectionId(e.target.value);
                    setSelectedSubcollectionId('');
                  }}
                  className="collection-select"
                >
                  <option value="">Choose collection...</option>
                  {state.collections
                    ?.filter(c => !c.isSystemCollection || c.name === 'Favorites')
                    ?.map(collection => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name} ({Object.values(state.beatmaps || {})
                          .filter(b => b.collectionId === collection.id).length} beatmaps)
                      </option>
                    ))}
                </select>

                {selectedCollection?.subcollections?.length > 0 && (
                  <select
                    value={selectedSubcollectionId}
                    onChange={(e) => setSelectedSubcollectionId(e.target.value)}
                    className="subcollection-select"
                  >
                    <option value="">Main collection</option>
                    {selectedCollection.subcollections.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({Object.values(state.beatmaps || {})
                          .filter(b => 
                            b.collectionId === selectedCollectionId && 
                            b.subcollectionId === sub.id
                          ).length} beatmaps)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section">
              <h3 className="section-title">Quick Actions</h3>
              <div className="quick-actions">
                <motion.label
                  className={`quick-action ${pinned ? 'active' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    hidden
                  />
                  <Star size={16} />
                  Pin in Collection
                </motion.label>

                <motion.label
                  className={`quick-action ${favorite ? 'active' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="checkbox"
                    checked={favorite}
                    onChange={(e) => setFavorite(e.target.checked)}
                    hidden
                  />
                  <Plus size={16} />
                  Add to Favorites
                </motion.label>
              </div>
            </div>

            {/* User Tags */}
            <div className="section">
              <h3 className="section-title">
                <Tag size={16} />
                User Tags
                <div className="priority-display">
                  Total Priority: 
                  <span className={`priority-value ${totalPriority > 0 ? 'positive' : totalPriority < 0 ? 'negative' : 'neutral'}`}>
                    {totalPriority > 0 ? '+' : ''}{totalPriority}
                  </span>
                </div>
              </h3>

              {/* Existing Tags */}
              {userTags.length > 0 && (
                <div className="user-tags-list">
                  {userTags.map(tag => (
                    <div key={tag.id} className="user-tag-item">
                      <span className="tag-name">#{tag.tag}</span>
                      <div className="tag-controls">
                        <select
                          value={tag.tag_value}
                          onChange={(e) => handleTagPriorityChange(tag.id, parseInt(e.target.value))}
                          className="priority-select"
                        >
                          <option value={-3}>-3</option>
                          <option value={-2}>-2</option>
                          <option value={-1}>-1</option>
                          <option value={0}>0</option>
                          <option value={1}>+1</option>
                          <option value={2}>+2</option>
                          <option value={3}>+3</option>
                        </select>
                        <motion.button
                          className="remove-tag-btn"
                          onClick={() => handleRemoveTag(tag.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={12} />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Tag */}
              <div className="add-tag-form">
                <div className="tag-input-group">
                  <Hash size={16} />
                  <input
                    type="text"
                    placeholder="Enter tag name..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="tag-name-input"
                  />
                </div>
                <select
                  value={newTagPriority}
                  onChange={(e) => setNewTagPriority(parseInt(e.target.value))}
                  className="priority-select"
                >
                  <option value={-3}>-3</option>
                  <option value={-2}>-2</option>
                  <option value={-1}>-1</option>
                  <option value={0}>0</option>
                  <option value={1}>+1</option>
                  <option value={2}>+2</option>
                  <option value={3}>+3</option>
                </select>
                <motion.button
                  className="add-tag-btn"
                  onClick={handleAddTag}
                  disabled={!newTagName.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={16} />
                  Add
                </motion.button>
              </div>
            </div>

            {/* Auto Tags Preview */}
            {showAutoTags && autoTags.length > 0 && (
              <div className="section">
                <h3 className="section-title">
                  Auto-Generated Tags
                  <button
                    className="toggle-auto-tags"
                    onClick={() => setShowAutoTags(false)}
                  >
                    Hide
                  </button>
                </h3>
                <div className="auto-tags-preview">
                  {autoTags.map((tag, index) => (
                    <span key={index} className="auto-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="section">
              <h3 className="section-title">Notes (Optional)</h3>
              <textarea
                placeholder="Add your notes about this beatmap..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="notes-input"
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <motion.button
              className="cancel-btn"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              className="save-btn"
              onClick={handleAddToCollection}
              disabled={!selectedCollectionId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save size={16} />
              Add to Collection
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
