'use client';

/**
 * Coolections Page - Modern beatmap collection viewer
 * 
 * Features:
 * - Grid and List view modes (similar to osu.ppy.sh)
 * - Random beatmap picker (similar to randrop.io)
 * - Filter by Favorites, To Check, or specific collections
 * - Expandable beatmapsets with difficulty lists
 * - Direct links to osu.ppy.sh
 * 
 * @component
 */

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { collectionsAtom } from '@/store/collectionAtom';
import { Heart, Shuffle, Filter, Grid, List, ChevronDown, Star, Clock, Play } from 'lucide-react';
import './coolections.scss';
import Link from 'next/link';

export default function Coolections() {
  const [collections] = useAtom(collectionsAtom);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'favorites' | 'tocheck'
  const [randomBeatmap, setRandomBeatmap] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Get all beatmaps from collections
  const allBeatmaps = Object.values(collections?.beatmaps || {});
  
  // Filter beatmaps based on selected collection
  const filteredBeatmaps = selectedCollection
    ? allBeatmaps.filter(bm => bm.collectionId === selectedCollection.id)
    : filterMode === 'favorites'
    ? allBeatmaps.filter(bm => {
        const favCollection = collections?.collections?.find(c => c.name === 'Favorites');
        return bm.collectionId === favCollection?.id;
      })
    : filterMode === 'tocheck'
    ? allBeatmaps.filter(bm => {
        const toCheckCollection = collections?.collections?.find(c => c.name === 'To Check');
        return bm.collectionId === toCheckCollection?.id;
      })
    : allBeatmaps;

  // Group beatmaps by beatmapset
  const beatmapsBySet = filteredBeatmaps.reduce((acc, bm) => {
    const setId = bm.setId || bm.beatmapset_id || bm.beatmapsetId || `single_${bm.id}`;
    if (!acc[setId]) {
      acc[setId] = {
        setId,
        title: bm.title,
        artist: bm.artist,
        creator: bm.creator,
        cover: bm.cover || bm.covers?.list || bm.covers?.card,
        difficulties: []
      };
    }
    acc[setId].difficulties.push(bm);
    return acc;
  }, {});

  const beatmapSets = Object.values(beatmapsBySet);

  // Random beatmap functionality (like randrop.io)
  const handleShuffle = () => {
    if (filteredBeatmaps.length === 0) return;
    
    setIsShuffling(true);
    const randomIndex = Math.floor(Math.random() * filteredBeatmaps.length);
    const selected = filteredBeatmaps[randomIndex];
    
    setTimeout(() => {
      setRandomBeatmap(selected);
      setIsShuffling(false);
    }, 500);
  };

  const openBeatmapInNewTab = (beatmap) => {
    const setId = beatmap.setId || beatmap.beatmapset_id || beatmap.beatmapsetId;
    const beatmapId = beatmap.id || beatmap.beatmap_id;
    const mode = beatmap.mode || 'osu';
    
    if (setId && beatmapId) {
      window.open(`https://osu.ppy.sh/beatmapsets/${setId}#${mode}/${beatmapId}`, '_blank');
    } else if (beatmapId) {
      window.open(`https://osu.ppy.sh/beatmaps/${beatmapId}`, '_blank');
    }
  };

  const openSetInNewTab = (setId) => {
    if (setId) {
      window.open(`https://osu.ppy.sh/beatmapsets/${setId}`, '_blank');
    }
  };

  return (
    <div className="coolections-page">
      <div className="coolections-container">
        {/* Header */}
        <div className="coolections-header">
          <div className="header-content">
            <h1 className="page-title">
              <Heart className="title-icon" />
              Coolections
            </h1>
            <p className="page-subtitle">Your curated beatmap collections</p>
          </div>

          {/* Controls */}
          <div className="coolections-controls">
            <div className="control-group">
              <button
                className={`control-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                className={`control-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>

            <div className="control-group">
              <button
                className={`control-btn shuffle-btn ${isShuffling ? 'shuffling' : ''}`}
                onClick={handleShuffle}
                title="Random beatmap"
              >
                <Shuffle size={18} />
                <span>Random</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${!selectedCollection && filterMode === 'all' ? 'active' : ''}`}
              onClick={() => { setSelectedCollection(null); setFilterMode('all'); }}
            >
              <span>All Beatmaps</span>
              <span className="count">{allBeatmaps.length}</span>
            </button>
            <button
              className={`filter-tab ${filterMode === 'favorites' ? 'active' : ''}`}
              onClick={() => { setSelectedCollection(null); setFilterMode('favorites'); }}
            >
              <Heart size={16} />
              <span>Favorites</span>
              <span className="count">
                {allBeatmaps.filter(bm => {
                  const favCollection = collections?.collections?.find(c => c.name === 'Favorites');
                  return bm.collectionId === favCollection?.id;
                }).length}
              </span>
            </button>
            <button
              className={`filter-tab ${filterMode === 'tocheck' ? 'active' : ''}`}
              onClick={() => { setSelectedCollection(null); setFilterMode('tocheck'); }}
            >
              <Clock size={16} />
              <span>To Check</span>
              <span className="count">
                {allBeatmaps.filter(bm => {
                  const toCheckCollection = collections?.collections?.find(c => c.name === 'To Check');
                  return bm.collectionId === toCheckCollection?.id;
                }).length}
              </span>
            </button>
          </div>

          {/* Collections dropdown */}
          <div className="collections-selector">
            <Filter size={16} />
            <select
              value={selectedCollection?.id || ''}
              onChange={(e) => {
                const collection = collections?.collections?.find(c => c.id === e.target.value);
                setSelectedCollection(collection || null);
                setFilterMode('all');
              }}
            >
              <option value="">All Collections</option>
              {collections?.collections
                ?.filter(c => !c.isSystemCollection)
                ?.map(collection => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Random Beatmap Display */}
        {randomBeatmap && (
          <div className="random-beatmap-card">
            <div className="random-card-header">
              <h3>🎲 Random Pick</h3>
              <button className="close-btn" onClick={() => setRandomBeatmap(null)}>×</button>
            </div>
            <div
              className="random-card-content"
              style={{
                backgroundImage: `url(${randomBeatmap.cover || randomBeatmap.covers?.card})`,
              }}
            >
              <div className="random-overlay" />
              <div className="random-info">
                <h4 className="random-title">{randomBeatmap.title}</h4>
                <p className="random-artist">{randomBeatmap.artist}</p>
                <p className="random-mapper">mapped by {randomBeatmap.creator}</p>
                {randomBeatmap.difficulty_rating && (
                  <div className="random-stats">
                    <Star size={16} />
                    <span>{randomBeatmap.difficulty_rating.toFixed(2)}★</span>
                    {randomBeatmap.version && <span className="version">[{randomBeatmap.version}]</span>}
                  </div>
                )}
                <button
                  className="play-btn"
                  onClick={() => openBeatmapInNewTab(randomBeatmap)}
                >
                  <Play size={16} />
                  Open in osu!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Beatmap Sets Grid/List */}
        <div className={`beatmaps-container ${viewMode}-view`}>
          {beatmapSets.length === 0 ? (
            <div className="empty-state">
              <Heart size={48} className="empty-icon" />
              <h3>No beatmaps found</h3>
              <p>Add some beatmaps to your collections to see them here!</p>
              <Link href="/collections" className="add-link">
                Go to Collections
              </Link>
            </div>
          ) : (
            beatmapSets.map((set) => (
              <BeatmapSetCard
                key={set.setId}
                set={set}
                viewMode={viewMode}
                onOpenSet={() => openSetInNewTab(set.setId)}
                onOpenBeatmap={openBeatmapInNewTab}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BeatmapSetCard({ set, viewMode, onOpenSet, onOpenBeatmap }) {
  const [expanded, setExpanded] = useState(false);
  const sortedDiffs = [...set.difficulties].sort(
    (a, b) => (a.difficulty_rating || 0) - (b.difficulty_rating || 0)
  );

  if (viewMode === 'list') {
    return (
      <div className="beatmap-set-list-item">
        <div
          className="set-list-main"
          style={{
            backgroundImage: `url(${set.cover})`,
          }}
          onClick={onOpenSet}
        >
          <div className="set-overlay" />
          <div className="set-list-info">
            <h3 className="set-title">{set.title}</h3>
            <p className="set-artist">{set.artist}</p>
            <p className="set-mapper">mapped by {set.creator}</p>
          </div>
          <div className="set-list-stats">
            <span className="diff-count">{set.difficulties.length} difficulties</span>
            <button
              className={`expand-btn ${expanded ? 'expanded' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
        
        {expanded && (
          <div className="difficulties-list">
            {sortedDiffs.map((diff) => (
              <div
                key={diff.id}
                className="difficulty-item"
                onClick={() => onOpenBeatmap(diff)}
              >
                <span className="diff-version">[{diff.version}]</span>
                <span className="diff-stars">
                  <Star size={14} />
                  {(diff.difficulty_rating || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="beatmap-set-card">
      <div
        className="set-card-image"
        style={{
          backgroundImage: `url(${set.cover})`,
        }}
        onClick={onOpenSet}
      >
        <div className="set-overlay" />
        <div className="set-badge">{set.difficulties.length} diffs</div>
      </div>
      <div className="set-card-content">
        <h3 className="set-card-title" onClick={onOpenSet}>{set.title}</h3>
        <p className="set-card-artist">{set.artist}</p>
        <p className="set-card-mapper">by {set.creator}</p>
        
        <button
          className={`difficulties-toggle ${expanded ? 'expanded' : ''}`}
          onClick={() => setExpanded(!expanded)}
        >
          <span>Difficulties</span>
          <ChevronDown size={16} />
        </button>

        {expanded && (
          <div className="difficulties-grid">
            {sortedDiffs.map((diff) => (
              <div
                key={diff.id}
                className="difficulty-chip"
                onClick={() => onOpenBeatmap(diff)}
                title={`${diff.version} - ${(diff.difficulty_rating || 0).toFixed(2)}★`}
              >
                <span className="chip-version">{diff.version}</span>
                <span className="chip-stars">
                  <Star size={12} />
                  {(diff.difficulty_rating || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
