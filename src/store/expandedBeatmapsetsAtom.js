import { atom } from 'jotai';

/**
 * Atom przechowujący informacje o rozwiniętych beatmapsetach
 * 
 * Format:
 * {
 *   [beatmapsetId]: boolean, // true = rozwinięty, false = zwinięty
 * }
 */
export const expandedBeatmapsetsAtom = atom({});

/**
 * Atom wczytujący zapisany stan rozwinięcia z localStorage przy inicjalizacji
 */
export const persistedExpandedBeatmapsetsAtom = atom(
  (get) => get(expandedBeatmapsetsAtom),
  (get, set, newState) => {
    set(expandedBeatmapsetsAtom, newState);
    
    // Zapisz stan w localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('expandedBeatmapsets', JSON.stringify(newState));
    }
  }
);

/**
 * Funkcja do inicjalizacji stanu z localStorage (wywoływana przy starcie aplikacji)
 */
export const initExpandedBeatmapsets = () => {
  if (typeof window !== 'undefined') {
    try {
      const savedState = localStorage.getItem('expandedBeatmapsets');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Error loading expandedBeatmapsets from localStorage:', error);
    }
  }
  
  return {}; // Domyślny pusty stan
};
