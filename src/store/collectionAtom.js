import { atomWithStorage } from 'jotai/utils';

// Collection structure with beatmaps and UI state
export const collectionsAtom = atomWithStorage('userCollections', {
    collections: [], // array of {id, name, order, subcollections: [{id, name, order}]}
    beatmapsets: {}, // beatmapset metadata
    beatmaps: {} // beatmap metadata
});