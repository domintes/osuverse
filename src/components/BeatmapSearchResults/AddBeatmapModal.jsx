'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { collectionsReducerAtom } from '@/store/collectionsReducerAtom';
import { addBeatmap, addCollection } from '@/store/reducers/actions';
import './addBeatmapModal.scss';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { findSystemCollection } from '@/components/UserCollections/utils/collectionUtils';

export default function AddBeatmapModal({ 
  isOpen, 
  onClose, 
  beatmapset, 
  beatmap = null, 
  onSubmit,
  initialTags = [],
  initialData = null,
  editMode = false,
  collections = []
}) {
  const [tags, setTags] = useState(
    initialTags.map(tag => typeof tag === 'string' ? { tag, tag_value: 0 } : tag)
  );
  const [notes, setNotes] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedSubcollection, setSelectedSubcollection] = useState(null);
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collectionNameError, setCollectionNameError] = useState('');
  const [tagInputError, setTagInputError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const tagInputRef = useRef(null);
  const [pendingNewCollectionName, setPendingNewCollectionName] = useState('');
  
  // Get collections and dispatch from the reducer atom
  const [state, dispatch] = useAtom(collectionsReducerAtom);

  const handleAddTag = () => {
    setTags([...tags, { tag: '', tag_value: 0 }]);
    // Focus on tag input after adding new tag
    setTimeout(() => {
      const tagInputs = document.querySelectorAll('.beatmap-modal-tag-input');
      const lastInput = tagInputs[tagInputs.length - 1];
      if (lastInput) {
        lastInput.focus();
      }
    }, 100);
  };

  const handleRemoveTag = (idx) => {
    setTags(prevTags => prevTags.filter((_, i) => i !== idx));
  };

  const handleTagChange = (idx, value) => {
    setTags(prevTags => 
      prevTags.map((tag, i) => 
        i === idx ? { ...tag, tag: value } : tag
      )
    );
  };

  const handleTagValueChange = (idx, value) => {
    const numValue = parseInt(value, 10) || 0;
    const clampedValue = Math.max(-5, Math.min(5, numValue));
    
    setTags(prevTags => 
      prevTags.map((tag, i) => 
        i === idx ? { ...tag, tag_value: clampedValue } : tag
      )
    );
  };  // Initialize with Unsorted collection or the first collection if none is selected
  useEffect(() => {
    if (!selectedCollection && state.collections.length > 0) {
      // Preferuj kolekcję Unsorted jako domyślną używając funkcji pomocniczej
      const unsortedCollection = findSystemCollection(state, 'Unsorted');
      if (unsortedCollection) {
        setSelectedCollection(unsortedCollection.id);
      } else {
        setSelectedCollection(state.collections[0].id);
      }
    }
  }, [state.collections, selectedCollection]);

  // Po dodaniu nowej kolekcji wybierz ją automatycznie
  useEffect(() => {
    if (pendingNewCollectionName && state.collections.length > 0) {
      const created = state.collections.find(
        c => c.name.trim().toLowerCase() === pendingNewCollectionName.trim().toLowerCase()
      );
      if (created) {
        setSelectedCollection(created.id);
        setSelectedSubcollection(null);
        setPendingNewCollectionName('');
      }
    }
  }, [pendingNewCollectionName, state.collections]);
  // Funkcja walidacji nazwy kolekcji
  const validateCollectionName = (name) => {
    if (!name.trim()) {
      return "Collection name cannot be empty";
    }
    
    if (state.collections.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) {
      return "Collection with this name already exists";
    }
    
    return "";
  };
  
  // Funkcja dodająca nową kolekcję
  const handleAddCollection = () => {
    const error = validateCollectionName(newCollectionName);
    if (error) {
      setCollectionNameError(error);
      return;
    }
    
    // Wywołujemy akcję dodania kolekcji; ID zostanie wygenerowane w reducerze
    const name = newCollectionName.trim();
    dispatch(addCollection(name));
    // Zaznacz do wyboru po zaktualizowaniu stanu
    setPendingNewCollectionName(name);
    setSelectedSubcollection(null);
    setNewCollectionName('');
    setShowNewCollectionInput(false);
    setCollectionNameError('');
  };  // Inicjalizacja danych z initialData (używane przy edycji)
  useEffect(() => {
    if (initialData && editMode) {
      // Ustaw tagi jeśli istnieją
      if (initialData.userTags) {
        setTags(initialData.userTags);
      }
      
      // Ustaw notatki jeśli istnieją
      if (initialData.notes) {
        setNotes(initialData.notes);
      }
      
      // Ustaw wybraną kolekcję
      if (initialData.collectionId) {
        setSelectedCollection(initialData.collectionId);
      }
      
      // Ustaw wybraną podkolekcję
      if (initialData.subcollectionId) {
        setSelectedSubcollection(initialData.subcollectionId);
      }
    }
  }, [initialData, editMode]);
    const handleSubmit = (e) => {
    e.preventDefault();
    
    // Walidacja: żaden z istniejących tagów nie może być pusty
    const firstEmptyIdx = tags.findIndex(tag => !tag.tag.trim());
    if (firstEmptyIdx !== -1) {
      setTagInputError("beatmap-modal-tag-input shouldn't be empty");
      // Ustaw fokus na pierwszym pustym polu tagu
      setTimeout(() => {
        const tagInputs = document.querySelectorAll('.beatmap-modal-tag-input');
        const target = tagInputs[firstEmptyIdx];
        if (target) target.focus();
      }, 0);
      return;
    }
    
    // Clear any previous errors
    setTagInputError('');
    
    // Znajdź konkretnie kolekcję "Unsorted" używając funkcji pomocniczej
    const unsortedCollection = findSystemCollection(state, 'Unsorted');
    // Use "Unsorted" collection if none is selected
    const collectionId = selectedCollection || unsortedCollection?.id;

    // Jeśli funkcja onSubmit została dostarczona, wywołaj ją (wsteczna kompatybilność)
    if (onSubmit) {
      onSubmit({ 
        tags, 
        notes, 
        collectionId, 
        subcollectionId: selectedSubcollection 
      });
    } else {
      // W przeciwnym razie użyj bezpośrednio reducera (obsłuż tylko pojedynczą beatmapę)
      if (beatmap) {
        const beatmap_priority = tags.reduce((sum, t) => sum + (parseInt(t.tag_value) || 0), 0);
        const beatmapData = {
          ...beatmap,
          setId: beatmapset.id,
          artist: beatmapset.artist,
          title: beatmapset.title,
          creator: beatmapset.creator,
          cover: beatmapset.covers?.cover || beatmapset.covers?.card,
          userTags: tags,
          notes,
          beatmap_priority,
          id: beatmap.id
        };
        dispatch(addBeatmap(beatmapData, collectionId, selectedSubcollection));
      } else {
        console.warn('AddBeatmapModal: onSubmit not provided and no single beatmap to add.');
      }
    }
    
    onClose();
  };

  // Automatycznie wygenerowane tagi (na podstawie beatmapy)
  const getAutoGeneratedTags = () => {
    if (!beatmapset) return [];
    
    const autoTags = [];
    
    // Artysta
    if (beatmapset.artist) {
      autoTags.push({ section: 'Artists', tag: beatmapset.artist });
    }
    
    // Mapper
    if (beatmapset.creator) {
      autoTags.push({ section: 'Mappers', tag: beatmapset.creator });
    }
    
    // Poziom trudności (tylko jeśli wybrany jest konkretny beatmap)
    if (beatmap) {
      let diffCategory = 'unknown';
      const stars = beatmap.difficulty_rating;
      
      if (stars < 4) diffCategory = 'normal: 0.00-3.99*';
      else if (stars < 5.5) diffCategory = 'casual: 4.00-5.49*';
      else if (stars < 6.7) diffCategory = 'expert: 5.50-6.69*';
      else if (stars < 8) diffCategory = 'extreme: 6.70-7.99*';
      else if (stars < 10) diffCategory = 'ultimate: 8.00-9.99*';
      else diffCategory = 'voidium: 10.00-infinity';
      
      autoTags.push({ section: 'Difficulty', tag: diffCategory });
    }
    
    return autoTags;
  };
  
  const autoGeneratedTags = getAutoGeneratedTags();

  // Funkcja do obsługi inputu tagu
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    
    // Clear any tag input errors when user starts typing
    if (tagInputError) {
      setTagInputError('');
    }
    
    if (value.trim()) {
      // Pobierz wszystkie tagi z kolekcji użytkownika jako sugestie
      const userTags = new Set();
      // Przejdź po wszystkich beatmapach z globalnego stanu
      Object.values(state.beatmaps || {}).forEach(beatmap => {
        if (beatmap?.userTags) {
          beatmap.userTags.forEach(tag => {
            if (typeof tag === 'string') {
              userTags.add(tag);
            } else if (tag?.tag) {
              userTags.add(tag.tag);
            }
          });
        }
      });
      
      // Filtruj sugestie zgodnie z wpisanym tekstem
      const filteredSuggestions = Array.from(userTags)
        .filter(tag => tag.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5); // Ogranicz do 5 sugestii
      
      setTagSuggestions(filteredSuggestions);
    } else {
      setTagSuggestions([]);
    }
  };

  // Funkcja do dodawania tagu z inputu
  const handleAddTagFromInput = (tagName) => {
    // Blokuj dodanie, jeśli istnieją puste wiersze tagów
    const emptyIdx = tags.findIndex(t => !t.tag.trim());
    if (emptyIdx !== -1) {
      setTagInputError("beatmap-modal-tag-input shouldn't be empty");
      setTimeout(() => {
        const tagInputs = document.querySelectorAll('.beatmap-modal-tag-input');
        const target = tagInputs[emptyIdx];
        if (target) target.focus();
      }, 0);
      return;
    }

    if (!tagName.trim()) {
      setTagInputError("beatmap-modal-tag-input shouldn't be empty");
      // Fokus na polu wejściowym tagu
      if (tagInputRef.current) tagInputRef.current.focus();
      return;
    }
    
    // Sprawdź czy tag już istnieje
    const tagExists = tags.some(t => 
      t.tag.toLowerCase() === tagName.trim().toLowerCase()
    );
    
    if (tagExists) {
      setTagInputError('This tag already exists');
      if (tagInputRef.current) tagInputRef.current.focus();
      return;
    }
    
    setTags([...tags, { tag: tagName.trim(), tag_value: 0 }]);
    
    // Wyczyść pole input i sugestie
    setTagInput('');
    setTagSuggestions([]);
    setTagInputError('');
    if (tagInputRef.current) tagInputRef.current.focus();
  };

  // Funkcja do obsługi klawisza Enter w polu tagu
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Zapobiega domyślnej akcji formularza
      handleAddTagFromInput(tagInput);
    }
  };

  if (!isOpen || !beatmapset) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="beatmap-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        // Remove onClick={onClose} to prevent closing on backdrop click
      >
        <motion.div 
          className="beatmap-modal-content"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="beatmap-modal-close" onClick={onClose}>×</button>
          
          <h2 className="beatmap-modal-title">
            Add to collection
          </h2>
          
          <div className="beatmap-modal-preview">
            <div 
              className="beatmap-modal-cover"
              style={{ 
                backgroundImage: `url(${beatmapset.covers?.cover || beatmapset.covers?.card || ''})` 
              }} 
            />
            <div className="beatmap-modal-info">
              <h3>{beatmapset.artist} - {beatmapset.title}</h3>
              <p>mapped by {beatmapset.creator}</p>
              {beatmap && (
                <p className="beatmap-modal-difficulty">
                  {beatmap.version} ({beatmap.difficulty_rating.toFixed(2)}★)
                </p>
              )}
            </div>
          </div>
            <form onSubmit={handleSubmit}>
            <div className="beatmap-modal-field">
              <label>Select Collection:</label>
              {!showNewCollectionInput ? (
                <div className="beatmap-modal-collections">
                  <select 
                    value={selectedCollection || ''} 
                    onChange={e => {
                      setSelectedCollection(e.target.value);
                      setSelectedSubcollection(null); // Reset subcollection when collection changes
                    }}
                    className="beatmap-modal-select"
                  >
                    {state.collections.map(collection => (
                      <option key={collection.id} value={collection.id}>{collection.name}</option>
                    ))}
                  </select>
                  
                  <button 
                    type="button"
                    className="beatmap-modal-new-collection-btn"
                    onClick={() => setShowNewCollectionInput(true)}
                  >
                    <PlusCircle size={16} /> New Collection
                  </button>
                </div>
              ) : (
                <div className="beatmap-modal-new-collection">
                  <input 
                    type="text"
                    value={newCollectionName}
                    onChange={e => setNewCollectionName(e.target.value)}
                    className="beatmap-modal-new-collection-input"
                    placeholder="Enter new collection name"
                    autoFocus
                  />
                  {collectionNameError && (
                    <div className="beatmap-modal-error">{collectionNameError}</div>
                  )}
                  <div className="beatmap-modal-new-collection-actions">
                    <button 
                      type="button"
                      className="beatmap-modal-new-collection-create"
                      onClick={handleAddCollection}
                    >
                      Create
                    </button>
                    <button 
                      type="button"
                      className="beatmap-modal-new-collection-cancel"
                      onClick={() => {
                        setShowNewCollectionInput(false);
                        setNewCollectionName('');
                        setCollectionNameError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
                
                {selectedCollection && !showNewCollectionInput &&
                  state.collections.find(c => c.id === selectedCollection)?.subcollections?.length > 0 && (
                  <div className="beatmap-modal-field">
                    <label>Select Subcollection (optional):</label>
                    <select
                      value={selectedSubcollection || ''}
                      onChange={e => setSelectedSubcollection(e.target.value || null)}
                      className="beatmap-modal-select"
                    >
                      <option value="">None (Add to main collection)</option>                      {state.collections
                        .find(c => c.id === selectedCollection)
                        .subcollections.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))
                      }
                    </select>
                  </div>
                )}
            </div>
              <div className="beatmap-modal-field">
              <label>Custom User Tags:</label>
              
              {/* Input dla nowych tagów z autouzupełnianiem */}
              <div className="beatmap-modal-tag-input-container">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add a tag and press Enter"
                  className="beatmap-modal-tag-input-field"
                  autoFocus={editMode} // Autofocus przy edycji
                  ref={tagInputRef}
                />
                <button 
                  type="button" 
                  onClick={() => handleAddTagFromInput(tagInput)}
                  className={`beatmap-modal-add-tag-btn${tagInputError ? ' error' : ''}`}
                >
                  + Add
                </button>
                
                {/* Error message for tag input */}
                {tagInputError && (
                  <div className="beatmap-modal-tag-error">
                    <span>{tagInputError}</span>
                    <button 
                      type="button" 
                      onClick={() => setTagInputError('')}
                      className="beatmap-modal-error-close"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              {/* Sugestie tagów */}
              {tagSuggestions.length > 0 && (
                <div className="beatmap-modal-tag-suggestions">
                  {tagSuggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="beatmap-modal-tag-suggestion"
                      onClick={() => {
                        handleAddTagFromInput(suggestion);
                        setTagInput('');
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Lista dodanych tagów */}
              <div className="beatmap-modal-tags">
                {tags.map((tag, idx) => (
                  <div className="beatmap-modal-tag-row" key={idx}>
                    <input 
                      type="text" 
                      value={tag.tag}
                      onChange={e => handleTagChange(idx, e.target.value)}
                      placeholder="Tag name" 
                      className="beatmap-modal-tag-input"
                    />
                    <div className="beatmap-modal-tag-value-container">
                      <input 
                        type="number" 
                        value={tag.tag_value}
                        onChange={e => handleTagValueChange(idx, e.target.value)}
                        className="beatmap-modal-tag-value" 
                        min="-5"
                        max="5"
                        title="Tag value (-5 to 5)"
                      />
                      <span className="beatmap-modal-tag-value-label">Priority</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(idx)}
                      className="beatmap-modal-tag-remove"
                      aria-label="Remove tag"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={handleAddTag}
                  className="beatmap-modal-add-tag"
                >
                  + Add Tag
                </button>
              </div>
            </div>
            
            <div className="beatmap-modal-field">
              <label htmlFor="beatmap-notes">Notes:</label>
              <textarea
                id="beatmap-notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="beatmap-modal-notes"
                placeholder="Add notes about this beatmap"
              />
            </div>
         
            <div className="beatmap-modal-actions">
              <button type="submit" className="beatmap-modal-submit">Save</button>
              <button type="button" className="beatmap-modal-cancel" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
