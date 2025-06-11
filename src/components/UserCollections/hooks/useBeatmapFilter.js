'use client';

import { useState } from 'react';
import { doesBeatmapMatchTags, extractTagsText } from '../../../utils/tagUtils';
import { filterBeatmapsByTags as filterUtility } from '../../../utils/beatmapUtils';

/**
 * Hook do zarządzania filtrowaniem beatmap według tagów
 */
export const useBeatmapFilter = () => {
    const [activeTags, setActiveTags] = useState([]);
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    
    // Funkcja filtrująca beatmapy według aktywnych tagów
    const filterBeatmapsByTags = (beatmaps, globalTags = []) => {
        // Jeśli nie ma ani lokalnych, ani globalnych tagów aktywnych
        if (activeTags.length === 0 && globalTags.length === 0) return beatmaps;
        
        // Połącz tagi lokalne i globalne
        const allActiveTags = [...activeTags, ...globalTags];
        
        // Używamy zaimportowanej funkcji pomocniczej, która zapewnia spójność z funkcją używaną w TagSections
        return filterUtility(beatmaps, allActiveTags, doesBeatmapMatchTags);
    };

    // Funkcja przełączająca tag w filtrze
    const toggleTagFilter = (tag) => {
        setActiveTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };    // Funkcja pobierająca wszystkie tagi używane w kolekcji
    const getTagsForCollection = (beatmaps) => {
        const tags = new Set();

        beatmaps.forEach(beatmap => {
            (beatmap.userTags || []).forEach(tagItem => {
                if (typeof tagItem === 'string') {
                    tags.add(tagItem);
                } else if (tagItem && typeof tagItem === 'object' && tagItem.tag) {
                    tags.add(tagItem.tag);
                }
            });
        });

        return Array.from(tags);
    };

    // Funkcja do ustawiania dostępnych tagów
    const updateAvailableTags = (beatmaps) => {
        const tags = getTagsForCollection(beatmaps);
        setAvailableTags(tags);
    };

    return {
        activeTags,
        showTagSelector,
        availableTags,
        filterBeatmapsByTags,
        toggleTagFilter,
        setShowTagSelector,
        updateAvailableTags
    };
};
