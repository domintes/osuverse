import { atom } from 'jotai';
import { atomWithReducer } from 'jotai/utils';
import { atomWithStorage } from 'jotai/utils';
import { rootReducer } from './reducers/rootReducer';

// Generate a stable UUID for the "Unsorted" collection
const UNSORTED_COLLECTION_ID = '00000000-0000-0000-0000-000000000000';
// Generate a stable UUID for the "Favorites" collection
const FAVORITES_COLLECTION_ID = '11111111-1111-1111-1111-111111111111';

// Stan początkowy
const initialState = {
  // Dane kolekcji
  collections: [
    {
      id: UNSORTED_COLLECTION_ID,
      name: 'Unsorted',
      order: -1, // Always show at the top
      isSystemCollection: true, // Mark as system collection that can't be deleted
      subcollections: []
    },
    {
      id: FAVORITES_COLLECTION_ID,
      name: 'Favorites',
      order: -2, // Show above Unsorted
      isSystemCollection: true, // Mark as system collection that can't be deleted
      subcollections: []
    }
  ],
  beatmapsets: {}, // beatmapset metadata
  beatmaps: {}, // beatmap metadata
  tags: {}, // For tag statistics and quick access
  
  // Stan UI
  expandedCollection: null,
  expandedSubcollection: null,
  editingCollectionId: null,
  editingSubcollectionId: null,
  editingName: '',
  errors: {},
  validationStates: {
    collection: { isValid: true, message: '' },
    subcollections: {}
  },
  showTagSelector: false
};

// Utwórz atom z persystencją używający reducera
export const collectionsReducerAtom = atomWithReducer(
  // Funkcja do załadowania początkowego stanu
  (() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('userCollections');
      if (savedState) {
        try {
          // Połącz zapisany stan z początkowym UI stanem
          return {
            ...JSON.parse(savedState),
            // Resetuj stan UI przy wczytaniu
            expandedCollection: null,
            expandedSubcollection: null,
            editingCollectionId: null,
            editingSubcollectionId: null,
            editingName: '',
            errors: {},
            validationStates: {
              collection: { isValid: true, message: '' },
              subcollections: {}
            },
            showTagSelector: false
          };
        } catch (error) {
          console.error('Error loading collections from localStorage:', error);
        }
      }
    }
    return initialState;
  })(),
  rootReducer
);

// Atom z persystencją do zachowania kompatybilności wstecznej
export const collectionsAtom = atom(
  (get) => get(collectionsReducerAtom),
  (get, set, newValue) => {
    // Jeśli otrzymujemy całkowity nowy stan, zastosuj go bezpośrednio
    if (typeof newValue === 'object' && newValue !== null) {
      set(collectionsReducerAtom, { type: 'SET_FULL_STATE', payload: newValue });
      
      // Zapisz do localStorage
      if (typeof window !== 'undefined') {
        const { 
          expandedCollection, expandedSubcollection, 
          editingCollectionId, editingSubcollectionId,
          editingName, errors, validationStates, showTagSelector,
          ...dataToSave
        } = newValue;
        
        localStorage.setItem('userCollections', JSON.stringify(dataToSave));
      }
    }
  }
);
