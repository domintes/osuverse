'use client';

import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { selectedTagsAtom } from '@/store/selectedTagsAtom';
import { useBeatmapSort } from './UserCollections/hooks/useBeatmapSort';
import { useBeatmapFilter } from './UserCollections/hooks/useBeatmapFilter';
import { useCollectionDragDrop } from './UserCollections/hooks/useCollectionDragDrop';
import { useCollectionsReducer } from './UserCollections/hooks/useCollectionsReducer';
import { getBeatmapsForCollection } from './UserCollections/utils/collectionUtils';
import AddBeatmapModal from './BeatmapSearchResults/AddBeatmapModal';
import CollectionsList from './UserCollections/CollectionsList';
import AddCollectionForm from './UserCollections/AddCollectionForm';
import GlobalFilterSortControls from './UserCollections/GlobalFilterSortControls';

import './userCollectionsPanel.scss';
import './userCollections.scss';

/**
 * Główny kontener komponentu panelu kolekcji użytkownika
 * Zarządza stanem globalnym i przepływem danych między komponentami
 */
export default function UserCollectionsPanelContainer({ editMode }) {
  const collectionsState = useCollectionsReducer();
  const [selectedTags] = useAtom(selectedTagsAtom);
  
  // Lokalne stany
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newSubcollectionNames, setNewSubcollectionNames] = useState({});
  const [editingBeatmap, setEditingBeatmap] = useState(null);
  const [highlightedBeatmapId, setHighlightedBeatmapId] = useState(null);
  
  // Referencja do beatmapy, która ma być przewinięta do widoku
  const beatmapRef = useRef({});
  
  // Importowanie hooków
  const { 
    sortMode, sortDirection, sortBeatmaps, 
    toggleSortMode, toggleSortDirection 
  } = useBeatmapSort();

  const {
    activeTags, showTagSelector, availableTags,
    filterBeatmapsByTags, toggleTagFilter, 
    setShowTagSelector, updateAvailableTags
  } = useBeatmapFilter();
  
  const {
    draggedItem, draggedSubcollection, dragOverCollectionId, errors: dragErrors,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    handleSubcollectionDragStart, handleSubcollectionDragOver
  } = useCollectionDragDrop();
  
  // Efekt do obsługi automatycznego przewijania do beatmapy z wyszukiwania
  useEffect(() => {
    const scrollToBeatmapId = localStorage.getItem('scrollToBeatmapId');
    if (!scrollToBeatmapId || !collectionsState.beatmaps) return;
    
    // Znajdź beatmapę w kolekcjach
    const beatmapToFind = collectionsState.beatmaps[scrollToBeatmapId];
    if (!beatmapToFind) return;
    
    // Ustaw podświetlenie dla znalezionej beatmapy
    setHighlightedBeatmapId(scrollToBeatmapId);
    
    // Rozwiń odpowiednią kolekcję
    if (beatmapToFind.collectionId) {
      collectionsState.toggleExpandCollection(beatmapToFind.collectionId);
      
      // Jeśli beatmapa jest w podkolekcji, rozwiń ją również
      if (beatmapToFind.subcollectionId) {
        collectionsState.toggleExpandSubcollection(beatmapToFind.subcollectionId);
      }
      
      // Używamy timeoutu, aby dać czas na wyrenderowanie komponentów
      setTimeout(() => {
        const beatmapElement = document.getElementById(`beatmap-${scrollToBeatmapId}`);
        if (beatmapElement) {
          // Przewiń do znalezionej beatmapy z animacją
          beatmapElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          
          // Dodaj animację podświetlającą
          beatmapElement.classList.add('highlighted-beatmap');
          
          // Usuń animację po 5 sekundach
          setTimeout(() => {
            beatmapElement.classList.remove('highlighted-beatmap');
          }, 5000);
        }
      }, 500);
    }
    
    // Wyczyść localStorage po znalezieniu beatmapy
    localStorage.removeItem('scrollToBeatmapId');
  }, [collectionsState.beatmaps]);
  
  // Funkcja obsługująca edycję beatmapy (tagów)
  const handleEditBeatmap = (beatmap) => {
    setEditingBeatmap(beatmap);
  };

  // Funkcja zapisująca zmiany w beatmapie
  const handleBeatmapEditSubmit = (formData) => {
    if (!editingBeatmap) return;
    collectionsState.editBeatmap(editingBeatmap.id, formData);
    setEditingBeatmap(null);
  };
  
  // Funkcja do obsługi dodania nowej kolekcji
  const handleAddCollection = () => {
    const success = collectionsState.addCollection(newCollectionName);
    if (success) {
      setNewCollectionName('');
    }
  };
  
  // Funkcja do obsługi dodania nowej podkolekcji
  const handleAddSubcollection = (collectionId) => {
    const subcollectionName = newSubcollectionNames[collectionId];
    const success = collectionsState.addSubcollection(collectionId, subcollectionName);
    if (success) {
      setNewSubcollectionNames(prev => ({ ...prev, [collectionId]: '' }));
    }
  };
  
  // Obsługa zmiany nazwy podkolekcji
  const handleNewSubcollectionNameChange = (id, value) => {
    setNewSubcollectionNames(prev => ({ ...prev, [id]: value }));
  };
  
  // Obsługa naciśnięcia klawisza w polu nazwy nowej kolekcji
  const handleCollectionInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      const success = collectionsState.addCollection(newCollectionName);
      if (success) {
        setNewCollectionName('');
      }
    }
  };
  
  // Obsługa naciśnięcia klawisza w polu nazwy nowej podkolekcji
  const handleSubcollectionInputKeyPress = (e, collectionId) => {
    if (e.key === 'Enter') {
      const name = newSubcollectionNames[collectionId] || '';
      const success = collectionsState.addSubcollection(collectionId, name);
      if (success) {
        setNewSubcollectionNames(prev => ({ ...prev, [collectionId]: '' }));
      }
    }
  };
  
  // Aktualizacja dostępnych tagów po rozwinięciu kolekcji
  const handleToggleExpandCollection = (collectionId) => {
    collectionsState.toggleExpandCollection(collectionId);
    
    // Pobierz dostępne tagi dla kolekcji
    const beatmaps = getBeatmapsForCollection(collectionsState, collectionId);
    updateAvailableTags(beatmaps);
  };
  
  // Aktualizacja dostępnych tagów po rozwinięciu podkolekcji
  const handleToggleExpandSubcollection = (subcollectionId) => {
    collectionsState.toggleExpandSubcollection(subcollectionId);
    
    // Pobierz dostępne tagi dla podkolekcji
    if (collectionsState.expandedCollection) {
      const beatmaps = getBeatmapsForCollection(collectionsState, collectionsState.expandedCollection, subcollectionId);
      updateAvailableTags(beatmaps);
    }
  };

  return (
    <div className="user-collections-panel tag-sections-style">
      <h2 className="panel-title collection-header-title tag-sections-title">Your Collections</h2>
      
      {/* Add new collection form */}
      {editMode && (
        <AddCollectionForm
          newCollectionName={newCollectionName}
          onNewCollectionNameChange={setNewCollectionName}
          onKeyPress={handleCollectionInputKeyPress}
          onAddCollection={handleAddCollection}
          validationState={collectionsState.validationStates.collection}
        />
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
        beatmapsCount={Object.keys(collectionsState.beatmaps || {}).length}
      />    
      
      {/* Lista kolekcji */}
      <CollectionsList 
        collections={collectionsState.collections}
        collectionsState={collectionsState}
        editMode={editMode}
        expandedCollection={collectionsState.expandedCollection}
        expandedSubcollection={collectionsState.expandedSubcollection}
        editingCollectionId={collectionsState.editingCollectionId}
        editingSubcollectionId={collectionsState.editingSubcollectionId}
        editingName={collectionsState.editingName}
        errors={{...collectionsState.errors, ...dragErrors}}
        validationStates={collectionsState.validationStates}
        newSubcollectionNames={newSubcollectionNames}
        sortMode={sortMode}
        sortDirection={sortDirection}
        showTagSelector={showTagSelector}
        availableTags={availableTags}
        activeTags={activeTags}
        globalTags={selectedTags}
        dragOverCollectionId={dragOverCollectionId}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onSubcollectionDragStart={handleSubcollectionDragStart}
        onSubcollectionDragOver={handleSubcollectionDragOver}
        onEditCollection={collectionsState.editCollection}
        onEditSubcollection={collectionsState.editSubcollection}
        onEditingNameChange={collectionsState.editingNameChange}
        onKeyPress={collectionsState.keyPress}
        onSaveEdit={collectionsState.saveEdit}
        onNewSubcollectionNameChange={handleNewSubcollectionNameChange}
        onSubcollectionInputKeyPress={handleSubcollectionInputKeyPress}
        onAddSubcollection={handleAddSubcollection}
        onRemoveCollection={collectionsState.removeCollection}
        onRemoveSubcollection={collectionsState.removeSubcollection}
        onToggleExpandCollection={handleToggleExpandCollection}
        onToggleExpandSubcollection={handleToggleExpandSubcollection}
        onToggleSortMode={toggleSortMode}
        onToggleSortDirection={toggleSortDirection}
        onToggleTagSelector={setShowTagSelector}
        onToggleTagFilter={toggleTagFilter}
        onEditBeatmap={handleEditBeatmap}
        onDeleteBeatmap={collectionsState.removeBeatmap}
        onToggleFavorite={collectionsState.toggleFavorite}
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
          collections={collectionsState.collections}
          editMode={true}
        />
      )}
    </div>
  );
}
