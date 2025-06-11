'use client';

import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { useEffect } from 'react';
import { useAtom } from 'jotai';

// Atom family dla beatmap - tworzy indywidualny atom dla każdej beatmapy
export const beatmapAtomFamily = atomFamily(
  (beatmapId) => atom({
    id: beatmapId,
    loading: true,
    data: null,
    error: null
  }),
  (a, b) => a === b
);

// Atom do przechowywania wszystkich danych beatmap (jako obiekt)
export const beatmapDataStoreAtom = atom({});

// Atom przechowujący listę wszystkich załadowanych beatmap
export const allBeatmapsIdsAtom = atom([]);

// Atom do aktualizacji danych beatmapy 
export const setBeatmapDataAtom = atom(
  null, // getter nie jest nam potrzebny
  (get, set, { beatmapId, data }) => {
    // Zaktualizuj konkretny atom beatmapy
    set(beatmapAtomFamily(beatmapId), {
      id: beatmapId,
      loading: false,
      data,
      error: null
    });
    
    // Zaktualizuj magazyn wszystkich danych
    set(beatmapDataStoreAtom, prev => ({
      ...prev,
      [beatmapId]: data
    }));
    
    // Upewnij się, że ID jest na liście
    const existingIds = get(allBeatmapsIdsAtom);
    if (!existingIds.includes(beatmapId)) {
      set(allBeatmapsIdsAtom, [...existingIds, beatmapId]);
    }
  }
);

// Atom z wszystkimi obiektami beatmap - pobiera dane automatycznie
export const allBeatmapsDataAtom = atom((get) => {
  const allIds = get(allBeatmapsIdsAtom);
  return allIds.map(id => get(beatmapAtomFamily(id)));
});

// Atom selektora do filtrowania beatmap
export const beatmapsFilterAtom = atom({
  difficulty: null, // null = wszystkie, lub wartość liczbowa
  mode: null, // null = wszystkie, lub 'osu', 'mania', 'taiko', 'fruits'
  bpm: { min: null, max: null },
  length: { min: null, max: null },
  searchTerm: '',
});

// Atom do sortowania beatmap
export const beatmapsSortAtom = atom({
  field: 'difficulty_rating', // pole do sortowania
  direction: 'desc', // 'asc' lub 'desc'
});

// Atom zwracający filtrowane beatmapy
export const filteredBeatmapsAtom = atom((get) => {
  const beatmaps = get(allBeatmapsDataAtom);
  const filters = get(beatmapsFilterAtom);
  
  return beatmaps.filter(beatmap => {
    const data = beatmap.data;
    if (!data) return false;

    // Filtrowanie po trudności
    if (filters.difficulty && data.difficulty_rating < filters.difficulty) {
      return false;
    }

    // Filtrowanie po trybie gry
    if (filters.mode && data.mode !== filters.mode) {
      return false;
    }

    // Filtrowanie po BPM
    if (filters.bpm.min && data.bpm < filters.bpm.min) {
      return false;
    }
    if (filters.bpm.max && data.bpm > filters.bpm.max) {
      return false;
    }

    // Filtrowanie po długości
    if (filters.length.min && data.total_length < filters.length.min) {
      return false;
    }
    if (filters.length.max && data.total_length > filters.length.max) {
      return false;
    }

    // Filtrowanie po wyszukiwanym terminie
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const titleMatches = data.title?.toLowerCase().includes(searchTerm);
      const artistMatches = data.artist?.toLowerCase().includes(searchTerm);
      const versionMatches = data.version?.toLowerCase().includes(searchTerm);
      
      if (!(titleMatches || artistMatches || versionMatches)) {
        return false;
      }
    }

    return true;
  });
});

// Atom zwracający sortowane i filtrowane beatmapy
export const sortedAndFilteredBeatmapsAtom = atom((get) => {
  const beatmaps = get(filteredBeatmapsAtom);
  const sort = get(beatmapsSortAtom);
  
  return [...beatmaps].sort((a, b) => {
    const aValue = a.data?.[sort.field];
    const bValue = b.data?.[sort.field];

    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    // Sortowanie stringów
    if (typeof aValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sort.direction === 'asc' ? comparison : -comparison;
    }
    
    // Sortowanie liczb
    const comparison = aValue - bValue;
    return sort.direction === 'asc' ? comparison : -comparison;
  });
});

// Funkcja pomocnicza do ładowania pojedynczej beatmapy
export const loadBeatmap = async (beatmapId, setBeatmap) => {
  setBeatmap(beatmapId, {
    id: beatmapId,
    loading: true,
    data: null,
    error: null
  });

  try {
    const response = await fetch(`/api/beatmaps/${beatmapId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch beatmap: ${response.status}`);
    }
    
    const data = await response.json();
    
    setBeatmap(beatmapId, {
      id: beatmapId,
      loading: false,
      data,
      error: null
    });
    
    return data;
  } catch (error) {
    setBeatmap(beatmapId, {
      id: beatmapId,
      loading: false,
      data: null,
      error: error.message
    });
    
    return null;
  }
};

// Hook do pobierania danych beatmap
export const useBeatmap = (beatmapId) => {
  const [beatmap, setBeatmap] = useAtom(beatmapAtomFamily(beatmapId));
  const [allIds, setAllIds] = useAtom(allBeatmapsIdsAtom);

  useEffect(() => {
    // Dodaj ID do listy wszystkich beatmap, jeśli jeszcze nie istnieje
    if (!allIds.includes(beatmapId)) {
      setAllIds(prev => [...prev, beatmapId]);
    }
    
    // Załaduj beatmapę jeśli jeszcze nie została załadowana
    if (!beatmap.data && !beatmap.loading && !beatmap.error) {
      loadBeatmap(beatmapId, setBeatmap);
    }
  }, [beatmapId, allIds, beatmap, setAllIds, setBeatmap]);

  return beatmap;
};
