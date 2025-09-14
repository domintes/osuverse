'use client';

import { useState } from 'react';

/**
 * Hook do zarządzania sortowaniem beatmap
 */
export const useBeatmapSort = () => {
    const [sortMode, setSortMode] = useState('date'); // 'priority', 'name', 'date', 'custom'
    const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'

    // Funkcja sortująca beatmapy według różnych kryteriów
    const sortBeatmaps = (beatmaps) => {
        // Custom order ignores direction (honors stored order)
        if (sortMode === 'custom') {
            return [...beatmaps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }

        return [...beatmaps].sort((a, b) => {
            if (sortMode === 'priority') {
                const priorityA = a.beatmap_priority || 0;
                const priorityB = b.beatmap_priority || 0;
                if (priorityA !== priorityB) {
                    return sortDirection === 'desc'
                        ? priorityB - priorityA
                        : priorityA - priorityB;
                }
                // Tie-breaker: addedAt (date)
                const dateA = a.addedAt ?? a.id ?? 0;
                const dateB = b.addedAt ?? b.id ?? 0;
                return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
            }

            if (sortMode === 'name') {
                const nameA = `${a.artist} - ${a.title}`.toLowerCase();
                const nameB = `${b.artist} - ${b.title}`.toLowerCase();
                return sortDirection === 'desc'
                    ? nameB.localeCompare(nameA)
                    : nameA.localeCompare(nameB);
            }

            // Default or 'date' sort by addedAt fall back to id
            const dateA = a.addedAt ?? a.id ?? 0;
            const dateB = b.addedAt ?? b.id ?? 0;
            return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
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
        toggleSortDirection,
        setSortMode,
        setSortDirection
    };
};
