'use client';

import React, { useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { collectionsAtom } from '@/store/collectionAtom';
import { selectedTagsAtom } from '@/store/selectedTagsAtom';
import { useBeatmapSort } from '@/components/UserCollections/hooks/useBeatmapSort';
import { groupTagsByCategory, extractTagsText, doesBeatmapMatchTags } from '@/utils/tagUtils';
import './userCollections.scss';

export default function UserCollectionsSection() {
  const [collections] = useAtom(collectionsAtom);
  const [globalTags] = useAtom(selectedTagsAtom);
  const { sortMode, sortDirection, sortBeatmaps, toggleSortMode, toggleSortDirection } = useBeatmapSort();
  const [expandedGroups, setExpandedGroups] = useState({});

  const collectionsById = useMemo(() => (
    (collections.collections || []).reduce((acc, c) => { acc[c.id] = c; return acc; }, {})
  ), [collections]);

  const grouped = useMemo(() => {
    const result = {};
    if (!collections?.beatmaps) return result;

    for (const bm of Object.values(collections.beatmaps)) {
      const colId = bm.collectionId || 'unknown';
      const subId = bm.subcollectionId || null;
      const colName = collectionsById[colId]?.name || 'Unsorted';
      const subName = subId ? (collectionsById[colId]?.subcollections?.find(s => s.id === subId)?.name || '') : '';

      const key = `${colId}__${subId || ''}`;
      if (!result[key]) result[key] = { key, collectionId: colId, subcollectionId: subId, collection: colName, subcollection: subName, items: [] };
      result[key].items.push(bm);
    }

    return result;
  }, [collections, collectionsById]);

  // Użyj tej samej logiki co w tagUtils (obsługuje zakresy Stars)
  const filterFn = (bm) => doesBeatmapMatchTags(bm, globalTags);

  const groups = useMemo(() => Object.values(grouped), [grouped]);

  // Stabilniejsza logika expand/collapse: domyślnie true i explicit boolean
  const toggleGroup = (key) => {
    setExpandedGroups(prev => {
      const current = prev[key];
      const next = current === false ? true : current === true ? false : false;
      return { ...prev, [key]: next };
    });
  };
  const isExpanded = (key) => expandedGroups[key] === undefined ? true : !!expandedGroups[key];

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
      <div className="section-toolbar" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <button className="sort-mode" onClick={toggleSortMode} title="Toggle sort mode">
          Sort: {sortMode}
        </button>
        <button className="sort-dir" onClick={toggleSortDirection} title="Toggle sort direction">
          Dir: {sortDirection}
        </button>
      </div>

      {groups.map(group => {
        const itemsFiltered = group.items.filter(filterFn);
        const itemsSorted = sortBeatmaps(itemsFiltered);
        const tagGroups = groupTagsByCategory(group.items);

        return (
          <div className="collection-group" key={group.key}>
            <div className="collection-group-header" onClick={() => toggleGroup(group.key)}>
              <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="collection-name">{group.collection}</span>
                {group.subcollection && <span className="subcollection-name">/ {group.subcollection}</span>}
                <span className="count">({itemsFiltered.length})</span>
              </div>
              <span className={`expander-arrow ${isExpanded(group.key) ? 'expanded' : ''}`} aria-hidden>⮟</span>
            </div>

            {isExpanded(group.key) && (
              <div className="collection-group-body">
                {/* Widok listy beatmap pogrupowanych po beatmapsecie */}
                {itemsSorted.length > 0 && (
                  <div className="beatmaps-list">
                    {(() => {
                      const bySet = itemsSorted.reduce((acc, bm) => {
                        const setKey = bm.setId || bm.beatmapset_id || `single_${bm.id}`;
                        if (!acc[setKey]) acc[setKey] = [];
                        acc[setKey].push(bm);
                        return acc;
                      }, {});

                      return Object.entries(bySet).map(([setKey, arr]) => {
                        if (arr.length === 1) {
                          const item = arr[0];
                          const setId = item.setId || item.beatmapset_id;
                          const cover = item.cover || (setId ? `https://assets.ppy.sh/beatmaps/${setId}/covers/list.jpg` : '/favicon.ico');
                          return (
                            <div className="beatmap-row" key={setKey} style={{ backgroundImage: `url(${cover})` }}>
                              <div className="row-overlay" />
                              <div className="row-content">
                                <div className="row-title">{item.artist} - {item.title}</div>
                                <div className="row-meta">
                                  <span className="mapper">mapped by {item.creator}</span>
                                  {typeof item.difficulty_rating === 'number' && (
                                    <span className="diff">[{item.version}] {(item.difficulty_rating).toFixed(2)}★</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        const first = arr[0];
                        const setId = first.setId || first.beatmapset_id;
                        const cover = first.cover || (setId ? `https://assets.ppy.sh/beatmaps/${setId}/covers/list.jpg` : '/favicon.ico');
                        const sortedDiffs = [...arr].sort((a, b) => (a.difficulty_rating || 0) - (b.difficulty_rating || 0));
                        return (
                          <div className="beatmapset-row" key={setKey} style={{ backgroundImage: `url(${cover})` }}>
                            <div className="row-overlay" />
                            <div className="row-content">
                              <div className="row-title">{first.artist} - {first.title}</div>
                              <div className="row-meta">
                                <span className="mapper">mapped by {first.creator}</span>
                                <div className="diff-chips">
                                  {sortedDiffs.map(diff => (
                                    <span className="chip" key={diff.id} title={`${diff.version} (${(diff.difficulty_rating || 0).toFixed(2)}★)`}>
                                      <span className="stars">{(diff.difficulty_rating || 0).toFixed(2)}★</span>
                                      <span className="version">[{diff.version}]</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
