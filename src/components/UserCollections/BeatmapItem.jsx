'use client';

import React, { useRef, forwardRef } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';
import { BsMegaphoneFill } from 'react-icons/bs';
import { isBeatmapFavorited } from './utils/collectionUtils';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { activeBeatmapIdAtom, highlightBeatmapAtom } from '../../store/activeBeatmapAtom';
import '../../components/userCollections.scss';
import './userCollections.scss';

/**
 * Komponent wyświetlający pojedynczą beatmapę
 */
const BeatmapItem = ({ beatmap, collections, onEdit, onDelete, onToggleFavorite }) => {
    // Bezpieczne sprawdzenie czy beatmapa jest w ulubionych
    const isFavorited = collections ? isBeatmapFavorited(collections, beatmap.id) : false;

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
    
    // Funkcja do bezpiecznego renderowania tagów
    const renderTag = (tag, idx) => {
        try {
            if (typeof tag === 'string') {
                // Format string
                return (
                    <div key={idx} className="beatmap-tag">
                        {tag}
                    </div>
                );
            } else if (typeof tag === 'object' && tag !== null) {
                // Format obiektowy {tag, tag_value}
                const tagValue = typeof tag.tag_value === 'number' ? tag.tag_value : 0;
                const tagName = typeof tag.tag === 'string' ? tag.tag : '';
                
                if (!tagName) return null; // Puste tagi nie są renderowane
                
                return (
                    <div
                        key={idx}
                        className={`beatmap-tag ${tagValue > 0 ? 'positive' : tagValue < 0 ? 'negative' : ''}`}
                        title={`Priority value: ${tagValue}`}
                    >
                        {tagName}
                        {tagValue !== 0 && <span className="tag-value">{tagValue}</span>}
                    </div>
                );
            }
        } catch (error) {
            console.error("Error rendering tag:", error, tag);
        }
        return null; // W przypadku błędu lub niepasującego typu
    };
    
    return (
        <div 
            id={`beatmap-${beatmap.id}`} 
            className="beatmap-item"
        >
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
                    {Array.isArray(beatmap.userTags) 
                        ? beatmap.userTags.map((tag, idx) => renderTag(tag, idx))
                        : null
                    }
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
