'use client';

import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { collectionsAtom } from '@/store/collectionAtom';
import './userCollections.scss';

// Prosta sekcja wyświetlająca beatmapy dodane przez użytkownika
// Kontrakt:
// - Czyta beatmapy z `collectionsAtom` (userCollections w localStorage)
// - Grupuje po kolekcji i (opcjonalnie) podkolekcji
// - Renderuje minimalistyczną listę z okładką, tytułem i mapperem
export default function UserCollectionsSection() {
  const [collections] = useAtom(collectionsAtom);

  const grouped = useMemo(() => {
    const result = {};
    if (!collections?.beatmaps) return result;

    const collectionsById = (collections.collections || []).reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});

    for (const bm of Object.values(collections.beatmaps)) {
      const colId = bm.collectionId || 'unknown';
      const subId = bm.subcollectionId || null;
      const colName = collectionsById[colId]?.name || 'Unsorted';
      const subName = subId ? (collectionsById[colId]?.subcollections?.find(s => s.id === subId)?.name || '') : '';

      const key = `${colName}__${subName || ''}`;
      if (!result[key]) result[key] = { collection: colName, subcollection: subName, items: [] };
      result[key].items.push(bm);
    }

    return result;
  }, [collections]);

  const groups = Object.values(grouped);

  if (!groups.length) {
    return (
      <div className="user-collections-section">
        <h2 className="panel-title collection-header-title">Your Collections</h2>
        <div className="empty-state">No beatmaps added yet.</div>
      </div>
    );
  }

  return (
    <div className="user-collections-section">
      <h2 className="panel-title collection-header-title">Your Collections</h2>
      {groups.map((group, gi) => (
        <div className="collection-group" key={gi}>
          <div className="collection-group-header">
            <span className="collection-name">{group.collection}</span>
            {group.subcollection && <span className="subcollection-name"> / {group.subcollection}</span>}
            <span className="count">{group.items.length}</span>
          </div>
          <div className="beatmaps-grid">
            {group.items.map(item => (
              <div className="beatmap-card" key={item.id}>
                <div
                  className="cover"
                  style={{
                    backgroundImage: `url(${item.cover || (item.setId ? `https://assets.ppy.sh/beatmaps/${item.setId}/covers/card.jpg` : '/favicon.ico')})`
                  }}
                />
                <div className="meta">
                  <div className="title">{item.artist} - {item.title}</div>
                  <div className="mapper">mapped by {item.creator}</div>
                  {typeof item.difficulty_rating === 'number' && (
                    <div className="diff">{item.version} ({item.difficulty_rating.toFixed(2)}★)</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
