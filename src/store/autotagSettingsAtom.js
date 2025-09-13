"use client";

import { atomWithStorage } from 'jotai/utils';

export const autotagSettingsAtom = atomWithStorage('autotagSettings', {
  Artists: true,
  Mappers: true,
  Difficulty: true,
  'Ranked Status': true,
  AR: true,
  CS: true,
  OD: true,
  HP: true
});
