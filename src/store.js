import { create } from 'zustand';

const useStore = create((set, get) => ({
    beatmaps: JSON.parse(localStorage.getItem('beatmaps')) || [],
    filteredBeatmaps: [],
    collections: JSON.parse(localStorage.getItem('collections')) || {},

    addBeatmap: (beatmap) => {
        console.log('addBeatmap called with:', beatmap);
        set((state) => {
            // Ensure beatmap has tags array
            const beatmapWithTags = {
                ...beatmap,
                tags: Array.isArray(beatmap.tags) ? beatmap.tags : []
            };
            const updatedBeatmaps = [...state.beatmaps, beatmapWithTags];
            localStorage.setItem('beatmaps', JSON.stringify(updatedBeatmaps));
            console.log('Updated beatmaps array:', updatedBeatmaps);
            return { beatmaps: updatedBeatmaps };
        });
        console.log('Beatmap has been added to the store');
    },

    removeBeatmap(beatmapId) {
        console.log('removeBeatmap called with:', beatmapId);
        set((state) => {
            const updatedBeatmaps = state.beatmaps.filter(beatmap => beatmap.id !== beatmapId);
            localStorage.setItem('beatmaps', JSON.stringify(updatedBeatmaps));
            console.log('Updated beatmaps array after removal:', updatedBeatmaps);
            return { beatmaps: updatedBeatmaps };
        });
        console.log('Beatmap has been removed from the store');
    },

    filterByTags: (selectedTags) => {
        if (!selectedTags.length) {
            set({ filteredBeatmaps: get().beatmaps });
            return;
        }
        
        const filtered = get().beatmaps.filter(beatmap => 
            beatmap && 
            Array.isArray(beatmap.tags) && 
            selectedTags.every(tag => beatmap.tags.includes(tag))
        );
        set({ filteredBeatmaps: filtered });
    },

    createCollection: (collectionName) => set((state) => {
        const updatedCollections = {
            ...state.collections,
            [collectionName]: []
        };
        localStorage.setItem('collections', JSON.stringify(updatedCollections));
        return { collections: updatedCollections };
    }),

    addBeatmapToCollection: (collectionName, beatmap) => set((state) => {
        const collection = state.collections[collectionName] || [];
        const updatedCollections = {
            ...state.collections,
            [collectionName]: [...collection, beatmap]
        };
        localStorage.setItem('collections', JSON.stringify(updatedCollections));
        return { collections: updatedCollections };
    }),

    removeBeatmapFromCollection: (collectionName, beatmapId) => set((state) => {
        const collection = state.collections[collectionName] || [];
        const updatedCollections = {
            ...state.collections,
            [collectionName]: collection.filter(b => b.id !== beatmapId)
        };
        localStorage.setItem('collections', JSON.stringify(updatedCollections));
        return { collections: updatedCollections };
    }),

    removeCollection: (collectionName) => set((state) => {
        const updatedCollections = { ...state.collections };
        delete updatedCollections[collectionName];
        localStorage.setItem('collections', JSON.stringify(updatedCollections));
        return { collections: updatedCollections };
    }),

    getBeatmapsByCollection: (collectionName) => {
        const { collections } = get();
        return collections[collectionName] || [];
    }
}));

export default useStore;
