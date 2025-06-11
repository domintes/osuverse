import { collectionsReducer } from './collectionsReducer';
import { beatmapsReducer } from './beatmapsReducer';
import { tagsReducer } from './tagsReducer';
import { uiReducer } from './uiReducer';

// Główny reducer łączący wszystkie funkcjonalności
export const rootReducer = (state, action) => {
  // Logowanie akcji do debugowania (opcjonalnie)
  // console.log('Action:', action.type, action.payload);
  
  // Separacja stanu na UI i dane
  const dataState = {
    collections: state.collections,
    beatmaps: state.beatmaps,
    beatmapsets: state.beatmapsets,
    tags: state.tags
  };
  
  const uiState = {
    expandedCollection: state.expandedCollection,
    expandedSubcollection: state.expandedSubcollection,
    editingCollectionId: state.editingCollectionId,
    editingSubcollectionId: state.editingSubcollectionId,
    editingName: state.editingName,
    errors: state.errors,
    validationStates: state.validationStates,
    showTagSelector: state.showTagSelector
  };
  
  // Aplikowanie reducerów w odpowiedniej kolejności
  const updatedDataState = tagsReducer(
    beatmapsReducer(
      collectionsReducer(dataState, action),
      action
    ),
    action
  );
  
  const updatedUIState = uiReducer(uiState, action);
  
  // Łączenie wyników
  return {
    ...updatedDataState,
    ...updatedUIState
  };
};
