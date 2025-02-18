import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import './beatmapSearch.scss';

export default function BeatmapSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);

    const fetchBeatmaps = async (term, page) => {
        try {
            setLoading(true);
            setError(null);
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

            console.log('Fetching beatmaps...');
            const response = await axios.get(
                `https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/api/v2/beatmapsets/search?query=${term}&limit=8&offset=${(page - 1) * 8}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            console.log('Beatmaps response:', response);
            console.log('Beatmaps data:', response.data);
            console.log('Beatmapsets:', response.data.beatmapsets);
            if (response.data.beatmapsets) {
                response.data.beatmapsets.forEach((beatmap, index) => {
                    console.log(`Beatmap ${index}:`, beatmap);
                });
            }
            setResults((prevResults) => [...prevResults, ...response.data.beatmapsets]);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching beatmaps:', error);
            setError('Error fetching beatmap data');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (query) {
            fetchBeatmaps(query, page);
        }
    }, [query, page]);

    const handleSearch = () => {
        setResults([]);
        setPage(1);
        fetchBeatmaps(query, 1);
    };

    const loadMore = () => {
        setPage((prevPage) => prevPage + 1);
    };

    console.log('results');
    console.log(results);

    return (
        <div className="osuverse-search-container">
            <input
                type="text"
                placeholder="Search beatmaps..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="osuverse-search-input"
            />
            <button onClick={handleSearch}>SEARCH BEATMAPS</button>

            {!loading && results.length > 0 && (
                <div className="osuverse-search-result-list">
                    {results.map((beatmap) => (
                        <div key={beatmap.id} className="osuverse-search-result-item">
                            <p>{beatmap.artist}</p>
                        </div>
                    ))}
                    <button onClick={loadMore}>Load More</button>
                </div>
            )}

            <Suspense fallback={<p>Loading...</p>}>
                {error && <p>{error}</p>}
            </Suspense>
        </div>
    );
}
