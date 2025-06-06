import { atomWithStorage } from 'jotai/utils';

// Generate a stable UUID for the "Unsorted" collection
const UNSORTED_COLLECTION_ID = '00000000-0000-0000-0000-000000000000';

// Collection structure with beatmaps and UI state
export const collectionsAtom = atomWithStorage('userCollections', {
    collections: [
        {
            id: UNSORTED_COLLECTION_ID,
            name: 'Unsorted',
            order: -1, // Always show at the top
            isSystemCollection: true, // Mark as system collection that can't be deleted
            subcollections: []
        }
    ],
    beatmapsets: {}, // beatmapset metadata
    beatmaps: {}, // beatmap metadata with structure: { 
                 // id: { 
                 //   id, setId, version, difficulty_rating, 
                 //   collectionId, subcollectionId,
                 //   tags: [{ tag, tag_value }], // Custom tags with priority values
                 //   notes: '' // Optional notes
                 // }
    tags: {}, // For tag statistics and quick access: { tagName: { count, beatmapIds: [] } }
});