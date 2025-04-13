import { atomWithStorage } from 'jotai/utils';

// Collection structure:
// {
//   beatmapsets: { [beatmapsetId]: { metadata, difficulties: [] } }
//   beatmaps: { [beatmapId]: { metadata, beatmapsetId } }
// }
export const collectionAtom = atomWithStorage('userCollection', {
    beatmapsets: {},
    beatmaps: {}
});