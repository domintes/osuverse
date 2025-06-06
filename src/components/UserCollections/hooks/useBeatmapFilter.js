'use client';

import { useState } from 'react';

/**
 * Hook do zarządzania filtrowaniem beatmap według tagów
 */
export const useBeatmapFilter = () => {
    const [activeTags, setActiveTags] = useState([]);
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);

    // Funkcja filtrująca beatmapy według aktywnych tagów
    const filterBeatmapsByTags = (beatmaps) => {
        if (activeTags.length === 0) return beatmaps;

        return beatmaps.filter(beatmap => {
            const beatmapTags = beatmap.userTags?.map(t => t.tag) || [];
            return activeTags.every(tag => beatmapTags.includes(tag));
        });
    };

    // Funkcja przełączająca tag w filtrze
    const toggleTagFilter = (tag) => {
        setActiveTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    // Funkcja pobierająca wszystkie tagi używane w kolekcji
    const getTagsForCollection = (beatmaps) => {
        const tags = new Set();

        beatmaps.forEach(beatmap => {
            (beatmap.userTags || []).forEach(tagObj => {
                if (tagObj.tag) tags.add(tagObj.tag);
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
