'use client';

import React, { useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { collectionsAtom } from '@/store/collectionAtom';
import { selectedTagsAtom } from '@/store/selectedTagsAtom';
import { useBeatmapSort } from '@/components/UserCollections/hooks/useBeatmapSort';
import { groupTagsByCategory, extractTagsText, doesBeatmapMatchTags } from '@/utils/tagUtils';
import './userCollections.scss';
import { GiHamburgerMenu } from 'react-icons/gi';
import { useAtom as useReducerAtom } from 'jotai';
import { collectionsReducerAtom } from '@/store/collectionsReducerAtom';
import { reorderBeatmaps, moveBeatmap } from '@/store/reducers/actions';

export default function UserCollectionsSection({ editMode = false }) {
  const [collections] = useAtom(collectionsAtom);
  const [globalTags] = useAtom(selectedTagsAtom);
  const { sortMode, sortDirection, sortBeatmaps, toggleSortMode, toggleSortDirection } = useBeatmapSort();
  const [expandedGroups, setExpandedGroups] = useState({});
  const [state, dispatch] = useReducerAtom(collectionsReducerAtom);

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
      <SortToolbar sortMode={sortMode} sortDirection={sortDirection} setModeDir={{ toggleSortMode, toggleSortDirection }} />

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
                            <div
                              className={`beatmap-row ${editMode ? 'draggable' : ''}`}
                              key={setKey}
                              style={{ backgroundImage: `url(${cover})` }}
                              data-beatmap-id={item.id}
                              draggable={editMode}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'beatmap', id: item.id, collectionId: item.collectionId || group.collectionId, subcollectionId: item.subcollectionId || group.subcollectionId }));
                              }}
                              onDragOver={(e) => editMode && e.preventDefault()}
                              onDrop={(e) => {
                                if (!editMode) return;
                                e.preventDefault();
                                try {
                                  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                                  if (data.type === 'beatmap' && data.id !== item.id) {
                                    if (data.collectionId === (item.collectionId || group.collectionId) && (data.subcollectionId || null) === (item.subcollectionId || group.subcollectionId || null)) {
                                      dispatch(reorderBeatmaps(group.collectionId, group.subcollectionId || null, data.id, item.id));
                                    } else {
                                      dispatch(moveBeatmap(data.id, group.collectionId, group.subcollectionId || null));
                                    }
                                  }
                                } catch {}
                              }}
                            >
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
                              {editMode && (
                                <div className="drag-handle" title="Drag to reorder or move">
                                  <GiHamburgerMenu />
                                </div>
                              )}
                            </div>
                          );
                        }

                        const first = arr[0];
                        const setId = first.setId || first.beatmapset_id;
                        const cover = first.cover || (setId ? `https://assets.ppy.sh/beatmaps/${setId}/covers/list.jpg` : '/favicon.ico');
                        const sortedDiffs = [...arr].sort((a, b) => (a.difficulty_rating || 0) - (b.difficulty_rating || 0));
                        return (
                          <div
                            className={`beatmapset-row ${editMode ? 'draggable' : ''}`}
                            key={setKey}
                            style={{ backgroundImage: `url(${cover})` }}
                            data-beatmapset-id={setId}
                            onDragOver={(e) => editMode && e.preventDefault()}
                            onDrop={(e) => {
                              if (!editMode) return;
                              e.preventDefault();
                              try {
                                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                                if (data.type === 'beatmap') {
                                  // upuszczenie na beatmapset (multi) wrzuca beatmapę do tego samego setu/grupy
                                  dispatch(moveBeatmap(data.id, group.collectionId, group.subcollectionId || null));
                                }
                              } catch {}
                            }}
                          >
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
                            {editMode && (
                              <div className="drag-handle" title="Drag to move">
                                <GiHamburgerMenu />
                              </div>
                            )}
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

function SortToolbar({ sortMode, sortDirection, setModeDir }) {
  const [mode, setMode] = useState(sortMode);
  const [dir, setDir] = useState(sortDirection);
  return (
    <div className="section-toolbar" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
      <span style={{ color: '#b8a6c1' }}>Sort by:</span>
      <select
        value={mode}
        onChange={(e) => {
          const val = e.target.value;
          setMode(val);
          // Directly set sort mode where available
          if (setModeDir.setSortMode) setModeDir.setSortMode(val);
        }}
        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(234,129,251,0.35)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
      >
        <option value="date">Added Date</option>
        <option value="priority">Priority</option>
        <option value="name">Name</option>
        <option value="custom">Custom (drag & drop)</option>
      </select>
      <button
        type="button"
        onClick={() => {
          const next = dir === 'asc' ? 'desc' : 'asc';
          setDir(next);
          if (setModeDir.setSortDirection) setModeDir.setSortDirection(next);
        }}
        title="Toggle direction"
        style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ea81fb', background: 'rgba(234,129,251,0.25)', color: '#fff' }}
      >
        {dir === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  );
}
