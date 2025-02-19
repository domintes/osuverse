import { create } from 'zustand';

const useStore = create((set) => ({
    beatmaps: JSON.parse(localStorage.getItem('beatmaps')) || [],
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
}));

export default useStore;
