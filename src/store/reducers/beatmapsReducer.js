import {
  ADD_BEATMAP,
  ADD_BEATMAPSET,
  REMOVE_BEATMAP,
  EDIT_BEATMAP,
  MOVE_BEATMAP,
  MOVE_BEATMAP_TO_SUBCOLLECTION,
  TOGGLE_FAVORITE,
  TOGGLE_PINNED,
  TOGGLE_PIN
} from './actions';

// Funkcja pomocnicza do znajdowania kolekcji systemowych
const findSystemCollection = (collections, name) => {
  return collections.find(c => c.isSystemCollection && c.name === name);
};

export const beatmapsReducer = (state, action) => {
  switch (action.type) {
    case ADD_BEATMAPSET: {
      const { beatmapsetData } = action.payload;

      return {
        ...state,
        beatmapsets: {
          ...state.beatmapsets,
          [beatmapsetData.id]: beatmapsetData
        }
      };
    }

    case ADD_BEATMAP: {
      const { beatmapData, collectionId, subcollectionId } = action.payload;
      
      // Sprawdź, czy beatmapa już istnieje
      if (state.beatmaps[beatmapData.id]) {
        // Aktualizuj dane beatmapy
        return {
          ...state,
          beatmaps: {
            ...state.beatmaps,
            [beatmapData.id]: {
              ...state.beatmaps[beatmapData.id],
              ...beatmapData,
              collectionId: collectionId,
              subcollectionId: subcollectionId
            }
          }
        };
      } else {
        // Dodaj nową beatmapę
        return {
          ...state,
          beatmaps: {
            ...state.beatmaps,
            [beatmapData.id]: {
              ...beatmapData,
              collectionId: collectionId,
              subcollectionId: subcollectionId
            }
          }
        };
      }
    }
    
    case REMOVE_BEATMAP: {
      const { beatmapId } = action.payload;
      
      // Skopiuj stan beatmap
      const newBeatmaps = { ...state.beatmaps };
      const newTags = { ...state.tags };
      
      // Usuń beatmapę z tagów
      const beatmap = state.beatmaps[beatmapId];
      if (beatmap) {
        (beatmap.userTags || []).forEach(tagObj => {
          const tagName = tagObj.tag;
          if (tagName && newTags[tagName]) {
            newTags[tagName].count = Math.max(0, newTags[tagName].count - 1);
            newTags[tagName].beatmapIds = newTags[tagName].beatmapIds.filter(id => id !== beatmapId);
          }
        });
      }
      
      // Usuń beatmapę
      delete newBeatmaps[beatmapId];
      
      return {
        ...state,
        beatmaps: newBeatmaps,
        tags: newTags
      };
    }
    
    case EDIT_BEATMAP: {
      const { beatmapId, formData } = action.payload;
      if (!beatmapId || !state.beatmaps[beatmapId]) return state;
      
      const userTags = formData.tags || [];
      
      // Oblicz beatmap_priority na podstawie sumy wartości tagów
      const beatmap_priority = userTags.reduce(
        (sum, t) => sum + (parseInt(t.tag_value) || 0), 0
      );
      
      // Zaktualizuj statystyki tagów
      const newBeatmaps = { ...state.beatmaps };
      const newTags = { ...state.tags };
      
      // Usuń beatmapę ze starych tagów
      const oldTags = (state.beatmaps[beatmapId]?.userTags || []).map(t => t.tag);
      oldTags.forEach(tagName => {
        if (tagName && newTags[tagName]) {
          newTags[tagName].count = Math.max(0, newTags[tagName].count - 1);
          newTags[tagName].beatmapIds = newTags[tagName].beatmapIds.filter(id => id !== beatmapId);
        }
      });
      
      // Dodaj beatmapę do nowych tagów
      userTags.forEach(tagObj => {
        const tagName = tagObj.tag;
        if (!tagName) return;
        
        if (!newTags[tagName]) {
          newTags[tagName] = { count: 0, beatmapIds: [] };
        }
        
        if (!newTags[tagName].beatmapIds.includes(beatmapId)) {
          newTags[tagName].count++;
          newTags[tagName].beatmapIds.push(beatmapId);
        }
      });
      
      // Aktualizuj beatmapę
      newBeatmaps[beatmapId] = {
        ...state.beatmaps[beatmapId],
        userTags,
        notes: formData.notes || '',
        beatmap_priority,
        collectionId: formData.collectionId || state.beatmaps[beatmapId].collectionId,
        subcollectionId: formData.subcollectionId || state.beatmaps[beatmapId].subcollectionId
      };
      
      return {
        ...state,
        beatmaps: newBeatmaps,
        tags: newTags
      };
    }
    
    case MOVE_BEATMAP: {
      const { beatmapId, toCollectionId, toSubcollectionId } = action.payload;
      
      // Sprawdź, czy beatmapa istnieje
      if (!state.beatmaps[beatmapId]) return state;
      
      // Zaktualizuj kolekcję i podkolekcję beatmapy
      const updatedBeatmaps = {
        ...state.beatmaps,
        [beatmapId]: {
          ...state.beatmaps[beatmapId],
          collectionId: toCollectionId,
          subcollectionId: toSubcollectionId
        }
      };
      
      return {
        ...state,
        beatmaps: updatedBeatmaps
      };
    }

    case MOVE_BEATMAP_TO_SUBCOLLECTION: {
      const { beatmapId, targetCollectionId, targetSubcollectionId, sourceCollectionId, sourceSubcollectionId } = action.payload;

      // Sprawdź, czy beatmapa istnieje
      if (!state.beatmaps[beatmapId]) return state;

      // Zaktualizuj kolekcję i podkolekcję beatmapy
      const updatedBeatmaps = {
        ...state,
        beatmaps: {
          ...state.beatmaps,
          [beatmapId]: {
            ...state.beatmaps[beatmapId],
            collectionId: targetCollectionId,
            subcollectionId: targetSubcollectionId
          }
        }
      };

      return updatedBeatmaps;
    }
    
    case TOGGLE_FAVORITE: {
      const { beatmap } = action.payload;
      
      // Pobierz kolekcję "Favorites"
      const favoritesCollection = findSystemCollection(state.collections, 'Favorites');
      if (!favoritesCollection) return state;
      
      // Sprawdź czy beatmapa jest już w ulubionych
      const isFavorited = Object.values(state.beatmaps).some(b =>
        b.id === beatmap.id && b.collectionId === favoritesCollection.id
      );
      
      if (isFavorited) {
        // Usuń z ulubionych - przenieś do Unsorted
        const unsortedCollection = findSystemCollection(state.collections, 'Unsorted');
        if (!unsortedCollection) {
          // Jeśli nie ma kolekcji Unsorted, usuń beatmapę
          return beatmapsReducer(state, { 
            type: REMOVE_BEATMAP, 
            payload: { beatmapId: beatmap.id } 
          });
        }
        
        // Przenieś do Unsorted
        const updatedBeatmaps = { ...state.beatmaps };
        if (updatedBeatmaps[beatmap.id]) {
          updatedBeatmaps[beatmap.id] = {
            ...updatedBeatmaps[beatmap.id],
            collectionId: unsortedCollection.id,
            subcollectionId: null
          };
        }
        
        return {
          ...state,
          beatmaps: updatedBeatmaps
        };
      } else {
        // Dodaj do ulubionych
        if (state.beatmaps[beatmap.id]) {
          // Aktualizuj istniejącą beatmapę
          return {
            ...state,
            beatmaps: {
              ...state.beatmaps,
              [beatmap.id]: {
                ...state.beatmaps[beatmap.id],
                collectionId: favoritesCollection.id,
                subcollectionId: null
              }
            }
          };
        } else {
          // Dodaj nową beatmapę do ulubionych
          return {
            ...state,
            beatmaps: {
              ...state.beatmaps,
              [beatmap.id]: {
                ...beatmap,
                collectionId: favoritesCollection.id,
                subcollectionId: null
              }
            }
          };
        }
      }
    }
    
    case TOGGLE_PINNED: {
      const { beatmapId } = action.payload;
      
      if (!state.beatmaps[beatmapId]) return state;
      
      const currentBeatmap = state.beatmaps[beatmapId];
      const isPinned = currentBeatmap.pinned || false;
      
      return {
        ...state,
        beatmaps: {
          ...state.beatmaps,
          [beatmapId]: {
            ...currentBeatmap,
            pinned: !isPinned
          }
        }
      };
    }

    case TOGGLE_PIN: {
      const { beatmapId } = action.payload;
      
      if (!state.beatmaps[beatmapId]) return state;
      
      const currentBeatmap = state.beatmaps[beatmapId];
      const isPinned = currentBeatmap.pinned || false;
      
      return {
        ...state,
        beatmaps: {
          ...state.beatmaps,
          [beatmapId]: {
            ...currentBeatmap,
            pinned: !isPinned
          }
        }
      };
    }
    
    default:
      return state;
  }
};
