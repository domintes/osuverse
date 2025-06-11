'use client';

import React from 'react';
import UserCollectionsPanelContainer from './UserCollectionsPanelContainer';

/**
 * Główny komponent panelu kolekcji użytkownika
 * Ten komponent został zrefaktoryzowany, aby używać UserCollectionsPanelContainer
 * w celu lepszego zarządzania stanem z użyciem atomWithReducer
 */
export default function UserCollectionsPanel({ editMode }) {
  return <UserCollectionsPanelContainer editMode={editMode} />;
}
