import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { selectedTagsAtom } from '../../../store/selectedTagsAtom';
import { doesBeatmapMatchTags } from '../../../utils/tagUtils';
import { filterBeatmapsByTags } from '../../../utils/beatmapUtils';

/**
 * Hook do zarządzania filtrowaniem beatmap według tagów
 * @param {Object} initialVisibility - Początkowa widoczność grup tagów
 * @returns {Object} - Obiekt z funkcjami i stanem filtrowania
 */
export const useTagFiltering = (initialVisibility = {
  'User Tags': true,
  Artists: true,
  Mappers: true,
  Stars: true
}) => {
  // Stan lokalny i globalny dla tagów
  const [selectedTags, setSelectedTags] = useAtom(selectedTagsAtom);
  const [visibleGroups, setVisibleGroups] = useState(initialVisibility);
  const [filteredBeatmaps, setFilteredBeatmaps] = useState([]);
  const [allBeatmaps, setAllBeatmaps] = useState([]);
  
  // Funkcja przełączająca tag w filtrze
  const toggleTag = useCallback((tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, [setSelectedTags]);
  
  // Funkcja przełączająca widoczność grupy tagów
  const toggleGroupVisibility = useCallback((group) => {
    setVisibleGroups(prev => ({ 
      ...prev, 
      [group]: !prev[group] 
    }));
  }, []);
  
  // Funkcja czyszcząca wszystkie tagi
  const clearAllTags = useCallback(() => {
    setSelectedTags([]);
  }, [setSelectedTags]);
  
  // Efekt aktualizujący przefiltrowane beatmapy po zmianie tagów
  useEffect(() => {
    if (!allBeatmaps || allBeatmaps.length === 0) return;
    
    const filtered = filterBeatmapsByTags(
      allBeatmaps, 
      selectedTags, 
      doesBeatmapMatchTags
    );
    
    setFilteredBeatmaps(filtered);
  }, [selectedTags, allBeatmaps]);
  
  // Funkcja aktualizująca wszystkie beatmapy
  const updateAllBeatmaps = useCallback((beatmaps) => {
    setAllBeatmaps(beatmaps);
    
    // Od razu aktualizujemy przefiltrowane
    if (selectedTags.length === 0) {
      setFilteredBeatmaps(beatmaps);
    } else {
      const filtered = filterBeatmapsByTags(
        beatmaps, 
        selectedTags, 
        doesBeatmapMatchTags
      );
      setFilteredBeatmaps(filtered);
    }
  }, [selectedTags]);
  
  return {
    // Stan
    selectedTags,
    visibleGroups,
    filteredBeatmaps,
    allBeatmaps,
    
    // Akcje
    toggleTag,
    toggleGroupVisibility,
    clearAllTags,
    updateAllBeatmaps,
    
    // Exportowane funkcje pomocnicze
    matchFunction: doesBeatmapMatchTags
  };
};

export default useTagFiltering;
