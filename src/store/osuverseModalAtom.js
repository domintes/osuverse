import { atomWithStorage } from 'jotai/utils';

// Przechowuje stan wszystkich modali (otwarte/zamknięte, dane formularzy, itp.)
export const osuverseModalAtom = atomWithStorage('osuverseModals', {});
