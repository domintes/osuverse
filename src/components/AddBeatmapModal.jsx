import { useState } from 'react';
import useStore from '../store';
import axios from 'axios';
import './addBeatmapModal.scss';

export default function AddBeatmapModal({ onClose }) {
    const [link, setLink] = useState('');
    const [beatmapData, setBeatmapData] = useState(null);
    const [loading, setLoading] = useState(false);
    const addBeatmap = useStore(state => state.addBeatmap);

    const fetchBeatmapData = async () => {
        setLoading(true);
        try {
            console.log('Fetching token...');
            const tokenResponse = await axios.post(
                'https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/oauth/token',
                {
                    client_id: '38309',
                    client_secret: '13hePdYOxB2WwJTvO9t9PuF6xlqxgYgVNb7gZ0f0',
                    grant_type: 'client_credentials',
                    scope: 'public',
                }
            );
            console.log('Token response:', tokenResponse);

            const accessToken = tokenResponse.data.access_token;

            console.log('Fetching beatmap data...');
            const response = await axios.get(
                `https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/api/v2/beatmaps/4`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            console.log('Beatmap data response:', response);
            setBeatmapData(response.data);
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
                {beatmapData && (
                    <div>
                        <h3>{beatmapData.title}</h3>
                        {beatmapData.difficulties.map(difficulty => (
                            <button key={difficulty.id} onClick={() => handleAddToCollection(difficulty)}>
                                Dodaj {difficulty.name} do kolekcji
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
