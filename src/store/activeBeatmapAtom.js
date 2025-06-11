import { atom } from 'jotai';

// Stan przechowujący ID beatmapy, do której należy przewinąć
export const activeBeatmapIdAtom = atom(null);

// Stan określający czy beatmapa powinna być podświetlona
export const highlightBeatmapAtom = atom(false);
