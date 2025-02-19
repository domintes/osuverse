import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import './beatmapSearch.scss';

export default function BeatmapSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'artist', direction: 'ascending' });

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

    const sortedResults = [...results].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
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
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('artist')}
                                >
                                    Artist
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('title')}
                                >
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cover
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedResults.map((beatmap) => (
                                <tr key={beatmap.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{beatmap.artist}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{beatmap.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img src={beatmap.covers.list} alt={`${beatmap.title} cover`} className="w-16 h-16 object-cover" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={loadMore} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Load More</button>
                </div>
            )}

            <Suspense fallback={<p>Loading...</p>}>
                {error && <p>{error}</p>}
            </Suspense>
        </div>
    );
}
