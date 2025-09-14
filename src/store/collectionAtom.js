import { atomWithStorage } from 'jotai/utils';

// Generate a stable UUID for the "Unsorted" collection
const UNSORTED_COLLECTION_ID = '00000000-0000-0000-0000-000000000000';
// Generate a stable UUID for the "Favorites" collection
const FAVORITES_COLLECTION_ID = '11111111-1111-1111-1111-111111111111';
// Generate a stable UUID for the "To Check" collection
const TO_CHECK_COLLECTION_ID = '22222222-2222-2222-2222-222222222222';

// Collection structure with beatmaps and UI state
export const collectionsAtom = atomWithStorage('userCollections', {
    collections: [
        {
            id: UNSORTED_COLLECTION_ID,
            name: 'Unsorted',
            order: -1, // Always show at the top
            isSystemCollection: true, // Mark as system collection that can't be deleted
            subcollections: []
        },
        {
            id: FAVORITES_COLLECTION_ID,
            name: 'Favorites',
            order: -2, // Show above Unsorted
            isSystemCollection: true, // Mark as system collection that can't be deleted
            subcollections: []
        },
        {
            id: TO_CHECK_COLLECTION_ID,
            name: 'To Check',
            order: -3, // Show above Favorites
            isSystemCollection: true,
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