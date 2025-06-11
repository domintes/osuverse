'use client';

import { useAtom } from 'jotai';
import { collectionsReducerAtom } from '@/store/collectionsReducerAtom';
import {
  addCollection,
  removeCollection,
  editCollection,
  addSubcollection,
  removeSubcollection,
  editSubcollection,
  addBeatmap,
  removeBeatmap,
  editBeatmap,
  moveBeatmap,
  toggleFavorite
} from '@/store/reducers/actions';
import {
  toggleExpandedCollection,
  toggleExpandedSubcollection,
  setEditingItem,
  clearEditingState,
  setValidationState,
  clearErrors,
  setError,
  toggleTagSelector
} from '@/store/reducers/uiActions';
import { validateCollectionName } from '../utils/collectionUtils';

/**
 * Hook zarządzający stanem kolekcji z użyciem reducera
 * Zapewnia wszystkie akcje potrzebne do zarządzania kolekcjami, podkolekcjami i beatmapami
 */
export function useCollectionsReducer() {
  const [state, dispatch] = useAtom(collectionsReducerAtom);
  
  // Funkcje zarządzania kolekcjami
  const handleAddCollection = (name) => {
    const validation = validateCollectionName(state, name);
    if (!validation.isValid) {
      dispatch(setValidationState('collection', null, false, validation.message));
      return false;
    }
    
    dispatch(addCollection(name));
    dispatch(setValidationState('collection', null, true, ''));
    return true;
  };
  
  const handleRemoveCollection = (collectionId) => {
    dispatch(removeCollection(collectionId));
  };
  
  const handleEditCollection = (collectionId, name) => {
    dispatch(setEditingItem('collection', collectionId, name));
  };
  
  const handleSaveEdit = () => {
    if (state.editingCollectionId) {
      dispatch(editCollection(state.editingCollectionId, state.editingName));
    } else if (state.editingSubcollectionId) {
      // Znajdź kolekcję zawierającą tę podkolekcję
      const parentCollection = state.collections.find(collection => 
        collection.subcollections.some(sub => sub.id === state.editingSubcollectionId)
      );
      
      if (parentCollection) {
        dispatch(editSubcollection(parentCollection.id, state.editingSubcollectionId, state.editingName));
      }
    }
    
    dispatch(clearEditingState());
  };
  
  // Funkcje zarządzania podkolekcjami
  const handleAddSubcollection = (collectionId, name) => {
    const validation = validateCollectionName(state, name, collectionId);
    if (!validation.isValid) {
      dispatch(setValidationState('subcollection', collectionId, false, validation.message));
      return false;
    }
    
    dispatch(addSubcollection(collectionId, name));
    dispatch(setValidationState('subcollection', collectionId, true, ''));
    return true;
  };
  
  const handleRemoveSubcollection = (collectionId, subcollectionId) => {
    dispatch(removeSubcollection(collectionId, subcollectionId));
  };
  
  const handleEditSubcollection = (subcollectionId, name) => {
    dispatch(setEditingItem('subcollection', subcollectionId, name));
  };
  
  // Funkcje zarządzania beatmapami
  const handleEditBeatmap = (beatmapId, formData) => {
    dispatch(editBeatmap(beatmapId, formData));
  };
  
  const handleRemoveBeatmap = (beatmapId) => {
    dispatch(removeBeatmap(beatmapId));
  };
  
  const handleMoveBeatmap = (beatmapId, toCollectionId, toSubcollectionId) => {
    dispatch(moveBeatmap(beatmapId, toCollectionId, toSubcollectionId));
  };
  
  const handleToggleFavorite = (beatmap) => {
    dispatch(toggleFavorite(beatmap));
  };
  
  // Funkcje zarządzania UI
  const handleToggleExpandCollection = (collectionId) => {
    dispatch(toggleExpandedCollection(collectionId));
  };
  
  const handleToggleExpandSubcollection = (subcollectionId) => {
    dispatch(toggleExpandedSubcollection(subcollectionId));
  };
  
  const handleToggleTagSelector = (isVisible) => {
    dispatch(toggleTagSelector(isVisible));
  };
  
  const handleEditingNameChange = (name) => {
    // W oryginalnym kodzie aktualizujemy stan bez dispatchowania akcji
    // Tutaj możemy stworzyć akcję SET_EDITING_NAME lub zaktualizować SET_EDITING_ITEM
    dispatch(setEditingItem(
      state.editingCollectionId ? 'collection' : 'subcollection',
      state.editingCollectionId || state.editingSubcollectionId,
      name
    ));
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      dispatch(clearEditingState());
    }
  };
  
  return {
    // Stan
    state,
    collections: state.collections,
    beatmaps: state.beatmaps,
    expandedCollection: state.expandedCollection,
    expandedSubcollection: state.expandedSubcollection,
    editingCollectionId: state.editingCollectionId,
    editingSubcollectionId: state.editingSubcollectionId,
    editingName: state.editingName,
    errors: state.errors,
    validationStates: state.validationStates,
    showTagSelector: state.showTagSelector,
    
    // Akcje
    addCollection: handleAddCollection,
    removeCollection: handleRemoveCollection,
    editCollection: handleEditCollection,
    saveEdit: handleSaveEdit,
    
    addSubcollection: handleAddSubcollection,
    removeSubcollection: handleRemoveSubcollection,
    editSubcollection: handleEditSubcollection,
    
    editBeatmap: handleEditBeatmap,
    removeBeatmap: handleRemoveBeatmap,
    moveBeatmap: handleMoveBeatmap,
    toggleFavorite: handleToggleFavorite,
    
    toggleExpandCollection: handleToggleExpandCollection,
    toggleExpandSubcollection: handleToggleExpandSubcollection,
    toggleTagSelector: handleToggleTagSelector,
    
    editingNameChange: handleEditingNameChange,
    keyPress: handleKeyPress,
    
    // Bezpośredni dostęp do dispatchera (w razie potrzeby)
    dispatch
  };
}
