'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  const [expandedSets, setExpandedSets] = useState({}); // expand/collapse per beatmapset

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
  const favoritesId = useMemo(() => (collections.collections || []).find(c => c.name === 'Favorites')?.id, [collections]);
  const toCheckId = useMemo(() => (collections.collections || []).find(c => c.name === 'To Check')?.id, [collections]);
  const normalGroups = useMemo(() => groups.filter(g => g.collectionId !== favoritesId && g.collectionId !== toCheckId), [groups, favoritesId, toCheckId]);
  const favGroup = useMemo(() => groups.find(g => g.collectionId === favoritesId), [groups, favoritesId]);
  const toCheckGroup = useMemo(() => groups.find(g => g.collectionId === toCheckId), [groups, toCheckId]);

  // Stabilniejsza logika expand/collapse: domyślnie true i explicit boolean
  const toggleGroup = (key) => {
    setExpandedGroups(prev => {
      const current = prev[key];
      const next = current === false ? true : current === true ? false : false;
      return { ...prev, [key]: next };
    });
  };
  const isExpanded = (key) => expandedGroups[key] === undefined ? true : !!expandedGroups[key];

  // Helpers to build osu! links (per official site URLs, not API endpoints)
  // beatmapset page: https://osu.ppy.sh/beatmapsets/{setId}
  // specific difficulty: https://osu.ppy.sh/beatmapsets/{setId}#{rulesetSlug}/{beatmapId}
  const getSetId = (bm) => bm.setId || bm.beatmapset_id || bm.beatmapsetId || bm.beatmapset?.id;
  const getBeatmapId = (bm) => bm.id || bm.beatmap_id || bm.beatmapId || bm.beatmap?.id;
  const getModeSlug = (bm) => {
    // 0: osu, 1: taiko, 2: fruits, 3: mania; default osu
    const rulesetId = typeof bm.ruleset_id === 'number' ? bm.ruleset_id : null;
    const modeInt = typeof bm.mode_int === 'number' ? bm.mode_int : (typeof bm.modeInt === 'number' ? bm.modeInt : rulesetId);
    let mode = bm.mode || bm.ruleset || (modeInt === 0 ? 'osu' : modeInt === 1 ? 'taiko' : modeInt === 2 ? 'fruits' : modeInt === 3 ? 'mania' : 'osu');
    // Normalize alias used by some libs
    if (mode === 'catch') mode = 'fruits';
    if (['osu', 'taiko', 'fruits', 'mania'].includes(mode)) return mode;
    return 'osu';
  };
  const openSetInNewTab = (bmOrSetId) => {
    const setId = typeof bmOrSetId === 'string' || typeof bmOrSetId === 'number' ? bmOrSetId : getSetId(bmOrSetId);
    if (!setId) return;
    const url = `https://osu.ppy.sh/beatmapsets/${setId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const openDifficultyInNewTab = (bm) => {
    const setId = getSetId(bm);
    const beatmapId = getBeatmapId(bm);
    const mode = getModeSlug(bm);
    if (!setId) {
      if (beatmapId) {
        const direct = `https://osu.ppy.sh/beatmaps/${beatmapId}`;
        window.open(direct, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    const url = beatmapId
      ? `https://osu.ppy.sh/beatmapsets/${setId}#${mode}/${beatmapId}`
      : `https://osu.ppy.sh/beatmapsets/${setId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Prefer list-type covers for list layout (Beatmapset.covers.list), with robust fallbacks
  const getSetCoverListUrl = (bmOrSet) => {
    const setId = getSetId(bmOrSet);
    // Try structured covers first
    const covers = bmOrSet?.covers || bmOrSet?.beatmapset?.covers;
    if (covers?.list) return covers.list;
    if (covers?.card) return covers.card; // acceptable fallback if list not present
    // Try constructing from known pattern
    if (setId) return `https://assets.ppy.sh/beatmaps/${setId}/covers/list.jpg`;
    // Try converting existing single cover url if present
    const existing = bmOrSet?.cover || bmOrSet?.beatmapset?.covers?.cover;
    if (typeof existing === 'string') {
      if (existing.includes('/covers/cover')) return existing.replace('/covers/cover', '/covers/list');
      if (existing.includes('/covers/card')) return existing.replace('/covers/card', '/covers/list');
      if (existing.includes('/covers/slimcover')) return existing.replace('/covers/slimcover', '/covers/list');
    }
    return '/favicon.ico';
  };

  // Debug log: list beatmapsets present in User Collections
  useEffect(() => {
    try {
      const setMap = new Map();
      Object.values(grouped).forEach(g => {
        (g.items || []).forEach(bm => {
          const sid = getSetId(bm);
          if (!sid) return;
          const entry = setMap.get(sid) || {
            id: sid,
            title: bm.title,
            artist: bm.artist,
            creator: bm.creator,
            cover_list: getSetCoverListUrl(bm),
            beatmaps: [],
          };
          entry.beatmaps.push({ id: getBeatmapId(bm), version: bm.version, sr: bm.difficulty_rating, mode: getModeSlug(bm) });
          setMap.set(sid, entry);
        });
      });
      const summary = Array.from(setMap.values());
      // eslint-disable-next-line no-console
      console.log('User Collections: beatmapsets', summary);
    } catch {}
  }, [grouped]);

  const toggleSet = (setId) => setExpandedSets(prev => ({ ...prev, [setId]: !prev[setId] }));
  const isSetExpanded = (setId) => !!expandedSets[setId];

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

      {/* Special sections */}
      {favGroup && (
        <div className="collection-group" key="special_fav">
          <div className="collection-group-header" onClick={() => toggleGroup('special_fav')}>
            <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="collection-name">Favourites Beatmaps</span>
              <span className="count">({(favGroup.items||[]).filter(filterFn).length})</span>
            </div>
            <span className={`expander-arrow ${isExpanded('special_fav') ? 'expanded' : ''}`} aria-hidden>⮟</span>
          </div>
          {isExpanded('special_fav') && (
            <div className="collection-group-body">
              {/* reuse existing renderer by temporarily mapping favGroup to expected shape */}
              {/* Render beatmaps grouped by set as in the default map below */}
              {/* We inline same logic by setting group variable */}
              {(() => { const group = favGroup; const itemsFiltered = group.items.filter(filterFn); const itemsSorted = sortBeatmaps(itemsFiltered); const tagGroups = groupTagsByCategory(group.items); return (
                <div className="beatmaps-list">
                  {(() => {
                    const bySet = itemsSorted.reduce((acc, bm) => { const setKey = getSetId(bm) || `single_${bm.id}`; if (!acc[setKey]) acc[setKey] = []; acc[setKey].push(bm); return acc; }, {});
                    return Object.entries(bySet).map(([setKey, arr]) => {
                      if (arr.length === 1) {
                        const item = arr[0];
                        const cover = getSetCoverListUrl(item);
                        return (
                          <div className={`beatmap-row ${editMode ? 'draggable' : ''}`} key={`fav_${setKey}`} style={{ backgroundImage: `url(${cover})` }} data-beatmap-id={item.id} onClick={(e) => { if (editMode) return; openDifficultyInNewTab(item); }}>
                            <div className="row-overlay" />
                            <div className="row-content">
                              <div className="row-title">{item.artist} - {item.title}</div>
                              <div className="row-meta"><span className="mapper">mapped by {item.creator}</span>{typeof item.difficulty_rating === 'number' && (<span className="diff">[{item.version}] {(item.difficulty_rating).toFixed(2)}★</span>)}</div>
                            </div>
                          </div>
                        );
                      }
                      const first = arr[0];
                      const setId = getSetId(first);
                      const cover = getSetCoverListUrl(first);
                      const sortedDiffs = [...arr].sort((a, b) => (a.difficulty_rating || 0) - (b.difficulty_rating || 0));
                      return (
                        <div className="beatmapset-row" key={`favset_${setKey}`} style={{ backgroundImage: `url(${cover})` }} onClick={(e) => { if (editMode) return; openSetInNewTab(setId); }}>
                          <div className="row-overlay" />
                          <div className="row-content">
                            <div className="row-title">{first.artist} - {first.title}</div>
                            <div className="row-meta"><span className="mapper">mapped by {first.creator}</span></div>
                          </div>
                        </div>
                      );
                    }); })()}
                </div>
              ); })()}
            </div>
          )}
        </div>
      )}
      {toCheckGroup && (
        <div className="collection-group" key="special_check">
          <div className="collection-group-header" onClick={() => toggleGroup('special_check')}>
            <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="collection-name">Beatmaps to Check</span>
              <span className="count">({(toCheckGroup.items||[]).filter(filterFn).length})</span>
            </div>
            <span className={`expander-arrow ${isExpanded('special_check') ? 'expanded' : ''}`} aria-hidden>⮟</span>
          </div>
          {isExpanded('special_check') && (
            <div className="collection-group-body">
              {(() => { const group = toCheckGroup; const itemsFiltered = group.items.filter(filterFn); const itemsSorted = sortBeatmaps(itemsFiltered); return (
                <div className="beatmaps-list">
                  {itemsSorted.map((item) => { const cover = getSetCoverListUrl(item); return (
                    <div className={`beatmap-row`} key={`check_${item.id}`} style={{ backgroundImage: `url(${cover})` }} data-beatmap-id={item.id} onClick={(e) => { if (editMode) return; openDifficultyInNewTab(item); }}>
                      <div className="row-overlay" />
                      <div className="row-content">
                        <div className="row-title">{item.artist} - {item.title}</div>
                        <div className="row-meta"><span className="mapper">mapped by {item.creator}</span>{typeof item.difficulty_rating === 'number' && (<span className="diff">[{item.version}] {(item.difficulty_rating).toFixed(2)}★</span>)}</div>
                      </div>
                    </div>
                  ); })}
                </div>
              ); })()}
            </div>
          )}
        </div>
      )}

      {normalGroups.map(group => {
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
                        const setKey = getSetId(bm) || `single_${bm.id}`;
                        if (!acc[setKey]) acc[setKey] = [];
                        acc[setKey].push(bm);
                        return acc;
                      }, {});

                      return Object.entries(bySet).map(([setKey, arr]) => {
                        if (arr.length === 1) {
                          const item = arr[0];
                          const setId = getSetId(item);
                          const cover = getSetCoverListUrl(item);
                          return (
                            <div
                              className={`beatmap-row ${editMode ? 'draggable' : ''}`}
                              key={setKey}
                              style={{ backgroundImage: `url(${cover})` }}
                              data-beatmap-id={item.id}
                              draggable={editMode}
                              onClick={(e) => {
                                if (editMode) return; // w trybie edycji klik nie otwiera linku
                                openDifficultyInNewTab(item);
                              }}
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
                                <div className="drag-handle" title="Drag to reorder or move" onClick={(e) => e.stopPropagation()}>
                                  <GiHamburgerMenu />
                                </div>
                              )}
                            </div>
                          );
                        }

                        const first = arr[0];
                        const setId = getSetId(first);
                        const cover = getSetCoverListUrl(first);
                        const sortedDiffs = [...arr].sort((a, b) => (a.difficulty_rating || 0) - (b.difficulty_rating || 0));
                        return (
                          <React.Fragment key={setKey}>
                            <div
                              className={`beatmapset-row ${editMode ? 'draggable' : ''}`}
                              style={{ backgroundImage: `url(${cover})` }}
                              data-beatmapset-id={setId}
                              onClick={(e) => {
                                if (editMode) return;
                                openSetInNewTab(setId);
                              }}
                              onDragOver={(e) => editMode && e.preventDefault()}
                              onDrop={(e) => {
                                if (!editMode) return;
                                e.preventDefault();
                                try {
                                  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                                  if (data.type === 'beatmap') {
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
                                  {!isSetExpanded(setId) && (
                                    <div className="diff-chips">
                                      {sortedDiffs.map(diff => (
                                        <span className="chip" key={diff.id} title={`${diff.version} (${(diff.difficulty_rating || 0).toFixed(2)}★)`}>
                                          <span className="stars">{(diff.difficulty_rating || 0).toFixed(2)}★</span>
                                          <span className="version">[{diff.version}]</span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                className={`set-expander-arrow ${isSetExpanded(setId) ? 'expanded' : ''}`}
                                title={isSetExpanded(setId) ? 'Collapse difficulties' : 'Expand difficulties'}
                                onClick={(e) => { e.stopPropagation(); toggleSet(setId); }}
                                aria-label="Toggle difficulties"
                              >
                                ⮟
                              </button>
                              {editMode && (
                                <div className="drag-handle" title="Drag to move" onClick={(e) => e.stopPropagation()}>
                                  <GiHamburgerMenu />
                                </div>
                              )}
                            </div>
                            {isSetExpanded(setId) && (
                              <div className="beatmapset-diffs">
                                {sortedDiffs.map((item) => {
                                  const coverItem = getSetCoverListUrl(item);
                                  return (
                                    <div
                                      className={`diff-row ${editMode ? 'draggable' : ''}`}
                                      key={`diff_${item.id}`}
                                      style={{ backgroundImage: `url(${coverItem})` }}
                                      data-beatmap-id={item.id}
                                      draggable={editMode}
                                      onClick={(e) => {
                                        if (editMode) return;
                                        openDifficultyInNewTab(item);
                                      }}
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
                                        <div className="row-meta" style={{ justifyContent: 'space-between' }}>
                                          <span className="diff">[{item.version}] {(item.difficulty_rating || 0).toFixed(2)}★</span>
                                          <span className="mapper">{item.creator}</span>
                                        </div>
                                      </div>
                                      {editMode && (
                                        <div className="drag-handle" title="Drag to reorder or move" onClick={(e) => e.stopPropagation()}>
                                          <GiHamburgerMenu />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </React.Fragment>
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
