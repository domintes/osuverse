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
    onTogglePinned,
    groupByBeatmapset = true
}) => {    // Stan sortowania
    const [sortBy, setSortBy] = useState('artist');
    const [sortOrder, setSortOrder] = useState('asc');
      // Pobieranie i przetwarzanie beatmap
    let beatmaps = collections ? getBeatmapsForCollection(collections, collectionId, subcollectionId) : [];
    beatmaps = filterBeatmapsByTags ? filterBeatmapsByTags(beatmaps, globalTags) : beatmaps;
    
    // Sprawdź czy wszystkie beatmapy mają priorytet 0
    const hidePriorityColumn = beatmaps.every(beatmap => (beatmap.beatmap_priority || 0) === 0);

    if (beatmaps.length === 0) {
        const collectionInfo = collections?.collections?.find(c => c.id === collectionId);
        const isSystemCollection = collectionInfo?.isSystem || false;
        const collectionName = collectionInfo?.name || 'collection';
        
        return (
            <div className={`empty-beatmaps ${isSystemCollection ? 'system-collection' : ''}`}>
                <span className="empty-count">(0)</span>
                {isSystemCollection ? 
                    <span>This system collection is empty</span> : 
                    <span>No beatmaps found in this {collectionName}</span>
                }
            </div>
        );
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
                onTogglePinned={onTogglePinned}
                hidePriorityColumn={hidePriorityColumn}
                collections={collections}
            />
        </div>
    );
};

export default BeatmapList;
