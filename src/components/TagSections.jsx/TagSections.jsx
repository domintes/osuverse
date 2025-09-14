import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { collectionsAtom } from '../../store/collectionAtom';
import { getAllBeatmapsFromCollections } from '../../utils/beatmapUtils';
import { groupTagsByCategory } from '../../utils/tagUtils';
import { useTagFiltering } from './hooks/useTagFiltering';

// Komponenty
import TagGroup from './components/TagGroup';
import TagGroupToggle from './components/TagGroupToggle';

// Style
import './tagSections.scss';

/**
 * Główny komponent sekcji tagów
 */
const TagsSection = () => {
  const [collections] = useAtom(collectionsAtom);
  
  // Hook do filtrowania tagów
  const {
    selectedTags,
    visibleGroups,
    filteredBeatmaps,
    toggleTag,
    toggleGroupVisibility,
    updateAllBeatmaps,
    clearAllTags
  } = useTagFiltering();
  
  // Pobranie wszystkich beatmap
  const allBeatmaps = useMemo(() => {
    const beatmaps = getAllBeatmapsFromCollections(collections);
    // Zaaktualizuj beatmapy w hooku filtrowania
    updateAllBeatmaps(beatmaps);
    return beatmaps;
  }, [collections, updateAllBeatmaps]);
  
  // Pogrupowanie tagów po kategoriach
  const tagGroups = useMemo(() => {
    return groupTagsByCategory(filteredBeatmaps);
  }, [filteredBeatmaps]);
  
  return (
    <div className="tag-sections-container">
      <h2 className="tag-sections-title">Collection Tags Filterr</h2>
      
      {/* Przełączniki widoczności grup tagów */}
      <div className="tag-groups-toggle">
        {Object.keys(tagGroups).map(groupName => (
          <TagGroupToggle
            key={groupName}
            name={groupName}
            isVisible={visibleGroups[groupName] || false}
            onToggle={toggleGroupVisibility}
          />
        ))}
      </div>
      
      {/* Grupy tagów */}
      {Object.entries(tagGroups).map(([groupName, tags]) => (
        visibleGroups[groupName] && (
          <TagGroup
            key={groupName}
            name={groupName}
            tags={tags}
            selectedTags={selectedTags}
            onTagToggle={toggleTag}
          />
        )
      ))}
      
      {/* Informacja o liczbie wyfiltrowanych beatmap */}
      {selectedTags.length > 0 && (
        <div className="tag-filter-info">
          Showing {filteredBeatmaps.length} of {allBeatmaps.length} beatmaps
          <button 
            className="clear-tags-button"
            onClick={clearAllTags}
            aria-label="Clear all tag filters"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TagsSection;
