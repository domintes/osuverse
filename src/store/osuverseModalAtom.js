import { atomWithStorage } from 'jotai/utils';

// Stores the state of all modals (open/closed, form data, etc.)
export const osuverseModalAtom = atomWithStorage('osuverseModals', {});
