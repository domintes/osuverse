import { useState, useMemo } from 'react';
import useBeatmapStore from '../../stores/beatmapStore';
import TagInput from '../TagInput/TagInput';
import './CollectionDetails.scss';

export default function CollectionDetails({ collection }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(collection?.name || '');
    const { updateCollection, mergeTags } = useBeatmapStore();

    // Obliczanie statystyk kolekcji
    const stats = useMemo(() => {
        if (!collection) return null;

        const beatmaps = Array.from(collection.beatmaps.values());
        const allTags = new Set();
        const mappers = new Set();
        let totalLength = 0;
        let minStars = Infinity;
        let maxStars = -Infinity;

        beatmaps.forEach(beatmap => {
            beatmap.tags.forEach(tag => allTags.add(tag));
            mappers.add(beatmap.creator);
            totalLength += beatmap.total_length;
            const stars = beatmap.difficulty_rating;
            minStars = Math.min(minStars, stars);
            maxStars = Math.max(maxStars, stars);
        });

        return {
            beatmapCount: beatmaps.length,
            tagCount: allTags.size,
            mapperCount: mappers.size,
            totalLength,
            minStars: minStars === Infinity ? 0 : minStars,
            maxStars: maxStars === -Infinity ? 0 : maxStars,
            tags: Array.from(allTags)
        };
    }, [collection]);

    // Formatowanie czasu
    const formatLength = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? 
            `${hours}h ${minutes}m` : 
            `${minutes}m`;
    };

    // Obsługa edycji nazwy
    const handleNameEdit = () => {
        if (!isEditing || !editedName.trim()) return;
        updateCollection(collection.id, { name: editedName.trim() });
        setIsEditing(false);
    };

    // Obsługa tagów
    const handleTagsChange = (tags) => {
        if (!collection) return;
        // Aktualizacja tagów w kolekcji
        collection.beatmaps.forEach(beatmap => {
            beatmap.tags = new Set(tags);
        });
        updateCollection(collection.id, { updatedAt: Date.now() });
    };

    if (!collection || !stats) return null;

    return (
        <div className="collection-details void-container">
            <div className="details-header">
                {isEditing ? (
                    <div className="name-edit">
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleNameEdit();
                                if (e.key === 'Escape') {
                                    setIsEditing(false);
                                    setEditedName(collection.name);
                                }
                            }}
                            autoFocus
                        />
                        <div className="edit-actions">
                            <button onClick={handleNameEdit}>✓</button>
                            <button onClick={() => {
                                setIsEditing(false);
                                setEditedName(collection.name);
                            }}>✕</button>
                        </div>
                    </div>
                ) : (
                    <h2>
                        {collection.name}
                        <button 
                            className="edit-name-btn"
                            onClick={() => setIsEditing(true)}
                            title="Edit collection name"
                        >
                            ✎
                        </button>
                    </h2>
                )}
                <div className="header-stats">
                    <div className="stat">
                        <span className="value">{stats.beatmapCount}</span>
                        <span className="label">Beatmaps</span>
                    </div>
                    <div className="stat">
                        <span className="value">{stats.tagCount}</span>
                        <span className="label">Tags</span>
                    </div>
                    <div className="stat">
                        <span className="value">{stats.mapperCount}</span>
                        <span className="label">Mappers</span>
                    </div>
                </div>
            </div>

            <div className="details-content">
                <div className="stats-section">
                    <h3>Collection Stats</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="label">Total Length</span>
                            <span className="value">{formatLength(stats.totalLength)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Difficulty Range</span>
                            <span className="value">
                                {stats.minStars.toFixed(1)}★ - {stats.maxStars.toFixed(1)}★
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Created</span>
                            <span className="value">
                                {new Date(collection.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Last Updated</span>
                            <span className="value">
                                {new Date(collection.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="tags-section">
                    <h3>Collection Tags</h3>
                    <TagInput
                        initialTags={stats.tags}
                        onTagsChange={handleTagsChange}
                        placeholder="Add tags to collection..."
                    />
                    <div className="tag-suggestions">
                        <h4>Similar Tags</h4>
                        <div className="suggestions-list">
                            {stats.tags.map(tag => (
                                <button
                                    key={tag}
                                    className="merge-tag-btn"
                                    onClick={() => {
                                        const similarTags = stats.tags.filter(t =>
                                            t !== tag && (
                                                t.includes(tag) ||
                                                tag.includes(t) ||
                                                t.split('-').some(part => tag.includes(part))
                                            )
                                        );
                                        if (similarTags.length > 0) {
                                            mergeTags(similarTags[0], tag);
                                        }
                                    }}
                                    title="Click to merge similar tags"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
