import { 
  ADD_COLLECTION, 
  REMOVE_COLLECTION, 
  EDIT_COLLECTION, 
  REORDER_COLLECTIONS,
  ADD_SUBCOLLECTION,
  REMOVE_SUBCOLLECTION,
  EDIT_SUBCOLLECTION,
  REORDER_SUBCOLLECTIONS,
  MOVE_SUBCOLLECTION,
  ADD_SYSTEM_COLLECTION,
  TOGGLE_EXPANDED_COLLECTION,
  TOGGLE_EXPANDED_SUBCOLLECTION
} from './actions';

export const collectionsReducer = (state, action) => {
  switch (action.type) {
    case ADD_COLLECTION: {
      const { name } = action.payload;
      if (!name.trim()) return state;
      
      return {
        ...state,
        collections: [...state.collections, {
          id: crypto.randomUUID(),
          name: name.trim(),
          order: state.collections.length,
          subcollections: []
        }]
      };
    }
    
    case REMOVE_COLLECTION: {
      const { collectionId } = action.payload;
      
      // Sprawdź, czy to kolekcja systemowa - nie usuwaj
      const collection = state.collections.find(c => c.id === collectionId);
      if (collection?.isSystemCollection) return state;
      
      return {
        ...state,
        collections: state.collections.filter(c => c.id !== collectionId)
      };
    }
    
    case EDIT_COLLECTION: {
      const { collectionId, name } = action.payload;
      
      return {
        ...state,
        collections: state.collections.map(c =>
          c.id === collectionId ? { ...c, name } : c
        )
      };
    }
    
    case REORDER_COLLECTIONS: {
      const { draggedId, targetId, mouseY } = action.payload;
      
      const newCollections = [...state.collections];
      const draggedIndex = newCollections.findIndex(c => c.id === draggedId);
      const targetIndex = newCollections.findIndex(c => c.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return state;

      // Pobierz pozycję elementu docelowego
      const targetElement = document.querySelector(`[data-collection-id="${targetId}"]`);
      if (!targetElement) return state;

      const targetRect = targetElement.getBoundingClientRect();
      const targetCenter = targetRect.top + targetRect.height / 2;

      // Reorderuj tylko jeśli mysz jest powyżej/poniżej środka, zależnie od kierunku
      const shouldReorder = draggedIndex < targetIndex ?
        mouseY > targetCenter :
        mouseY < targetCenter;

      if (!shouldReorder) return state;

      const [removed] = newCollections.splice(draggedIndex, 1);
      newCollections.splice(targetIndex, 0, removed);

      return {
        ...state,
        collections: newCollections.map((c, index) => ({
          ...c,
          order: index
        }))
      };
    }
    
    case ADD_SUBCOLLECTION: {
      const { collectionId, name } = action.payload;
      if (!name?.trim()) return state;
      
      return {
        ...state,
        collections: state.collections.map(collection => {
          if (collection.id === collectionId) {
            return {
              ...collection,
              subcollections: [...collection.subcollections, {
                id: crypto.randomUUID(),
                name: name.trim(),
                order: collection.subcollections.length
              }]
            };
          }
          return collection;
        })
      };
    }
    
    case REMOVE_SUBCOLLECTION: {
      const { collectionId, subcollectionId } = action.payload;
      
      return {
        ...state,
        collections: state.collections.map(collection => {
          if (collection.id === collectionId) {
            return {
              ...collection,
              subcollections: collection.subcollections.filter(s => s.id !== subcollectionId)
            };
          }
          return collection;
        })
      };
    }
    
    case EDIT_SUBCOLLECTION: {
      const { collectionId, subcollectionId, name } = action.payload;
      
      return {
        ...state,
        collections: state.collections.map(collection => {
          if (collection.id !== collectionId) return collection;
          
          return {
            ...collection,
            subcollections: collection.subcollections.map(sub =>
              sub.id === subcollectionId ? { ...sub, name } : sub
            )
          };
        })
      };
    }
    
    case REORDER_SUBCOLLECTIONS: {
      const { collectionId, draggedId, targetId, mouseY } = action.payload;
      
      return {
        ...state,
        collections: state.collections.map(collection => {
          if (collection.id !== collectionId) return collection;
          
          const newSubcollections = [...collection.subcollections];
          const draggedIndex = newSubcollections.findIndex(s => s.id === draggedId);
          const targetIndex = newSubcollections.findIndex(s => s.id === targetId);
          
          if (draggedIndex === -1 || targetIndex === -1) return collection;
          
          // Pobierz pozycję elementu docelowego
          const targetElement = document.querySelector(`[data-subcollection-id="${targetId}"]`);
          if (!targetElement) return collection;
          
          const targetRect = targetElement.getBoundingClientRect();
          const targetCenter = targetRect.top + targetRect.height / 2;
          
          // Reorderuj tylko jeśli mysz jest powyżej/poniżej środka
          const shouldReorder = draggedIndex < targetIndex ?
            mouseY > targetCenter :
            mouseY < targetCenter;
          
          if (!shouldReorder) return collection;
          
          const [removed] = newSubcollections.splice(draggedIndex, 1);
          newSubcollections.splice(targetIndex, 0, removed);
          
          return {
            ...collection,
            subcollections: newSubcollections.map((s, index) => ({
              ...s,
              order: index
            }))
          };
        })
      };
    }
    
    case MOVE_SUBCOLLECTION: {
      const { subcollection, fromCollectionId, toCollectionId } = action.payload;
      
      return {
        ...state,
        collections: state.collections.map(collection => {
          // Usuń podkolekcję z kolekcji źródłowej
          if (collection.id === fromCollectionId) {
            return {
              ...collection,
              subcollections: collection.subcollections
                .filter(sub => sub.id !== subcollection.id)
                .map((s, index) => ({ ...s, order: index }))
            };
          }
          
          // Dodaj podkolekcję do kolekcji docelowej
          if (collection.id === toCollectionId) {
            return {
              ...collection,
              subcollections: [
                ...collection.subcollections,
                {
                  ...subcollection,
                  order: collection.subcollections.length
                }
              ]
            };
          }
          
          return collection;
        })
      };
    }
    
    case ADD_SYSTEM_COLLECTION: {
      const { name, id, isSystemCollection, order } = action.payload;
      
      // Sprawdź czy kolekcja już istnieje
      if (state.collections.some(c => c.id === id || (c.isSystemCollection && c.name === name))) {
        return state;
      }
      
      return {
        ...state,
        collections: [...state.collections, {
          id: id || crypto.randomUUID(),
          name: name.trim(),
          order: order,
          isSystemCollection: isSystemCollection,
          subcollections: []
        }]
      };
    }

    case TOGGLE_EXPANDED_COLLECTION: {
      const collectionId = action.payload;
      
      return {
        ...state,
        expandedCollection: state.expandedCollection === collectionId ? null : collectionId,
        expandedSubcollection: null // Zamknij podkolekcje przy zmianie kolekcji
      };
    }

    case TOGGLE_EXPANDED_SUBCOLLECTION: {
      const subcollectionId = action.payload;
      
      return {
        ...state,
        expandedSubcollection: state.expandedSubcollection === subcollectionId ? null : subcollectionId
      };
    }
    
    default:
      return state;
  }
};
