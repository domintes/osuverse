import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useBeatmapStore = create(
    persist(
        (set, get) => ({
            beatmaps: new Map(), // Map<beatmapsetId, BeatmapSet>
            collections: new Map(), // Map<collectionId, Collection>
            tags: new Set(), // Set<string>
            filters: new Map(), // Map<filterId, Filter>
            favorites: {
                beatmaps: new Set(),
                collections: new Set(),
                mappers: new Set(),
                tags: new Set(),
                filters: new Set()
            },

            // Akcje dla beatmap
            addBeatmapSet: (beatmapset) => {
                const beatmaps = get().beatmaps;
                beatmaps.set(beatmapset.id, {
                    ...beatmapset,
                    addedAt: Date.now()
                });
                set({ beatmaps });
            },

            // Akcje dla kolekcji
            createCollection: (name) => {
                const collections = get().collections;
                const id = crypto.randomUUID();
                collections.set(id, {
                    id,
                    name,
                    beatmaps: new Map(), // Map<beatmapId, {addedAt, tags}>
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
                set({ collections });
                return id;
            },

            addBeatmapToCollection: (collectionId, beatmapId, tags = []) => {
                const collections = get().collections;
                const collection = collections.get(collectionId);
                
                if (!collection) return false;
                if (collection.beatmaps.has(beatmapId)) return false;

                collection.beatmaps.set(beatmapId, {
                    addedAt: Date.now(),
                    tags: new Set(tags)
                });
                collection.updatedAt = Date.now();
                
                set({ collections });
                return true;
            },

            // Akcje dla tagów
            addTag: (tag) => {
                const tags = get().tags;
                tags.add(tag.toLowerCase());
                set({ tags });
            },

            mergeTags: (sourceTag, targetTag) => {
                const collections = get().collections;
                const tags = get().tags;

                // Usuń źródłowy tag i dodaj docelowy
                tags.delete(sourceTag);
                tags.add(targetTag);

                // Zaktualizuj tagi we wszystkich kolekcjach
                collections.forEach(collection => {
                    collection.beatmaps.forEach(beatmap => {
                        if (beatmap.tags.has(sourceTag)) {
                            beatmap.tags.delete(sourceTag);
                            beatmap.tags.add(targetTag);
                        }
                    });
                });

                set({ collections, tags });
            },

            // Akcje dla filtrów
            createFilter: (name, conditions) => {
                const filters = get().filters;
                const id = crypto.randomUUID();
                filters.set(id, {
                    id,
                    name,
                    conditions,
                    createdAt: Date.now()
                });
                set({ filters });
                return id;
            },

            // Akcje dla ulubionych
            toggleFavorite: (type, id) => {
                const favorites = get().favorites;
                if (favorites[type].has(id)) {
                    favorites[type].delete(id);
                } else {
                    favorites[type].add(id);
                }
                set({ favorites });
            },

            // Eksport/Import
            exportCollections: () => {
                const collections = get().collections;
                return {
                    version: '1.0',
                    collections: Array.from(collections.values()),
                    exportedAt: Date.now()
                };
            },

            importCollections: (data) => {
                if (data.version !== '1.0') return false;
                
                const collections = new Map();
                data.collections.forEach(collection => {
                    collections.set(collection.id, {
                        ...collection,
                        beatmaps: new Map(Object.entries(collection.beatmaps))
                    });
                });

                set({ collections });
                return true;
            }
        }),
        {
            name: 'osuverse-storage',
            version: 1,
            serialize: (state) => {
                // Konwersja Map i Set na format możliwy do zserializowania
                return JSON.stringify({
                    ...state,
                    beatmaps: Array.from(state.beatmaps.entries()),
                    collections: Array.from(state.collections.entries()),
                    tags: Array.from(state.tags),
                    filters: Array.from(state.filters.entries()),
                    favorites: {
                        beatmaps: Array.from(state.favorites.beatmaps),
                        collections: Array.from(state.favorites.collections),
                        mappers: Array.from(state.favorites.mappers),
                        tags: Array.from(state.favorites.tags),
                        filters: Array.from(state.favorites.filters)
                    }
                });
            },
            deserialize: (str) => {
                const state = JSON.parse(str);
                return {
                    ...state,
                    beatmaps: new Map(state.beatmaps),
                    collections: new Map(state.collections),
                    tags: new Set(state.tags),
                    filters: new Map(state.filters),
                    favorites: {
                        beatmaps: new Set(state.favorites.beatmaps),
                        collections: new Set(state.favorites.collections),
                        mappers: new Set(state.favorites.mappers),
                        tags: new Set(state.favorites.tags),
                        filters: new Set(state.favorites.filters)
                    }
                };
            }
        }
    )
);

export default useBeatmapStore;
