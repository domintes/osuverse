'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '@/store/authAtom';
import './searchInput.scss';
import classNames from 'classnames';

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
    const [rowCount, setRowCount] = useState(2);
    const token = useAtom(authAtom)[0];
    const [dropdownOpen, setDropdownOpen] = useState({}); // <-- moved to top level
    const [hoveredItem, setHoveredItem] = useState(null);
    const [hoveredDiff, setHoveredDiff] = useState(null);
    const [collapsedItem, setCollapsedItem] = useState(null);
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

                    <div className="search-artist-filter flex-1">
                        <label className="search-artist-filter-label block text-sm font-medium mb-1">Row of results</label>
                        <select
                            value={rowCount}
                            onChange={e => setRowCount(Number(e.target.value))}
                            className="search-artist-select search-artist-select-dark w-full p-2 border rounded-md"
                        >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
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

            <div
                className="search-artist-results space-y-4"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${rowCount}, 1fr)`,
                    gap: '1rem'
                }}
            >
                {currentItems.map(set => {
                    const beatmaps = set.beatmaps || [];
                    const isHovered = hoveredItem === set.id;
                    return (
                        <div
                            key={set.id}
                            className="search-artist-beatmap-item relative"
                            style={{
                                backgroundImage: `url(${set.covers?.cover})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                backgroundColor: 'rgba(0,28,54,0.85)',
                                backgroundBlendMode: 'darken',
                            }}
                            onMouseEnter={() => setHoveredItem(set.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <div className="search-artist-beatmap-thumbnail aspect-square">
                                <img 
                                    src={`${set.covers.card}`}
                                    alt={`${set.title} Beatmap Background`}
                                    className="w-full h-full object-cover rounded-md"
                                />
                            </div>
                            <div className="search-artist-beatmap-info flex flex-col justify-center">
                                <div className="search-artist-beatmap-title text-lg font-semibold">
                                    <a href={`https://osu.ppy.sh/beatmapsets/${set.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-700">
                                        {set.artist} - {set.title}
                                    </a>
                                </div>
                                <div className="search-artist-beatmap-details flex items-center gap-2 text-gray-600">
                                    <span className="search-artist-beatmap-mapper text-sm">
                                        mapped by <a href={`https://osu.ppy.sh/users/${set.user_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{set.creator}</a>
                                    </span>
                                    <span className="search-artist-beatmap-status text-sm px-2 py-1 rounded bg-gray-100">
                                        {set.status}
                                    </span>
                                </div>
                                {/* Difficulties as colored squares */}
                                {beatmaps.length > 0 && (
                                    <div className="search-artist-beatmap-difficulties-wrapper">
                                        <div className="search-artist-beatmap-difficulties-squares flex gap-1">
                                            {beatmaps
                                                .slice()
                                                .sort((a, b) => a.difficulty_rating - b.difficulty_rating)
                                                .map((bm) => (
                                                    <div
                                                        key={bm.id}
                                                        className="difficulty-rect border border-gray-300 transition-transform duration-150 hover:scale-110"
                                                        style={{
                                                            background: getDiffColor(bm.difficulty_rating),
                                                            width: '24px',
                                                            height: '12px',
                                                            borderRadius: '4px',
                                                        }}
                                                        title={bm.version}
                                                    />
                                                ))}
                                        </div>
                                        {isHovered && (
                                            <div className="search-artist-beatmap-difficulties-details absolute left-0 right-0 bg-white/95 p-3 rounded-md shadow-lg z-10 mt-2">
                                                {beatmaps
                                                    .slice()
                                                    .sort((a, b) => a.difficulty_rating - b.difficulty_rating)
                                                    .map(bm => (
                                                        <div key={bm.id} className="flex items-center gap-2 mb-2 last:mb-0">
                                                            <span 
                                                                className="inline-block w-3 h-3 rounded-sm" 
                                                                style={{ background: getDiffColor(bm.difficulty_rating) }}
                                                            />
                                                            <a 
                                                                href={`https://osu.ppy.sh/beatmaps/${bm.id}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="font-medium text-blue-700 hover:underline"
                                                            >
                                                                {bm.version}
                                                            </a>
                                                            <span className="text-xs text-gray-500">
                                                                {bm.difficulty_rating.toFixed(2)}★
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                )}
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

// Helper function for difficulty color
function getDiffColor(star) {
    if (star < 2) return '#66bb6a'; // green
    if (star < 2.7) return '#42a5f5'; // blue
    if (star < 4) return '#ab47bc'; // purple
    if (star < 5.3) return '#ffa726'; // orange
    if (star < 6.5) return '#ef5350'; // red
    return '#616161'; // gray
}