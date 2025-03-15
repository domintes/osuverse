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
            className={`beatmap-set-container ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="beatmap-set-main">
                <div className="cover-container">
                    <img src={beatmapset.covers.card} alt={beatmapset.title} loading="lazy" />
                    <div className={`status-badge ${getStatusClass(beatmapset.status)}`}>
                        {getStatusIcon(beatmapset.status)}
                    </div>
                </div>
                
                <div className="beatmap-info">
                    <div className="beatmap-header">
                        <h3 className="beatmap-title">
                            {beatmapset.title}
                            {beatmapset.artist && (
                                <span className="beatmap-artist"> by {beatmapset.artist}</span>
                            )}
                        </h3>
                        <div className="beatmap-mapper">
                            mapped by <a href={`https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/users/${beatmapset.user_id}`} target="_blank" rel="noopener noreferrer">
                                {beatmapset.creator}
                            </a>
                        </div>
                    </div>

                    <div className="beatmap-stats">
                        <div className="stat">
                            <span className="stat-label">Difficulty:</span>
                            <span className="stat-value">
                                {difficultyRange.min === difficultyRange.max
                                    ? `${difficultyRange.min}★`
                                    : `${difficultyRange.min}★ - ${difficultyRange.max}★`}
                            </span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Length:</span>
                            <span className="stat-value">{formatLength(beatmapset.beatmaps[0].total_length)}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">BPM:</span>
                            <span className="stat-value">{beatmapset.bpm}</span>
                        </div>
                    </div>
                </div>

                <div className="beatmap-actions">
                    {isInCollection ? (
                        <button 
                            className="action-button remove"
                            onClick={() => onRemoveFromCollection(beatmapset.id)}
                            title="Remove from collection"
                        >
                            ✕
                        </button>
                    ) : (
                        <button 
                            className="action-button add"
                            onClick={() => onAddToCollection(beatmapset.id)}
                            title="Add to collection"
                        >
                            +
                        </button>
                    )}
                    <button 
                        className={`action-button toggle-difficulties ${showDifficulties ? 'active' : ''}`}
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
                        <div className="difficulty-item" key={diff.id}>
                            <div className="difficulty-info">
                                <span className="difficulty-name">{diff.version}</span>
                                <span className="difficulty-rating">{diff.difficulty_rating}★</span>
                            </div>
                            <div className="difficulty-stats">
                                <div className="stat">
                                    <span className="stat-label">CS:</span>
                                    <span className="stat-value">{diff.cs}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">AR:</span>
                                    <span className="stat-value">{diff.ar}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">OD:</span>
                                    <span className="stat-value">{diff.accuracy}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">HP:</span>
                                    <span className="stat-value">{diff.drain}</span>
                                </div>
                            </div>
                            <div className="difficulty-actions">
                                {isInCollection ? (
                                    <button 
                                        className="action-button remove small"
                                        onClick={() => onRemoveFromCollection(beatmapset.id, diff.id)}
                                        title="Remove difficulty"
                                    >
                                        ✕
                                    </button>
                                ) : (
                                    <button 
                                        className="action-button add small"
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
