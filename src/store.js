import { create } from 'zustand';

const useStore = create((set, get) => ({
    beatmaps: JSON.parse(localStorage.getItem('beatmaps')) || [],
    filteredBeatmaps: [],
    addBeatmap: (beatmap) => {
        console.log('addBeatmap called with:', beatmap);
        set((state) => {
            const updatedBeatmaps = [...state.beatmaps, beatmap];
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
            selectedTags.every(tag => beatmap.tags.includes(tag))
        );
        set({ filteredBeatmaps: filtered });
    }
}));

export default useStore;
