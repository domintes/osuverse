// Akcje UI
export const TOGGLE_EXPANDED_COLLECTION = 'TOGGLE_EXPANDED_COLLECTION';
export const TOGGLE_EXPANDED_SUBCOLLECTION = 'TOGGLE_EXPANDED_SUBCOLLECTION';
export const SET_EDITING_ITEM = 'SET_EDITING_ITEM';
export const CLEAR_EDITING_STATE = 'CLEAR_EDITING_STATE';
export const SET_VALIDATION_STATE = 'SET_VALIDATION_STATE';
export const CLEAR_ERRORS = 'CLEAR_ERRORS';
export const SET_ERROR = 'SET_ERROR';
export const TOGGLE_TAG_SELECTOR = 'TOGGLE_TAG_SELECTOR';

// Kreatory akcji UI
export const toggleExpandedCollection = (collectionId) => ({
  type: TOGGLE_EXPANDED_COLLECTION,
  payload: { collectionId }
});

export const toggleExpandedSubcollection = (subcollectionId) => ({
  type: TOGGLE_EXPANDED_SUBCOLLECTION,
  payload: { subcollectionId }
});

export const setEditingItem = (type, id, name) => ({
  type: SET_EDITING_ITEM,
  payload: { type, id, name }
});

export const clearEditingState = () => ({
  type: CLEAR_EDITING_STATE
});

export const setValidationState = (type, id, isValid, message) => ({
  type: SET_VALIDATION_STATE,
  payload: { type, id, isValid, message }
});

export const clearErrors = () => ({
  type: CLEAR_ERRORS
});

export const setError = (id, message) => ({
  type: SET_ERROR,
  payload: { id, message }
});

export const toggleTagSelector = (isVisible) => ({
  type: TOGGLE_TAG_SELECTOR,
  payload: { isVisible }
});
