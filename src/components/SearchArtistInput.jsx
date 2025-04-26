'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '@/store/authAtom';

export default function SearchArtistInput() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all', // ranked, loved, pending, all
        mode: 'all' // osu, mania, taiko, fruits
    });
    const token = useAtom(authAtom)[0];

    useEffect(() => {
        if (!query || !token) {
            setResults([]);
            setError(null);
            return;
        }

        const timeout = setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    artist: query,
                    ...(filters.status !== 'all' && { status: filters.status }),
                    ...(filters.mode !== 'all' && { mode: filters.mode })
                });

                const res = await fetch(`/api/search?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch beatmaps');
                }
                
                const data = await res.json();
                setResults(data.beatmaps);
            } catch (err) {
                console.error('Search error:', err.message);
                setError(err.message);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 500); // Debounce search requests

        return () => clearTimeout(timeout);
    }, [query, token, filters]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type artist name"
                    className="p-2 border rounded-md w-full"
                />
                
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="all">All Status</option>
                            <option value="ranked">Ranked</option>
                            <option value="loved">Loved</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Game Mode</label>
                        <select
                            value={filters.mode}
                            onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="all">All Modes</option>
                            <option value="osu">osu!</option>
                            <option value="mania">osu!mania</option>
                            <option value="taiko">osu!taiko</option>
                            <option value="fruits">osu!catch</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading && <div className="text-center">Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            
            <div className="space-y-4">
                {results.map(map => (
                    <div key={map.id} className="grid grid-cols-[120px_1fr] gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="aspect-square">
                            <img 
                                src={`${map.covers.card}`}
                                alt={`${map.title} Beatmap Background`}
                                className="w-full h-full object-cover rounded-md"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="text-lg font-semibold">
                                {map.artist} - {map.title}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="flex items-center">
                                    {map.difficulty_rating}
                                    <svg className="w-4 h-4 ml-1 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                </span>
                                <span className="text-sm">
                                    mapped by <a href={`https://osu.ppy.sh/users/${map.user_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{map.creator}</a>
                                </span>
                                <span className="text-sm px-2 py-1 rounded bg-gray-100">
                                    {map.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}