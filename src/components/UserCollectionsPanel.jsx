'use client';

import React from 'react';
import NewUserCollectionsPanel from './NewUserCollectionsPanel';

/**
 * Główny komponent panelu kolekcji użytkownika
 * Używa nowego, przebudowanego komponentu NewUserCollectionsPanel
 * z zaawansowanymi funkcjami drag-and-drop, lock/unlock toggle,
 * smooth animations, column selector i osu!-style display
 */
export default function UserCollectionsPanel({ editMode }) {
  return <NewUserCollectionsPanel />;
}
