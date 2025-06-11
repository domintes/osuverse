'use client';

import { useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { PlusCircle } from 'lucide-react';
import { collectionsReducerAtom } from '@/store/collectionsReducerAtom';
import { selectedTagsAtom } from '@/store/selectedTagsAtom';
import '../userCollectionsPanel.scss';
import '../userCollections.scss';
import NeonBorderBox from '../NeonBorderBox';
import AddBeatmapModal from '../BeatmapSearchResults/AddBeatmapModal';
import CollectionList from './CollectionList';
import GlobalFilterSortControls from './GlobalFilterSortControls';
import { useBeatmapSort } from './hooks/useBeatmapSort';
import { useBeatmapFilter } from './hooks/useBeatmapFilter';
import { validateCollectionName } from './utils/collectionUtils';

// Importujemy akcje
import { 
  addCollection, 
  removeCollection, 
  editCollection, 
  addSubcollection, 
  removeSubcollection, 
  editSubcollection,
  editBeatmap,
  removeBeatmap, 
  toggleFavorite 
} from '@/store/reducers/actions';

import {
  toggleExpandedCollection,
  toggleExpandedSubcollection,
  setEditingItem,
  clearEditingState,
  setValidationState
} from '@/store/reducers/uiActions';

/**
 * Główny komponent panelu kolekcji użytkownika
 */
export default function UserCollectionsPanel({ editMode }) {
  const [state, dispatch] = useAtom(collectionsReducerAtom);
  
  // Destrukturyzacja stanu
  const { 
    collections, beatmaps, beatmapsets, tags,
    expandedCollection, expandedSubcollection,
    editingCollectionId, editingSubcollectionId, editingName,
    errors, validationStates
  } = state;
  
  // Pobierz wybrane tagi z TagSections do filtrowania
  const [selectedTags] = useAtom(selectedTagsAtom);
  
  // Stan edytowania beatmapy
  const [editingBeatmap, setEditingBeatmap] = useState(null);
  
  // Importujemy hooki
  const { 
    sortMode, sortDirection, sortBeatmaps, 
    toggleSortMode, toggleSortDirection 
  } = useBeatmapSort();

  const {
    activeTags, showTagSelector, availableTags,
    filterBeatmapsByTags, toggleTagFilter, 
    setShowTagSelector, updateAvailableTags
  } = useBeatmapFilter();
  
  // Handler dodawania nowej kolekcji
  const handleAddCollection = useCallback(() => {
    const validation = validateCollectionName({ collections }, state.newCollectionName);
    dispatch(setValidationState('collection', null, validation.isValid, validation.message));
    
    if (validation.isValid) {
      dispatch(addCollection(state.newCollectionName));
      // Wyczyść pole formularza
      document.querySelector('.new-collection-input input').value = '';
    }
  }, [state.newCollectionName, collections, dispatch]);
  
  // Handler dodawania nowej podkolekcji
  const handleAddSubcollection = useCallback((collectionId) => {
    const subcollectionName = state.newSubcollectionNames?.[collectionId];
    const validation = validateCollectionName({ collections }, subcollectionName, collectionId);
    dispatch(setValidationState('subcollection', collectionId, validation.isValid, validation.message));
    
    if (validation.isValid) {
      dispatch(addSubcollection(collectionId, subcollectionName));
      // Wyczyść pole formularza
      document.querySelector(`[data-collection-id="${collectionId}"] .new-subcollection-input input`).value = '';
    }
  }, [state.newSubcollectionNames, collections, dispatch]);
  
  // Funkcja obsługująca zmianę nazwy kolekcji/podkolekcji
  const handleSaveEdit = useCallback(() => {
    if (editingCollectionId) {
      dispatch(editCollection(editingCollectionId, editingName));
    } else if (editingSubcollectionId) {
      // Znajdź kolekcję zawierającą edytowaną podkolekcję
      const collectionId = collections.find(c =>
        c.subcollections.some(s => s.id === editingSubcollectionId)
      )?.id;
      
      if (collectionId) {
        dispatch(editSubcollection(collectionId, editingSubcollectionId, editingName));
      }
    }
    
    dispatch(clearEditingState());
  }, [editingCollectionId, editingSubcollectionId, editingName, collections, dispatch]);
  
  // Funkcja obsługująca edycję beatmapy (tagów, kolekcji)
  const handleEditBeatmap = (beatmap) => {
    setEditingBeatmap(beatmap);
  };
  
  // Funkcja zapisująca zmiany w beatmapie
  const handleBeatmapEditSubmit = (formData) => {
    if (!editingBeatmap) return;
    dispatch(editBeatmap(editingBeatmap.id, formData));
    setEditingBeatmap(null);
  };
  
  // Obsługa naciśnięcia klawisza w polu formularza
  const handleCollectionInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      const newName = e.target.value;
      const validation = validateCollectionName({ collections }, newName);
      dispatch(setValidationState('collection', null, validation.isValid, validation.message));
      
      if (validation.isValid) {
        dispatch(addCollection(newName));
        e.target.value = '';
      }
    }
  };
  
  return (
    <NeonBorderBox className="user-collections-panel">
      <h2 className="panel-title collection-header-title">Yours Collection</h2>
      
      {/* Add new collection form */}
      {editMode && (
        <div className="add-collection-form">
          <div className="new-collection-input">
            <input
              type="text"
              placeholder="New collection..."
              onKeyDown={handleCollectionInputKeyPress}
            />
            <button
              className="add-collection-button"
              onClick={handleAddCollection}
              title="Add new collection"
            >
              <PlusCircle size={16} />
            </button>
          </div>
          
          {!validationStates.collection.isValid && (
            <div className="error-message">
              {validationStates.collection.message}
            </div>
          )}
        </div>
      )}
      
      {/* Global filter and sort controls */}
      <GlobalFilterSortControls
        sortMode={sortMode}
        sortDirection={sortDirection}
        showTagSelector={showTagSelector}
        availableTags={availableTags}
        activeTags={activeTags}
        onToggleSortMode={toggleSortMode}
        onToggleSortDirection={toggleSortDirection}
        onToggleTagSelector={() => setShowTagSelector(!showTagSelector)}
        onToggleTagFilter={toggleTagFilter}
        beatmapsCount={Object.keys(beatmaps || {}).length}
      />    
      
      {/* Lista kolekcji */}
      <CollectionList 
        collections={collections}
        editMode={editMode}
        expandedCollection={expandedCollection}
        expandedSubcollection={expandedSubcollection}
        editingCollectionId={editingCollectionId}
        editingSubcollectionId={editingSubcollectionId}
        editingName={editingName}
        errors={errors}
        validationStates={validationStates}
        sortMode={sortMode}
        sortDirection={sortDirection}
        showTagSelector={showTagSelector}
        availableTags={availableTags}
        activeTags={activeTags}
        globalTags={selectedTags}
        onToggleExpandCollection={(id) => dispatch(toggleExpandedCollection(id))}
        onToggleExpandSubcollection={(id) => dispatch(toggleExpandedSubcollection(id))}
        onEditCollection={(id, name) => dispatch(setEditingItem('collection', id, name))}
        onEditSubcollection={(id, name) => dispatch(setEditingItem('subcollection', id, name))}
        onEditingNameChange={(name) => setEditingName(name)}
        onSaveEdit={handleSaveEdit}
        onKeyPress={(e) => {
          if (e.key === 'Enter') handleSaveEdit();
          else if (e.key === 'Escape') dispatch(clearEditingState());
        }}
        onAddSubcollection={handleAddSubcollection}
        onRemoveCollection={(id) => dispatch(removeCollection(id))}
        onRemoveSubcollection={(collectionId, subcollectionId) => 
          dispatch(removeSubcollection(collectionId, subcollectionId))
        }
        onToggleSortMode={toggleSortMode}
        onToggleSortDirection={toggleSortDirection}
        onToggleTagSelector={() => setShowTagSelector(!showTagSelector)}
        onToggleTagFilter={toggleTagFilter}
        onEditBeatmap={handleEditBeatmap}
        onDeleteBeatmap={(id) => dispatch(removeBeatmap(id))}
        onToggleFavorite={(beatmap) => dispatch(toggleFavorite(beatmap))}
        sortBeatmaps={sortBeatmaps}
        filterBeatmapsByTags={filterBeatmapsByTags}
      />
      
      {/* Modal do edycji beatmap */}
      {editingBeatmap && (
        <AddBeatmapModal
          isOpen={!!editingBeatmap}
          onClose={() => setEditingBeatmap(null)}
          onSubmit={handleBeatmapEditSubmit}
          initialData={editingBeatmap}
          collections={collections}
          editMode={true}
        />
      )}
    </NeonBorderBox>
  );
}
