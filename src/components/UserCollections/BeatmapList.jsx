'use client';

import React, { useState, useEffect } from 'react';
import BeatmapsetList from './components/BeatmapsetList';
import SortingControls from './components/SortingControls';
import { getBeatmapsForCollection } from './utils/collectionUtils';
import { doesBeatmapMatchTags } from '../../utils/tagUtils';
import '../../components/userCollections.scss';
import './userCollections.scss';

/**
 * Komponent wyświetlający listę beatmap
 */
const BeatmapList = ({ 
    collections, 
    collectionId, 
    subcollectionId, 
    filterBeatmapsByTags,
    globalTags = [],
    onEdit,
    onDelete,
    onToggleFavorite,
    groupByBeatmapset = true
}) => {
    // Stan sortowania
    const [sortBy, setSortBy] = useState('artist');
    const [sortOrder, setSortOrder] = useState('asc');
      // Pobieranie i przetwarzanie beatmap
    let beatmaps = collections ? getBeatmapsForCollection(collections, collectionId, subcollectionId) : [];
    beatmaps = filterBeatmapsByTags ? filterBeatmapsByTags(beatmaps, globalTags) : beatmaps;

    if (beatmaps.length === 0) {
        return <div className="empty-beatmaps">No beatmaps found in this collection.</div>;
    }

    return (
        <div className="beatmaps-list-container">
            {/* Kontrolki sortowania */}
            <SortingControls 
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={setSortBy}
                onOrderChange={setSortOrder}
            />
              {/* Lista beatmapsetów */}
            <BeatmapsetList
                beatmaps={beatmaps}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                collections={collections}
            />
        </div>
    );
};

export default BeatmapList;
