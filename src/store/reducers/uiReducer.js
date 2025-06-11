import {
  TOGGLE_EXPANDED_COLLECTION,
  TOGGLE_EXPANDED_SUBCOLLECTION,
  SET_EDITING_ITEM,
  CLEAR_EDITING_STATE,
  SET_VALIDATION_STATE,
  CLEAR_ERRORS,
  SET_ERROR,
  TOGGLE_TAG_SELECTOR
} from './uiActions';

// Stan początkowy UI
const initialUIState = {
  expandedCollection: null,
  expandedSubcollection: null,
  editingCollectionId: null,
  editingSubcollectionId: null,
  editingName: '',
  errors: {},
  validationStates: {
    collection: { isValid: true, message: '' },
    subcollections: {}
  },
  showTagSelector: false
};

export const uiReducer = (state = initialUIState, action) => {
  switch (action.type) {
    case TOGGLE_EXPANDED_COLLECTION: {
      const { collectionId } = action.payload;
      
      // Jeśli klikamy na już rozwinięty element, zwiń go
      if (state.expandedCollection === collectionId) {
        return {
          ...state,
          expandedCollection: null,
          expandedSubcollection: null
        };
      }
      
      // W przeciwnym razie rozwiń kolekcję
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastExpandedCollection', collectionId);
      }
      
      return {
        ...state,
        expandedCollection: collectionId,
        expandedSubcollection: null
      };
    }
    
    case TOGGLE_EXPANDED_SUBCOLLECTION: {
      const { subcollectionId } = action.payload;
      
      // Jeśli klikamy na już rozwinięty element, zwiń go
      if (state.expandedSubcollection === subcollectionId) {
        return {
          ...state,
          expandedSubcollection: null
        };
      }
      
      // W przeciwnym razie rozwiń podkolekcję
      return {
        ...state,
        expandedSubcollection: subcollectionId
      };
    }
    
    case SET_EDITING_ITEM: {
      const { type, id, name } = action.payload;
      
      if (type === 'collection') {
        return {
          ...state,
          editingCollectionId: id,
          editingSubcollectionId: null,
          editingName: name || ''
        };
      } else if (type === 'subcollection') {
        return {
          ...state,
          editingSubcollectionId: id,
          editingCollectionId: null,
          editingName: name || ''
        };
      }
      
      return state;
    }
    
    case CLEAR_EDITING_STATE: {
      return {
        ...state,
        editingCollectionId: null,
        editingSubcollectionId: null,
        editingName: ''
      };
    }
    
    case SET_VALIDATION_STATE: {
      const { type, id, isValid, message } = action.payload;
      
      if (type === 'collection') {
        return {
          ...state,
          validationStates: {
            ...state.validationStates,
            collection: { isValid, message }
          }
        };
      } else if (type === 'subcollection') {
        return {
          ...state,
          validationStates: {
            ...state.validationStates,
            subcollections: {
              ...state.validationStates.subcollections,
              [id]: { isValid, message }
            }
          }
        };
      }
      
      return state;
    }
    
    case CLEAR_ERRORS: {
      return {
        ...state,
        errors: {}
      };
    }
    
    case SET_ERROR: {
      const { id, message } = action.payload;
      
      return {
        ...state,
        errors: {
          ...state.errors,
          [id]: message
        }
      };
    }
    
    case TOGGLE_TAG_SELECTOR: {
      const { isVisible } = action.payload;
      
      return {
        ...state,
        showTagSelector: isVisible !== undefined ? isVisible : !state.showTagSelector
      };
    }
    
    default:
      return state;
  }
};
