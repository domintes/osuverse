'use client';

import { useState } from 'react';

/**
 * Hook do zarządzania filtrowaniem beatmap według tagów
 */
export const useBeatmapFilter = () => {
    const [activeTags, setActiveTags] = useState([]);
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);    // Funkcja filtrująca beatmapy według aktywnych tagów
    const filterBeatmapsByTags = (beatmaps, globalTags = []) => {
        // Jeśli nie ma ani lokalnych, ani globalnych tagów aktywnych
        if (activeTags.length === 0 && globalTags.length === 0) return beatmaps;
        
        // Połącz tagi lokalne i globalne
        const allActiveTags = [...activeTags, ...globalTags];
        
        return beatmaps.filter(beatmap => {
            // Obsługujemy oba formaty tagów (string i obiekt)
            const beatmapTags = [];
            if (Array.isArray(beatmap.userTags)) {
                beatmap.userTags.forEach(tag => {
                    if (typeof tag === 'string') {
                        beatmapTags.push(tag);
                    } else if (tag && typeof tag === 'object' && tag.tag) {
                        beatmapTags.push(tag.tag);
                    }
                });
            }
            
            const beatmapArtist = beatmap.artist_name || beatmap.artist || '';
            const beatmapMapper = beatmap.creator_name || beatmap.mapper || '';
            const starRating = beatmap.difficulty_rating || 0;
              return allActiveTags.every(tag => {
                // Konwersja tagu do małych liter dla porównania
                const tagLower = tag.toLowerCase();
                
                // Sprawdź czy tag jest tagiem użytkownika (case-insensitive)
                if (beatmapTags.some(t => t.toLowerCase() === tagLower)) return true;
                
                // Sprawdź czy tag to artysta
                if (beatmapArtist.toLowerCase() === tagLower) return true;
                
                // Sprawdź czy tag to mapper
                if (beatmapMapper.toLowerCase() === tagLower) return true;
                
                // Sprawdź czy tag to zakres gwiazdek
                if (tagLower === '4.99-5.70*' && starRating < 5.71) return true;
                if (tagLower === '5.71-6.59*' && starRating >= 5.71 && starRating < 6.6) return true;
                if (tagLower === '6.60-7.69*' && starRating >= 6.6) return true;
                
                return false;
            });
        });
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
