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
export const REMOVE_BEATMAP = 'REMOVE_BEATMAP';
export const EDIT_BEATMAP = 'EDIT_BEATMAP';
export const MOVE_BEATMAP = 'MOVE_BEATMAP';
export const REORDER_BEATMAPS = 'REORDER_BEATMAPS';
export const TOGGLE_FAVORITE = 'TOGGLE_FAVORITE';

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

export const reorderBeatmaps = (collectionId, subcollectionId, draggedId, targetId) => ({
  type: REORDER_BEATMAPS,
  payload: { collectionId, subcollectionId: subcollectionId || null, draggedId, targetId }
});

export const toggleFavorite = (beatmap) => ({
  type: TOGGLE_FAVORITE,
  payload: { beatmap }
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
