import { useState, Suspense } from 'react';
import useStore from '../store';
import './addBeatmapModal.scss';
import GetMapData from '../utils/GetMapData';

export default function AddBeatmapModal({ onClose }) {
    const [link, setLink] = useState('');
    const [beatmapData, setBeatmapData] = useState(null);
    const [loading, setLoading] = useState(false);
    const addBeatmap = useStore(state => state.addBeatmap);

    const fetchBeatmapData = async () => {
        setLoading(true);
        try {
            console.log('Fetching beatmap data...');
            const data = await GetMapData(link);
            console.log('Beatmap data response:', data);
            setBeatmapData(data);
        } catch (error) {
            console.error('Failed to fetch beatmap data:', error);
            alert('Failed to fetch beatmap data. Please check the link and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCollection = (difficulty) => {
        addBeatmap({ ...beatmapData, difficulty });
        onClose();
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Podaj link do beatmapy"
                />
                <button onClick={fetchBeatmapData} disabled={loading}>
                    {loading ? 'Ładowanie...' : 'Pobierz dane'}
                </button>
                {beatmapData && beatmapData.difficulties &&
                    <Suspense fallback={<p>Loading...</p>}>
                        <div>
                            <h3>{beatmapData.title}</h3>
                            {beatmapData.difficulties.map(difficulty => (
                                <button key={difficulty.id} onClick={() => handleAddToCollection(difficulty)}>
                                    Dodaj {difficulty.name} do kolekcji
                                </button>
                            ))}
                        </div>
                    </Suspense>
                }


            </div>
        </div>
    );
}
