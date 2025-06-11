import {
  ADD_TAG,
  REMOVE_TAG,
  UPDATE_TAG_STATS
} from './actions';

export const tagsReducer = (state, action) => {
  switch (action.type) {
    case ADD_TAG: {
      const { beatmapId, tag } = action.payload;
      
      // Sprawdź czy beatmapa istnieje
      if (!state.beatmaps[beatmapId]) return state;
      
      // Sprawdź, czy tag jest poprawny
      if (!tag || !tag.tag) return state;
      
      const tagName = tag.tag;
      
      // Zaktualizuj tagi beatmapy
      const updatedBeatmap = {
        ...state.beatmaps[beatmapId],
        userTags: [...(state.beatmaps[beatmapId].userTags || []), tag]
      };
      
      // Zaktualizuj statystyki tagów globalnych
      const updatedTags = { ...state.tags };
      
      if (!updatedTags[tagName]) {
        updatedTags[tagName] = { count: 0, beatmapIds: [] };
      }
      
      if (!updatedTags[tagName].beatmapIds.includes(beatmapId)) {
        updatedTags[tagName].count++;
        updatedTags[tagName].beatmapIds.push(beatmapId);
      }
      
      return {
        ...state,
        beatmaps: {
          ...state.beatmaps,
          [beatmapId]: updatedBeatmap
        },
        tags: updatedTags
      };
    }
    
    case REMOVE_TAG: {
      const { beatmapId, tag } = action.payload;
      
      // Sprawdź czy beatmapa istnieje
      if (!state.beatmaps[beatmapId]) return state;
      
      const tagName = typeof tag === 'string' ? tag : tag?.tag;
      if (!tagName) return state;
      
      // Filtruj tagi beatmapy
      const updatedBeatmap = {
        ...state.beatmaps[beatmapId],
        userTags: (state.beatmaps[beatmapId].userTags || [])
          .filter(t => t.tag !== tagName)
      };
      
      // Aktualizuj statystyki tagów globalnych
      const updatedTags = { ...state.tags };
      
      if (updatedTags[tagName]) {
        updatedTags[tagName].count = Math.max(0, updatedTags[tagName].count - 1);
        updatedTags[tagName].beatmapIds = updatedTags[tagName].beatmapIds
          .filter(id => id !== beatmapId);
          
        // Usuń pusty tag ze statystyk
        if (updatedTags[tagName].count === 0) {
          delete updatedTags[tagName];
        }
      }
      
      return {
        ...state,
        beatmaps: {
          ...state.beatmaps,
          [beatmapId]: updatedBeatmap
        },
        tags: updatedTags
      };
    }
    
    case UPDATE_TAG_STATS: {
      // Przebuduj statystyki tagów na podstawie wszystkich beatmap
      const newTags = {};
      
      Object.entries(state.beatmaps).forEach(([beatmapId, beatmap]) => {
        (beatmap.userTags || []).forEach(tagObj => {
          const tagName = tagObj.tag;
          if (!tagName) return;
          
          if (!newTags[tagName]) {
            newTags[tagName] = { count: 0, beatmapIds: [] };
          }
          
          if (!newTags[tagName].beatmapIds.includes(beatmapId)) {
            newTags[tagName].count++;
            newTags[tagName].beatmapIds.push(beatmapId);
          }
        });
      });
      
      return {
        ...state,
        tags: newTags
      };
    }
    
    default:
      return state;
  }
};
