import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Przykładowe dane beatmap
import { beatmaps as initialBeatmaps } from '../test_data/beatmaps';

// Stan początkowy
const initialState = {
  beatmaps: new Map(initialBeatmaps.map(beatmap => [beatmap.id, beatmap])),
  collections: new Map(),
  favorites: {
    beatmaps: new Set(),
    collections: new Set(),
    mappers: new Set()
  },
  searchResults: [],
  loading: false,
  error: null
};

// Hook store
const useBeatmapStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Funkcja do załadowania kolekcji z localStorage
      loadCollections: () => {
        // Ta funkcja jest wywoływana w App.jsx
        // Jeśli używasz persist, kolekcje są już ładowane automatycznie
        // Możesz tu dodać dodatkową logikę, jeśli potrzebujesz
        console.log('Kolekcje załadowane z localStorage');
      },

      // Dodawanie beatmapy
      addBeatmap: (beatmap) => {
        set(state => {
          const newBeatmaps = new Map(state.beatmaps);
          newBeatmaps.set(beatmap.id, beatmap);
          return { beatmaps: newBeatmaps };
        });
      },

      // Usuwanie beatmapy
      removeBeatmap: (beatmapId) => {
        set(state => {
          const newBeatmaps = new Map(state.beatmaps);
          newBeatmaps.delete(beatmapId);
          return { beatmaps: newBeatmaps };
        });
      },

      // Tworzenie kolekcji
      createCollection: (name) => {
        const id = Date.now();
        set(state => {
          const newCollections = new Map(state.collections);
          newCollections.set(id, {
            id,
            name,
            beatmaps: new Map(),
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
          return { collections: newCollections };
        });
        return id;
      },

      // Dodawanie kolekcji
      addCollection: (collection) => {
        const id = collection.id || Date.now();
        set(state => {
          const newCollections = new Map(state.collections);
          newCollections.set(id, {
            ...collection,
            id,
            beatmaps: new Map(collection.beatmaps || []),
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
          return { collections: newCollections };
        });
        return id;
      },

      // Usuwanie kolekcji
      removeCollection: (collectionId) => {
        set(state => {
          const newCollections = new Map(state.collections);
          newCollections.delete(collectionId);
          return { collections: newCollections };
        });
      },

      // Aktualizacja kolekcji
      updateCollection: (collectionId, updatedData) => {
        set(state => {
          const newCollections = new Map(state.collections);
          const collection = newCollections.get(collectionId);
          if (collection) {
            newCollections.set(collectionId, {
              ...collection,
              ...updatedData,
              updatedAt: Date.now()
            });
          }
          return { collections: newCollections };
        });
      },

      // Dodawanie beatmapy do kolekcji
      addBeatmapToCollection: (collectionId, beatmapId) => {
        set(state => {
          const newCollections = new Map(state.collections);
          const collection = newCollections.get(collectionId);
          const beatmap = state.beatmaps.get(beatmapId);
          
          if (collection && beatmap) {
            const newBeatmaps = new Map(collection.beatmaps);
            newBeatmaps.set(beatmapId, beatmap);
            newCollections.set(collectionId, {
              ...collection,
              beatmaps: newBeatmaps,
              updatedAt: Date.now()
            });
          }
          
          return { collections: newCollections };
        });
      },

      // Usuwanie beatmapy z kolekcji
      removeBeatmapFromCollection: (collectionId, beatmapId) => {
        set(state => {
          const newCollections = new Map(state.collections);
          const collection = newCollections.get(collectionId);
          
          if (collection) {
            const newBeatmaps = new Map(collection.beatmaps);
            newBeatmaps.delete(beatmapId);
            newCollections.set(collectionId, {
              ...collection,
              beatmaps: newBeatmaps,
              updatedAt: Date.now()
            });
          }
          
          return { collections: newCollections };
        });
      },

      // Przełączanie ulubionego elementu (beatmapa, kolekcja, mapper)
      toggleFavorite: (type, id) => {
        set(state => {
          const newFavorites = { ...state.favorites };
          const favSet = new Set(newFavorites[type]);
          
          if (favSet.has(id)) {
            favSet.delete(id);
          } else {
            favSet.add(id);
          }
          
          newFavorites[type] = favSet;
          return { favorites: newFavorites };
        });
      },

      // Wyszukiwanie beatmap
      searchBeatmaps: (query) => {
        set({ loading: true, error: null });
        
        try {
          const { beatmaps } = get();
          const lowerQuery = query.toLowerCase();
          
          const results = Array.from(beatmaps.values()).filter(beatmap => 
            beatmap.title.toLowerCase().includes(lowerQuery) || 
            beatmap.artist.toLowerCase().includes(lowerQuery) ||
            beatmap.creator.toLowerCase().includes(lowerQuery) ||
            (beatmap.tags && beatmap.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
          );
          
          set({ searchResults: results, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Resetowanie stanu
      resetStore: () => {
        set(initialState);
      }
    }),
    {
      name: 'osuverse-storage',
      partialize: (state) => ({
        collections: Array.from(state.collections.entries()),
        favorites: {
          beatmaps: Array.from(state.favorites.beatmaps),
          collections: Array.from(state.favorites.collections),
          mappers: Array.from(state.favorites.mappers)
        }
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Konwersja z powrotem na Map i Set
          state.collections = new Map(state.collections);
          state.favorites.beatmaps = new Set(state.favorites.beatmaps);
          state.favorites.collections = new Set(state.favorites.collections);
          state.favorites.mappers = new Set(state.favorites.mappers);
          
          // Dla każdej kolekcji przekształć beatmapy na Map
          state.collections.forEach((collection) => {
            if (Array.isArray(collection.beatmaps)) {
              const beatmapsMap = new Map();
              collection.beatmaps.forEach(beatmap => {
                beatmapsMap.set(beatmap.id, beatmap);
              });
              collection.beatmaps = beatmapsMap;
            } else if (!(collection.beatmaps instanceof Map)) {
              collection.beatmaps = new Map();
            }
          });
        }
      }
    }
  )
);

export default useBeatmapStore;
