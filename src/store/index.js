import create from 'zustand';

const useStore = create((set) => ({
    beatmapCollection: [],
    addBeatmap: (beatmap) => set((state) => {
        const updatedCollection = [...state.beatmapCollection, beatmap];
        localStorage.setItem('beatmapCollection', JSON.stringify(updatedCollection));
        return { beatmapCollection: updatedCollection };
    }),
}));

export default useStore;
