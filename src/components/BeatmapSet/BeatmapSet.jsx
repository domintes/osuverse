import { useState } from 'react';
import './BeatmapSet.scss';

export default function BeatmapSet({ beatmapset, onAddToCollection, onRemoveFromCollection, isInCollection }) {
    const [showDifficulties, setShowDifficulties] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Sortowanie difficulty od najłatwiejszego do najtrudniejszego
    const sortedDifficulties = [...beatmapset.beatmaps].sort((a, b) => a.difficulty_rating - b.difficulty_rating);

    // Obliczanie zakresu trudności dla beatmapsetu
    const difficultyRange = {
        min: Math.min(...beatmapset.beatmaps.map(b => b.difficulty_rating)),
        max: Math.max(...beatmapset.beatmaps.map(b => b.difficulty_rating))
    };

    // Funkcja pomocnicza do formatowania czasu
    const formatLength = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Funkcja do generowania klasy statusu
    const getStatusClass = (status) => {
        switch (status) {
            case 'ranked': return 'ranked';
            case 'loved': return 'loved';
            case 'qualified': return 'qualified';
            case 'pending': return 'pending';
            default: return 'unranked';
        }
    };

    // Funkcja do generowania ikony statusu
    const getStatusIcon = (status) => {
        switch (status) {
            case 'ranked': return '👑';
            case 'loved': return '❤️';
            case 'qualified': return '✅';
            case 'pending': return '⏳';
            default: return '📝';
        }
    };

    return (
        <div 
            className={`beatmapset void-container ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="beatmapset-main">
                <div className="beatmapset-cover">
                    <img src={beatmapset.covers.card} alt={beatmapset.title} loading="lazy" />
                    <div className={`status-badge ${getStatusClass(beatmapset.status)}`}>
                        {getStatusIcon(beatmapset.status)}
                    </div>
                </div>
                
                <div className="beatmapset-info">
                    <div className="beatmapset-header">
                        <h3 className="title">
                            {beatmapset.title}
                            {beatmapset.artist && (
                                <span className="artist"> by {beatmapset.artist}</span>
                            )}
                        </h3>
                        <div className="mapper">
                            mapped by <a href={`https://osu.ppy.sh/users/${beatmapset.user_id}`} target="_blank" rel="noopener noreferrer">
                                {beatmapset.creator}
                            </a>
                        </div>
                    </div>

                    <div className="beatmapset-stats">
                        <div className="stat">
                            <span className="label">Difficulty:</span>
                            <span className="value">
                                {difficultyRange.min === difficultyRange.max
                                    ? `${difficultyRange.min}★`
                                    : `${difficultyRange.min}★ - ${difficultyRange.max}★`}
                            </span>
                        </div>
                        <div className="stat">
                            <span className="label">Length:</span>
                            <span className="value">{formatLength(beatmapset.beatmaps[0].total_length)}</span>
                        </div>
                        <div className="stat">
                            <span className="label">BPM:</span>
                            <span className="value">{beatmapset.bpm}</span>
                        </div>
                    </div>
                </div>

                <div className="beatmapset-actions">
                    {isInCollection ? (
                        <button 
                            className="action-btn remove" 
                            onClick={() => onRemoveFromCollection(beatmapset.id)}
                            title="Remove from collection"
                        >
                            ✕
                        </button>
                    ) : (
                        <button 
                            className="action-btn add" 
                            onClick={() => onAddToCollection(beatmapset.id)}
                            title="Add to collection"
                        >
                            +
                        </button>
                    )}
                    <button 
                        className={`action-btn toggle-difficulties ${showDifficulties ? 'active' : ''}`}
                        onClick={() => setShowDifficulties(!showDifficulties)}
                        title="Show difficulties"
                    >
                        ▼
                    </button>
                </div>
            </div>

            {showDifficulties && (
                <div className="difficulties-list">
                    {sortedDifficulties.map((diff) => (
                        <div key={diff.id} className="difficulty-item">
                            <div className="difficulty-info">
                                <span className="difficulty-name">{diff.version}</span>
                                <span className="difficulty-rating">{diff.difficulty_rating}★</span>
                            </div>
                            <div className="difficulty-stats">
                                <span className="stat">CS: {diff.cs}</span>
                                <span className="stat">AR: {diff.ar}</span>
                                <span className="stat">OD: {diff.accuracy}</span>
                                <span className="stat">HP: {diff.drain}</span>
                            </div>
                            <div className="difficulty-actions">
                                {isInCollection ? (
                                    <button 
                                        className="action-btn remove small" 
                                        onClick={() => onRemoveFromCollection(beatmapset.id, diff.id)}
                                        title="Remove difficulty"
                                    >
                                        ✕
                                    </button>
                                ) : (
                                    <button 
                                        className="action-btn add small" 
                                        onClick={() => onAddToCollection(beatmapset.id, diff.id)}
                                        title="Add difficulty"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
