'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '@/store/authAtom';
import './searchInput.scss';

export default function SearchInput() {
    const [query, setQuery] = useState('');
    const [artist, setArtist] = useState('');
    const [mapper, setMapper] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        mode: 'all'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const token = useAtom(authAtom)[0];
    const [dropdownOpen, setDropdownOpen] = useState({}); // <-- moved to top level
    // Helper to toggle dropdown for a beatmapset
    const toggleDropdown = (id) => setDropdownOpen(prev => ({ ...prev, [id]: !prev[id] }));

    // Calculate pagination values
    const totalPages = Math.ceil(results.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);

    // Reset to first page when search query or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [query, filters]);

    useEffect(() => {
        if ((!query && !artist && !mapper) || !token) {
            setResults([]);
            setError(null);
            return;
        }

        const timeout = setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    ...(query && { query }),
                    ...(artist && { artist }),
                    ...(mapper && { mapper }),
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
        }, 500);

        return () => clearTimeout(timeout);
    }, [query, artist, mapper, token, filters]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    console.log('results');
    console.log(results);

    return (
        <div className="search-artist-input-container space-y-4">
            <div className="search-artist-input-controls flex flex-col space-y-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search beatmaps"
                    className="search-artist-input p-2 border rounded-md w-full"
                />
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        placeholder="Artists filter"
                        className="search-artist-input p-2 border rounded-md w-full"
                    />
                    <input
                        type="text"
                        value={mapper}
                        onChange={(e) => setMapper(e.target.value)}
                        placeholder="Mappers filter"
                        className="search-artist-input p-2 border rounded-md w-full"
                    />
                </div>

                <div className="search-artist-input-select-group flex gap-4">
                    <div className="search-artist-filter flex-1">
                        <label className="search-artist-filter-label block text-sm font-medium mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="search-artist-select w-full p-2 border rounded-md"
                        >
                            <option value="all">All Status</option>
                            <option value="ranked">Ranked</option>
                            <option value="loved">Loved</option>
                            <option value="pending">Pending</option>
                            <option value="graveyard">Graveyard</option>
                        </select>
                    </div>
                    
                    <div className="search-artist-filter flex-1">
                        <label className="search-artist-filter-label block text-sm font-medium mb-1">Game Mode</label>
                        <select
                            value={filters.mode}
                            onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value }))}
                            className="search-artist-select w-full p-2 border rounded-md"
                        >
                            <option value="all">All Modes</option>
                            <option value="osu">osu!</option>
                            <option value="mania">osu!mania</option>
                            <option value="taiko">osu!taiko</option>
                            <option value="fruits">osu!catch</option>
                        </select>
                    </div>

                    <div className="search-artist-filter flex-1">
                        <label className="search-artist-filter-label block text-sm font-medium mb-1">Results per page</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="search-artist-select w-full p-2 border rounded-md"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading && <div className="search-artist-loading text-center">Loading...</div>}
            {error && <div className="search-artist-error text-red-500">{error}</div>}
            
            {results.length > 0 && (
                <div className="search-artist-results-info text-sm text-gray-500 mb-2">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, results.length)} of {results.length} results
                </div>
            )}

            <div className="search-artist-results space-y-4">
                {currentItems.map(set => {
                    const beatmaps = set.beatmaps || [];
                    // Removed useState from here
                    // Helper to toggle dropdown for a beatmapset is now at top level

                    return (
                        <div key={set.id} className="search-artist-beatmap-item grid grid-cols-[120px_1fr] gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="search-artist-beatmap-thumbnail aspect-square">
                                <img 
                                    src={`${set.covers.card}`}
                                    alt={`${set.title} Beatmap Background`}
                                    className="w-full h-full object-cover rounded-md"
                                />
                            </div>
                            <div className="search-artist-beatmap-info flex flex-col justify-center">
                                <div className="search-artist-beatmap-title text-lg font-semibold">
                                    {set.artist} - {set.title}
                                </div>
                                <div className="search-artist-beatmap-details flex items-center gap-2 text-gray-600">
                                    <span className="search-artist-beatmap-mapper text-sm">
                                        mapped by <a href={`https://osu.ppy.sh/users/${set.user_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{set.creator}</a>
                                    </span>
                                    <span className="search-artist-beatmap-status text-sm px-2 py-1 rounded bg-gray-100">
                                        {set.status}
                                    </span>
                                </div>
                                {/* Difficulties section */}
                                {beatmaps.length === 1 ? (
                                    <div className="search-artist-beatmap-difficulty flex items-center mt-1">
                                        <span className="font-medium mr-2">{beatmaps[0].version}</span>
                                        <span className="flex items-center">
                                            {beatmaps[0].difficulty_rating}
                                            <svg className="search-artist-beatmap-star w-4 h-4 ml-1 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                            </svg>
                                        </span>
                                    </div>
                                ) : beatmaps.length > 1 ? (
                                    <div className="search-artist-beatmap-difficulties mt-1">
                                        <button
                                            className="search-artist-beatmap-difficulties-toggle text-blue-500 hover:underline text-sm mb-1"
                                            onClick={() => toggleDropdown(set.id)}
                                            type="button"
                                        >
                                            {dropdownOpen[set.id] ? 'Hide difficulties' : `Show ${beatmaps.length} difficulties`}
                                        </button>
                                        {dropdownOpen[set.id] && (
                                            <div className="search-artist-beatmap-difficulties-list space-y-1">
                                                {beatmaps.map(bm => (
                                                    <div key={bm.id} className="flex items-center ml-2">
                                                        <span className="font-medium mr-2">{bm.version}</span>
                                                        <span className="flex items-center">
                                                            {bm.difficulty_rating}
                                                            <svg className="search-artist-beatmap-star w-4 h-4 ml-1 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                            </svg>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>

            {results.length > 0 && (
                <div className="search-artist-pagination flex justify-center items-center space-x-2 mt-4">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="search-artist-pagination-button px-3 py-1 rounded border disabled:opacity-50"
                    >
                        First
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="search-artist-pagination-button px-3 py-1 rounded border disabled:opacity-50"
                    >
                        Previous
                    </button>
                    
                    <span className="search-artist-pagination-info px-4">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="search-artist-pagination-button px-3 py-1 rounded border disabled:opacity-50"
                    >
                        Next
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="search-artist-pagination-button px-3 py-1 rounded border disabled:opacity-50"
                    >
                        Last
                    </button>
                </div>
            )}
        </div>
    );
}