import React, { useState } from 'react';
import { osuApi } from '../utils/osuApi';
import '../styles/BeatmapForm.css';

const BeatmapForm = () => {
    const [step, setStep] = useState(1); // 1: URL input, 2: Difficulties selection, 3: Tags & Collection
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [beatmapUrl, setBeatmapUrl] = useState('');
    const [beatmapSet, setBeatmapSet] = useState(null);
    const [selectedDiffs, setSelectedDiffs] = useState(new Set());
    const [formData, setFormData] = useState({
        customTags: '',
        collection: '',
        newCollection: ''
    });

    const [collections, setCollections] = useState([
        'Default Collection',
        'Favorites',
        'Training Maps'
    ]);

    const [showNewCollection, setShowNewCollection] = useState(false);

    const extractBeatmapId = (url) => {
        const match = url.match(/beatmapsets\/(\d+)/);
        return match ? match[1] : null;
    };

    const handleUrlSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const beatmapId = extractBeatmapId(beatmapUrl);
            if (!beatmapId) {
                throw new Error('Invalid beatmap URL format');
            }

            const data = await osuApi.getBeatmapDetails(beatmapId);
            setBeatmapSet(data);
            setStep(2);
        } catch (err) {
            setError('Failed to fetch beatmap data. Please check the URL and try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleDifficulty = (diffId) => {
        const newSelected = new Set(selectedDiffs);
        if (newSelected.has(diffId)) {
            newSelected.delete(diffId);
        } else {
            newSelected.add(diffId);
        }
        setSelectedDiffs(newSelected);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'collection' && value === 'new') {
            setShowNewCollection(true);
            return;
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (showNewCollection && formData.newCollection) {
            setCollections(prev => [...prev, formData.newCollection]);
            setFormData(prev => ({
                ...prev,
                collection: formData.newCollection,
                newCollection: ''
            }));
            setShowNewCollection(false);
        }

        // Here you would handle the final submission with selected difficulties
        const selectedBeatmaps = Array.from(selectedDiffs).map(diffId => {
            const diff = beatmapSet.beatmaps.find(b => b.id === diffId);
            return {
                id: diff.id,
                version: diff.version,
                difficulty_rating: diff.difficulty_rating,
                bpm: beatmapSet.bpm,
                artist: beatmapSet.artist,
                title: beatmapSet.title,
                creator: beatmapSet.creator,
                creator_url: `https://osu.ppy.sh/users/${beatmapSet.user_id}`,
                cover_url: beatmapSet.covers.cover,
                tags: formData.customTags.split(',').map(tag => tag.trim()),
                collection: formData.collection
            };
        });

        console.log('Selected beatmaps:', selectedBeatmaps);
    };

    if (step === 1) {
        return (
            <div className="beatmap-form-container">
                <form onSubmit={handleUrlSubmit} className="beatmap-form">
                    <div className="form-group">
                        <input
                            type="url"
                            value={beatmapUrl}
                            onChange={(e) => setBeatmapUrl(e.target.value)}
                            placeholder="Paste beatmap URL here..."
                            className={error ? 'error' : ''}
                            required
                        />
                        {error && <div className="error-message">{error}</div>}
                    </div>
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Loading...' : 'Next'}
                    </button>
                </form>
            </div>
        );
    }

    if (step === 2 && beatmapSet) {
        return (
            <div className="beatmap-form-container">
                <div className="beatmap-header">
                    <img src={beatmapSet.covers.cover} alt="Beatmap cover" className="cover-preview" />
                    <div className="beatmap-info">
                        <h2>{beatmapSet.artist} - {beatmapSet.title}</h2>
                        <p>mapped by <a href={`https://osu.ppy.sh/users/${beatmapSet.user_id}`} target="_blank" rel="noopener noreferrer">{beatmapSet.creator}</a></p>
                        <p>BPM: {beatmapSet.bpm}</p>
                    </div>
                </div>

                <div className="difficulties-list">
                    {beatmapSet.beatmaps.map(diff => (
                        <div key={diff.id} className="difficulty-item">
                            <div className="difficulty-info">
                                <span className="difficulty-name">{diff.version}</span>
                                <span className="difficulty-stars">{diff.difficulty_rating.toFixed(2)}★</span>
                            </div>
                            <button
                                className={`toggle-button ${selectedDiffs.has(diff.id) ? 'selected' : ''}`}
                                onClick={() => toggleDifficulty(diff.id)}
                            >
                                {selectedDiffs.has(diff.id) ? 'Remove' : 'Add'}
                            </button>
                        </div>
                    ))}
                </div>

                {selectedDiffs.size > 0 && (
                    <button 
                        className="submit-button"
                        onClick={() => setStep(3)}
                    >
                        Next ({selectedDiffs.size} selected)
                    </button>
                )}
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="beatmap-form-container">
                <form onSubmit={handleSubmit} className="beatmap-form">
                    <div className="form-group">
                        <input
                            type="text"
                            name="customTags"
                            value={formData.customTags}
                            onChange={handleInputChange}
                            placeholder="Custom Tags (comma separated)"
                        />
                    </div>

                    <div className="collection-section">
                        {!showNewCollection ? (
                            <select
                                name="collection"
                                value={formData.collection}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Collection</option>
                                {collections.map((collection, index) => (
                                    <option key={index} value={collection}>
                                        {collection}
                                    </option>
                                ))}
                                <option value="new">+ Create New Collection</option>
                            </select>
                        ) : (
                            <input
                                type="text"
                                name="newCollection"
                                value={formData.newCollection}
                                onChange={handleInputChange}
                                placeholder="New Collection Name"
                                required
                            />
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="back-button" onClick={() => setStep(2)}>
                            Back
                        </button>
                        <button type="submit" className="submit-button">
                            Add Selected Beatmaps
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return null;
};

export default BeatmapForm; 