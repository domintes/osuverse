'use client';

import React, { useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { collectionsAtom } from '@/store/collectionAtom';
import { selectedTagsAtom } from '@/store/selectedTagsAtom';
import { useBeatmapSort } from '@/components/UserCollections/hooks/useBeatmapSort';
import { groupTagsByCategory, extractTagsText } from '@/utils/tagUtils';
import './userCollections.scss';

export default function UserCollectionsSection() {
  const [collections] = useAtom(collectionsAtom);
  const [globalTags] = useAtom(selectedTagsAtom);
  const { sortMode, sortDirection, sortBeatmaps, toggleSortMode, toggleSortDirection } = useBeatmapSort();
  const [expandedGroups, setExpandedGroups] = useState({});
  const [localActiveTags, setLocalActiveTags] = useState([]);

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

  const filterFn = (bm) => {
    const active = [...globalTags, ...localActiveTags].map(t => String(t).toLowerCase());
    if (active.length === 0) return true;

    const artist = (bm.artist || '').toLowerCase();
    const mapper = (bm.creator || '').toLowerCase();
    const tags = extractTagsText(bm.userTags || []).map(t => String(t).toLowerCase());

    return active.every(tag => artist === tag || mapper === tag || tags.includes(tag));
  };

  const groups = useMemo(() => Object.values(grouped), [grouped]);

  const toggleGroup = (key) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  const isExpanded = (key) => expandedGroups[key] !== false; // domyślnie otwarty

  const toggleLocalTag = (tag) => {
    setLocalActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

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
        {localActiveTags.length > 0 && (
          <div className="active-tags" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {localActiveTags.map(t => (
              <span key={t} className="tag-chip active" onClick={() => toggleLocalTag(t)}>#{t} ×</span>
            ))}
          </div>
        )}
      </div>

      {groups.map(group => {
        const itemsFiltered = group.items.filter(filterFn);
        const itemsSorted = sortBeatmaps(itemsFiltered);
        const tagGroups = groupTagsByCategory(group.items);

        return (
          <div className="collection-group" key={group.key}>
            <div className="collection-group-header" onClick={() => toggleGroup(group.key)} style={{ cursor: 'pointer' }}>
              <span className="collection-name">{group.collection}</span>
              {group.subcollection && <span className="subcollection-name"> / {group.subcollection}</span>}
              <span className="count">{itemsFiltered.length}</span>
              <span className="expander">{isExpanded(group.key) ? '−' : '+'}</span>
            </div>

            {isExpanded(group.key) && (
              <div className="collection-group-body">
                {/* Sekcje tagów */}
                <div className="tags-sections" style={{ marginBottom: 12 }}>
                  {/* User Tags */}
                  <div className="tags-section">
                    <div className="tags-title">User Tags</div>
                    <div className="tags-list">
                      {Object.entries(tagGroups['User Tags'] || {}).map(([tag, count]) => (
                        <span
                          key={tag}
                          className={`tag-chip ${localActiveTags.includes(tag) ? 'active' : ''}`}
                          onClick={() => toggleLocalTag(tag)}
                          title={`#${tag} (${count})`}
                        >
                          #{tag} ({count})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Artists */}
                  <div className="tags-section">
                    <div className="tags-title">Artists</div>
                    <div className="tags-list">
                      {Object.entries(tagGroups['Artists'] || {}).map(([artist, count]) => (
                        <span
                          key={artist}
                          className={`tag-chip ${localActiveTags.includes(artist) ? 'active' : ''}`}
                          onClick={() => toggleLocalTag(artist)}
                          title={`${artist} (${count})`}
                        >
                          #{artist} ({count})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lista beatmap */}
                {itemsSorted.length === 0 ? (
                  <div className="empty-state">No beatmaps match selected tags.</div>
                ) : (
                  <div className="beatmaps-grid">
                    {itemsSorted.map(item => (
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
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
