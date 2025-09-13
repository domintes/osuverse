'use client';

import { useState } from 'react';

/**
 * Hook do zarządzania sortowaniem beatmap
 */
export const useBeatmapSort = () => {
    const [sortMode, setSortMode] = useState('priority'); // 'priority', 'name', 'date'
    const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'

    // Funkcja sortująca beatmapy według różnych kryteriów
    const sortBeatmaps = (beatmaps) => {
        return [...beatmaps].sort((a, b) => {
            // Pinned beatmapy zawsze na górze
            const pinnedA = a.pinned || false;
            const pinnedB = b.pinned || false;
            
            if (pinnedA && !pinnedB) return -1;
            if (!pinnedA && pinnedB) return 1;
            
            // Jeśli obie są pinned lub obie nie są pinned, sortuj normalnie
            if (sortMode === 'priority') {
                const priorityA = a.beatmap_priority || 0;
                const priorityB = b.beatmap_priority || 0;
                return sortDirection === 'desc'
                    ? priorityB - priorityA
                    : priorityA - priorityB;
            }

            if (sortMode === 'name') {
                const nameA = `${a.artist} - ${a.title}`.toLowerCase();
                const nameB = `${b.artist} - ${b.title}`.toLowerCase();
                return sortDirection === 'desc'
                    ? nameB.localeCompare(nameA)
                    : nameA.localeCompare(nameB);
            }

            // Default sort by date added (assumes newer beatmaps have higher IDs)
            return sortDirection === 'desc'
                ? b.id - a.id
                : a.id - b.id;
        });
    };

    // Funkcja przełączająca tryb sortowania
    const toggleSortMode = () => {
        if (sortMode === 'priority') setSortMode('name');
        else if (sortMode === 'name') setSortMode('date');
        else setSortMode('priority');
    };

    // Funkcja przełączająca kierunek sortowania
    const toggleSortDirection = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    return {
        sortMode,
        sortDirection,
        sortBeatmaps,
        toggleSortMode,
        toggleSortDirection
    };
};
