import { create } from 'zustand';

const useStore = create((set) => ({
    beatmaps: JSON.parse(localStorage.getItem('beatmaps')) || [],
    addBeatmap: (beatmap) => set((state) => {
        const updatedBeatmaps = [...state.beatmaps, beatmap];
        localStorage.setItem('beatmaps', JSON.stringify(updatedBeatmaps));
        return { beatmaps: updatedBeatmaps };
    }),
}));

export default useStore;
