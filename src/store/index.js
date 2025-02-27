import create from 'zustand';

const useStore = create((set) => ({
    beatmaps: [],
    addBeatmap: (beatmap) => set((state) => ({
        beatmaps: [...state.beatmaps, beatmap]
    })),
    removeBeatmap: (beatmapId) => set((state) => ({
        beatmaps: state.beatmaps.filter(beatmap => beatmap.id !== beatmapId)
    }))

}));

export default useStore;
