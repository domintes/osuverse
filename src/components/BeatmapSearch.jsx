import { useState, useEffect } from 'react';
import axios from 'axios';
import './beatmapSearch.scss';

export default function BeatmapSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) {
                fetchBeatmaps(query);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [query]);

    const fetchBeatmaps = async (term) => {
        try {
            setLoading(true);
            const tokenResponse = await axios.post(
                'https://cors-anywhere.herokuapp.com/https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/oauth/token',
                {
                    client_id: '38309',
                    client_secret: '13hePdYOxB2WwJTvO9t9PuF6xlqxgYgVNb7gZ0f0',
                    grant_type: 'client_credentials',
                    scope: 'public',
                }
            );

            const accessToken = tokenResponse.data.access_token;

            const response = await axios.get(
                `https://cors-anywhere.herokuapp.com/https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/api/v2/beatmapsets/search?query=${term}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            setResults(response.data.beatmapsets || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching beatmaps:', error);
            setLoading(false);
        }
    };

    return (
        <div className="osuverse-search-container">
            <input
                type="text"
                placeholder="Search beatmaps..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="osuverse-search-input"
            />
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="osuverse-search-result-list">
                    {results.map((beatmap) => (
                        <a
                            key={beatmap.id}
                            href={`https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/beatmapsets/${beatmap.id}`}
                            className="osuverse-search-result-item"
                            style={{
                                backgroundImage: `url(${beatmap.covers['cover@2x']})`,
                            }}
                        >
                            <div>
                                <p className="osuverse-search-title">
                                    {beatmap.artist} - {beatmap.title}
                                </p>
                                <p className="osuverse-search-difficulty">
                                    {`Difficulty: ${beatmap.beatmaps.length > 0 ? beatmap.beatmaps[0].difficulty_rating : 'N/A'}`}
                                </p>
                                <p className="osuverse-search-mapper">
                                    Mapper:{' '}
                                    <a
                                        href={`https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/users/${beatmap.user_id}`}
                                        className="osuverse-search-mapper-link"
                                    >
                                        {beatmap.creator}
                                    </a>
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
