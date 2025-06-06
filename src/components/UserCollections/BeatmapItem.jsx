'use client';

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';
import { BsMegaphoneFill } from 'react-icons/bs';
import { isBeatmapFavorited } from './utils/collectionUtils';
import '../../components/userCollections.scss';
import './userCollections.scss';

/**
 * Komponent wyświetlający pojedynczą beatmapę
 */
const BeatmapItem = ({ beatmap, collections, onEdit, onDelete, onToggleFavorite }) => {
    // Sprawdź czy beatmapa jest w ulubionych
    const isFavorited = isBeatmapFavorited(collections, beatmap.id);

    // Funkcja renderująca wskaźnik priorytetu
    const renderPriorityIndicator = (priority) => {
        let colorClass = 'priority-neutral';
        if (priority > 3) colorClass = 'priority-high';
        else if (priority > 0) colorClass = 'priority-medium';
        else if (priority < -3) colorClass = 'priority-very-low';
        else if (priority < 0) colorClass = 'priority-low';

        return (
            <div className={`priority-indicator ${colorClass}`}>
                <BsMegaphoneFill size={16} />
                <span>{priority}</span>
            </div>
        );
    };

    return (
        <div className="beatmap-item">
            {/* Przycisk gwiazdki (ulubione) */}
            <button
                className={`favorite-button ${isFavorited ? 'active' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(beatmap);
                }}
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
                {isFavorited ? <AiFillStar size={18} /> : <AiOutlineStar size={18} />}
            </button>

            <div
                className="beatmap-cover"
                style={{ backgroundImage: `url(${beatmap.cover})` }}
            />
            <div className="beatmap-info">
                <div className="beatmap-title">{beatmap.artist} - {beatmap.title}</div>
                <div className="beatmap-details">
                    <span className="beatmap-difficulty">{beatmap.version} ({beatmap.difficulty_rating.toFixed(2)}★)</span>
                    <span className="beatmap-creator">mapped by {beatmap.creator}</span>
                </div>
                <div className="beatmap-tags">
                    {beatmap.userTags?.map((tag, idx) => (
                        <div
                            key={idx}
                            className={`beatmap-tag ${tag.tag_value > 0 ? 'positive' : tag.tag_value < 0 ? 'negative' : ''}`}
                            title={`Priority value: ${tag.tag_value}`}
                        >
                            {tag.tag}
                            {tag.tag_value !== 0 && <span className="tag-value">{tag.tag_value}</span>}
                        </div>
                    ))}
                </div>
            </div>
            {renderPriorityIndicator(beatmap.beatmap_priority || 0)}
            <div className="beatmap-actions">
                <button
                    className="beatmap-edit"
                    onClick={() => onEdit(beatmap)}
                    title="Edit tags and collection"
                >
                    <Edit size={16} />
                </button>
                <button
                    className="beatmap-delete"
                    onClick={() => onDelete(beatmap.id)}
                    title="Remove from collection"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default BeatmapItem;
