'use client';

import React from 'react';
import BeatmapItem from './BeatmapItem';
import { getBeatmapsForCollection } from './utils/collectionUtils';
import '../../components/userCollections.scss';
import './userCollections.scss';

/**
 * Komponent wyświetlający listę beatmap
 */
const BeatmapList = ({ 
    collections, 
    collectionId, 
    subcollectionId, 
    sortBeatmaps,
    filterBeatmapsByTags,
    globalTags = [],
    onEdit,
    onDelete,
    onToggleFavorite 
}) => {
    let beatmaps = getBeatmapsForCollection(collections, collectionId, subcollectionId);
    beatmaps = filterBeatmapsByTags(beatmaps, globalTags);
    beatmaps = sortBeatmaps(beatmaps);

    if (beatmaps.length === 0) {
        return <div className="empty-beatmaps">No beatmaps found in this collection.</div>;
    }

    return (
        <div className="beatmaps-container">
            {beatmaps.map(beatmap => (
                <BeatmapItem
                    key={beatmap.id}
                    beatmap={beatmap}
                    collections={collections}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleFavorite={onToggleFavorite}
                />
            ))}
        </div>
    );
};

export default BeatmapList;
