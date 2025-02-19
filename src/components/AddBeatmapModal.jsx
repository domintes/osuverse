import { useState, Suspense } from 'react';
import useStore from '../store';
import './addBeatmapModal.scss';
import GetMapData from '../utils/GetMapData';

export default function AddBeatmapModal() {
    const [link, setLink] = useState('');
    const [beatmapData, setBeatmapData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
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
        } catch (error) {
            console.error('Failed to fetch beatmap data:', error);
            setError('Failed to fetch beatmap data. Please specify a specific difficulty in the link.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCollection = () => {
        console.log('Adding beatmap to collection:', beatmapData);
        addBeatmap(beatmapData);
        console.log('Beatmap added successfully');
        setIsOpen(false);
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)}>Dodaj beatmapę</button>
            {isOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsOpen(false)}>&times;</span>
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
                        {beatmapData &&
                            <Suspense fallback={<p>Loading...</p>}>
                                <div>
                                    <h3>{beatmapData.title}</h3>
                                    <p>Artist: {beatmapData.beatmapset.artist}</p>
                                    <p>BPM: {beatmapData.bpm}</p>
                                    <img src={beatmapData.beatmapset.covers.cover} alt={`${beatmapData.title} cover`} />
                                    <button onClick={handleAddToCollection}>
                                        Dodaj {beatmapData.version} do kolekcji
                                    </button>
                                </div>
                            </Suspense>
                        }
                    </div>
                </div>
            )}
        </>
    );
}
