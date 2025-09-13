// Typy akcji
// Akcje kolekcji
export const ADD_COLLECTION = 'ADD_COLLECTION';
export const REMOVE_COLLECTION = 'REMOVE_COLLECTION';
export const EDIT_COLLECTION = 'EDIT_COLLECTION';
export const REORDER_COLLECTIONS = 'REORDER_COLLECTIONS';

// Akcje podkolekcji
export const ADD_SUBCOLLECTION = 'ADD_SUBCOLLECTION';
export const REMOVE_SUBCOLLECTION = 'REMOVE_SUBCOLLECTION';
export const EDIT_SUBCOLLECTION = 'EDIT_SUBCOLLECTION';
export const REORDER_SUBCOLLECTIONS = 'REORDER_SUBCOLLECTIONS';
export const MOVE_SUBCOLLECTION = 'MOVE_SUBCOLLECTION';

// Akcje beatmap
export const ADD_BEATMAP = 'ADD_BEATMAP';
export const ADD_BEATMAPSET = 'ADD_BEATMAPSET';
export const REMOVE_BEATMAP = 'REMOVE_BEATMAP';
export const EDIT_BEATMAP = 'EDIT_BEATMAP';
export const MOVE_BEATMAP = 'MOVE_BEATMAP';
export const MOVE_BEATMAP_TO_SUBCOLLECTION = 'MOVE_BEATMAP_TO_SUBCOLLECTION';
export const TOGGLE_FAVORITE = 'TOGGLE_FAVORITE';
export const TOGGLE_PINNED = 'TOGGLE_PINNED';
export const TOGGLE_PIN = 'TOGGLE_PIN';
export const ADD_SYSTEM_COLLECTION = 'ADD_SYSTEM_COLLECTION';

// Akcje UI
export const TOGGLE_EXPANDED_COLLECTION = 'TOGGLE_EXPANDED_COLLECTION';
export const TOGGLE_EXPANDED_SUBCOLLECTION = 'TOGGLE_EXPANDED_SUBCOLLECTION';

// Akcje tagów
export const ADD_TAG = 'ADD_TAG';
export const REMOVE_TAG = 'REMOVE_TAG';
export const UPDATE_TAG_STATS = 'UPDATE_TAG_STATS';

// Kreatory akcji dla kolekcji
export const addCollection = (name) => ({
  type: ADD_COLLECTION,
  payload: { name }
});

export const removeCollection = (collectionId) => ({
  type: REMOVE_COLLECTION,
  payload: { collectionId }
});

export const editCollection = (collectionId, name) => ({
  type: EDIT_COLLECTION,
  payload: { collectionId, name }
});

export const reorderCollections = (draggedId, targetId, mouseY) => ({
  type: REORDER_COLLECTIONS,
  payload: { draggedId, targetId, mouseY }
});

// Kreatory akcji dla podkolekcji
export const addSubcollection = (collectionId, name) => ({
  type: ADD_SUBCOLLECTION,
  payload: { collectionId, name }
});

export const removeSubcollection = (collectionId, subcollectionId) => ({
  type: REMOVE_SUBCOLLECTION,
  payload: { collectionId, subcollectionId }
});

export const editSubcollection = (collectionId, subcollectionId, name) => ({
  type: EDIT_SUBCOLLECTION,
  payload: { collectionId, subcollectionId, name }
});

export const reorderSubcollections = (collectionId, draggedId, targetId, mouseY) => ({
  type: REORDER_SUBCOLLECTIONS,
  payload: { collectionId, draggedId, targetId, mouseY }
});

export const moveSubcollection = (subcollection, fromCollectionId, toCollectionId) => ({
  type: MOVE_SUBCOLLECTION,
  payload: { subcollection, fromCollectionId, toCollectionId }
});

// Kreatory akcji dla beatmap
export const addBeatmap = (beatmapData, collectionId, subcollectionId = null) => ({
  type: ADD_BEATMAP,
  payload: { beatmapData, collectionId, subcollectionId }
});

export const addBeatmapset = (beatmapsetData) => ({
  type: ADD_BEATMAPSET,
  payload: { beatmapsetData }
});

export const removeBeatmap = (beatmapId) => ({
  type: REMOVE_BEATMAP,
  payload: { beatmapId }
});

export const editBeatmap = (beatmapId, formData) => ({
  type: EDIT_BEATMAP,
  payload: { beatmapId, formData }
});

export const moveBeatmap = (beatmapId, toCollectionId, toSubcollectionId = null) => ({
  type: MOVE_BEATMAP,
  payload: { beatmapId, toCollectionId, toSubcollectionId }
});

export const moveBeatmapToSubcollection = (beatmapId, targetCollectionId, targetSubcollectionId, sourceCollectionId, sourceSubcollectionId) => ({
  type: MOVE_BEATMAP_TO_SUBCOLLECTION,
  payload: { beatmapId, targetCollectionId, targetSubcollectionId, sourceCollectionId, sourceSubcollectionId }
});

export const toggleFavorite = (beatmap) => ({
  type: TOGGLE_FAVORITE,
  payload: { beatmap }
});

export const togglePinned = (beatmapId) => ({
  type: TOGGLE_PINNED,
  payload: { beatmapId }
});

export const togglePin = (beatmapId) => ({
  type: TOGGLE_PIN,
  payload: { beatmapId }
});

export const addSystemCollection = (name, id, isSystemCollection = true, order = -1000) => ({
  type: ADD_SYSTEM_COLLECTION,
  payload: { name, id, isSystemCollection, order }
});

// Kreatory akcji dla UI
export const toggleExpandedCollection = (collectionId) => ({
  type: TOGGLE_EXPANDED_COLLECTION,
  payload: collectionId
});

export const toggleExpandedSubcollection = (subcollectionId) => ({
  type: TOGGLE_EXPANDED_SUBCOLLECTION,
  payload: subcollectionId
});

// Kreatory akcji dla tagów
export const addTag = (beatmapId, tag) => ({
  type: ADD_TAG,
  payload: { beatmapId, tag }
});

export const removeTag = (beatmapId, tag) => ({
  type: REMOVE_TAG,
  payload: { beatmapId, tag }
});

export const updateTagStats = () => ({
  type: UPDATE_TAG_STATS
});
