import { useState } from 'react';
import useStore from '../store';
import './addBeatmapModal.scss';
import GetMapData from '../utils/GetMapData';
import CollectionManager from './CollectionManager';
import TagInput from './TagInput/TagInput';

export default function AddBeatmapModal() {
    const [link, setLink] = useState('');
    const [beatmapData, setBeatmapData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState([]);
    const [step, setStep] = useState(1);
    const addBeatmap = useStore(state => state.addBeatmap);

    const fetchBeatmapData = async () => {
        setLoading(true);
        setError('');
        try {
            const url = new URL(link);
            const parts = url.pathname.split('/');
            const beatmapId = parts.pop();
            const beatmapsetId = parts.pop();

            if (!beatmapId || !beatmapsetId) {
                throw new Error('Please specify a specific difficulty in the link.');
            }

            const data = await GetMapData(link);
            setBeatmapData(data);
            setStep(2);
        } catch (error) {
            console.error('Failed to fetch beatmap data:', error);
            setError('Failed to fetch beatmap data. Please specify a specific difficulty in the link.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCollection = () => {
        const beatmapWithTags = { ...beatmapData, tags };
        addBeatmap(beatmapWithTags);
        setIsOpen(false);
    };

    return (
        <>
            <button className="add-beatmap-button" onClick={() => setIsOpen(true)}>Add beatmap</button>
            {isOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsOpen(false)}>&times;</span>
                        {step === 1 && (
                            <>
                                <input
                                    type="text"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="Podaj link do beatmapy"
                                />
                                <button onClick={fetchBeatmapData} disabled={loading}>
                                    {loading ? 'Ładowanie...' : 'Pobierz dane'}
                                </button>
                                {error && <p style={{ color: 'red' }}>{error}</p>}
                            </>
                        )}
                        {step === 2 && beatmapData && (
                            <>
                                <h3>{beatmapData.title}</h3>
                                <p>Artist: {beatmapData.beatmapset.artist}</p>
                                <p>BPM: {beatmapData.bpm}</p>
                                <img src={beatmapData.beatmapset.covers.cover} alt={`${beatmapData.title} cover`} />
                                <TagInput onTagsChange={setTags} />
                                <button onClick={() => setStep(3)}>Next</button>
                            </>
                        )}
                        {step === 3 && (
                            <>
                                <CollectionManager beatmap={beatmapData} />
                                <button onClick={handleAddToCollection}>
                                    Add {beatmapData.version} to collection
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}