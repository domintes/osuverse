'use client';

import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '@/store/authAtom';
import { collectionsAtom } from '@/store/collectionAtom';
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
    const [dropdownOpen, setDropdownOpen] = useState({});
    const [hoveredItem, setHoveredItem] = useState(null);
    const [hoveredDiff, setHoveredDiff] = useState(null);
    const [collapsedItem, setCollapsedItem] = useState(null);
    const [searchMappers, setSearchMappers] = useState(false);
    const [foundMapper, setFoundMapper] = useState(null);
    const [collections, setCollections] = useAtom(collectionsAtom);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTarget, setModalTarget] = useState(null); // { type: 'single'|'all', set, beatmap } or null
    const [difficultyVisible, setDifficultyVisible] = useState({});

    const componentRef = useRef(null);

    const toggleDropdown = (id) => setDropdownOpen(prev => ({ ...prev, [id]: !prev[id] }));

    const totalPages = Math.ceil(results.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);

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

    useEffect(() => {
        if (!searchMappers || !mapper || !token) {
            setFoundMapper(null);
            return;
        }
        let cancelled = false;
        setFoundMapper(null);
        setLoading(true);
        fetch(`/api/user?username=${encodeURIComponent(mapper)}&token=${encodeURIComponent(token)}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (!cancelled && data && data.id) {
                    setFoundMapper({
                        id: data.id,
                        username: data.username,
                        avatar_url: data.avatar_url,
                        country: data.country?.name,
                        country_code: data.country?.code,
                        profile_url: `https://osu.ppy.sh/users/${data.id}`
                    });
                } else if (!cancelled) {
                    setFoundMapper(null);
                }
            })
            .catch(() => !cancelled && setFoundMapper(null))
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true; };
    }, [searchMappers, mapper, token]);

    useEffect(() => {
        const updateRowCount = () => {
            if (window.innerWidth > 1200) {
                setRowCount(4); // 4 wyniki w rzędzie dla dużych ekranów
            } else if (window.innerWidth > 768) {
                setRowCount(2); // 2 wyniki w rzędzie dla średnich ekranów
            } else {
                setRowCount(1); // 1 wynik w rzędzie dla małych ekranów
            }
        };

        updateRowCount(); // Początkowe ustawienie rowCount
        
        const handleResize = () => {
            updateRowCount();
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isBeatmapInCollections = (beatmapId) => {
        return Object.values(collections.beatmaps || {}).some(bm => bm.id === beatmapId);
    };

    const areAllBeatmapsInCollections = (beatmaps) => {
        return beatmaps.every(bm => isBeatmapInCollections(bm.id));
    };

    const openAddModal = (set, beatmap, type = 'single') => {
        setModalTarget({ set, beatmap, type });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalTarget(null);
    };

    const handleAddToCollection = (collectionId, subcollectionId = null) => {
        if (!modalTarget) return;
        const { set, beatmap, type } = modalTarget;
        setCollections(prev => {
            const newBeatmaps = { ...prev.beatmaps };
            if (type === 'all') {
                set.beatmaps.forEach(bm => {
                    newBeatmaps[bm.id] = { ...bm, setId: set.id };
                });
            } else if (beatmap) {
                newBeatmaps[beatmap.id] = { ...beatmap, setId: set.id };
            }
            return { ...prev, beatmaps: newBeatmaps };
        });
        closeModal();
    };

    const handleRemoveFromCollection = (beatmapId) => {
        setCollections(prev => {
            const newBeatmaps = { ...prev.beatmaps };
            delete newBeatmaps[beatmapId];
            return { ...prev, beatmaps: newBeatmaps };
        });
    };

    const toggleDifficulty = (id) => {
        setDifficultyVisible(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };    return (
        <div className="search-artist-input-container space-y-4" ref={componentRef}>
            <div className="search-artist-input-controls flex flex-col space-y-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search beatmaps"
                    className="search-artist-input p-2 border rounded-md w-full"
                />
                <div className="flex gap-4 items-center">
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
                    <label className="flex items-center gap-2 ml-2">
                        <input
                            type="checkbox"
                            checked={searchMappers}
                            onChange={e => setSearchMappers(e.target.checked)}
                        />
                        <span>search mappers</span>
                    </label>
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

            {searchMappers && foundMapper && (
                <div className="search-mapper-result flex items-center gap-4 p-3 mb-2 bg-gray-900 rounded shadow">
                    <img
                        src={foundMapper.avatar_url}
                        alt={foundMapper.username}
                        className="w-12 h-12 rounded-full border"
                    />
                    <div>
                        <a
                            href={foundMapper.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-blue-400 hover:underline"
                        >
                            {foundMapper.username}
                        </a>
                        {foundMapper.country && (
                            <span className="ml-2 text-sm text-gray-400">({foundMapper.country})</span>
                        )}
                    </div>
                </div>
            )}

            {loading && <div className="search-artist-loading text-center">Loading...</div>}
            {error && <div className="search-artist-error text-red-500">{error}</div>}
            
            {results.length > 0 && (
                <div className="search-artist-results-info text-sm text-gray-500 mb-2">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, results.length)} of {results.length} results
                </div>
            )}            <div
                className="search-artist-results space-y-4"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${rowCount}, minmax(0, 1fr))`,
                    gap: '1rem'
                }}
            >
                {currentItems.map(set => (
                    <BeatmapItem
                        key={set.id}
                        set={set}
                        isHovered={hoveredItem === set.id}
                        singleDiff={(set.beatmaps || []).length === 1}
                        openAddModal={openAddModal}
                        handleRemoveFromCollection={handleRemoveFromCollection}
                        isBeatmapInCollections={isBeatmapInCollections}
                        areAllBeatmapsInCollections={areAllBeatmapsInCollections}                        hoveredItem={hoveredItem}
                        setHoveredItem={setHoveredItem}
                        toggleDifficulty={toggleDifficulty}
                        isDifficultyVisible={difficultyVisible[set.id] || false}
                    />
                ))}
            </div>
            {modalOpen && modalTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                        <button className="absolute top-2 right-2 text-gray-500" onClick={closeModal}>✕</button>
                        <h2 className="text-lg font-bold mb-4">Select collection to add</h2>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {collections.collections.length === 0 && <div>No collections found.</div>}
                            {collections.collections.map(col => (
                                <div key={col.id} className="border rounded p-2 mb-1">
                                    <div className="flex items-center justify-between">
                                        <span>{col.name}</span>
                                        <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => handleAddToCollection(col.id)}>
                                            Add
                                        </button>
                                    </div>
                                    {col.subcollections && col.subcollections.length > 0 && (
                                        <div className="pl-4 mt-1">
                                            {col.subcollections.map(sub => (
                                                <div key={sub.id} className="flex items-center justify-between mb-1">
                                                    <span>{sub.name}</span>
                                                    <button className="ml-2 px-2 py-1 bg-blue-400 text-white rounded text-xs" onClick={() => handleAddToCollection(col.id, sub.id)}>
                                                        Add
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
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

function BeatmapItem({ set, isHovered, singleDiff, openAddModal, handleRemoveFromCollection, isBeatmapInCollections, areAllBeatmapsInCollections, hoveredItem, setHoveredItem, toggleDifficulty, isDifficultyVisible }) {
    const beatmaps = set.beatmaps || [];
    // Fallback logic for cover images
    const coverSources = [
        set.covers?.card,
        set.covers?.cover,
        set.covers?.list,
        set.covers?.slimcover,
        set.id ? `https://assets.ppy.sh/beatmaps/${set.id}/covers/cover.jpg` : null,
        set.id ? `https://assets.ppy.sh/beatmaps/${set.id}/covers/card.jpg` : null,
        set.id ? `https://assets.ppy.sh/beatmaps/${set.id}/covers/raw.jpg` : null,
        '/favicon.ico'
    ].filter(Boolean);
    const [imgSrc, setImgSrc] = useState(coverSources[0]);
    
    useEffect(() => {
        setImgSrc(coverSources[0]);
    }, [set.id]);
    
    const handleImgError = () => {
        const idx = coverSources.indexOf(imgSrc);
        if (idx < coverSources.length - 1) setImgSrc(coverSources[idx + 1]);
    };
    
    return (
        <div
            key={set.id}
            className="search-artist-beatmap-item relative"
            style={{
                backgroundImage: `url(${imgSrc})`,
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
                    src={imgSrc}
                    alt={`${set.title} Beatmap Background`}
                    className="w-full h-full object-cover rounded-md"
                    onError={handleImgError}
                    style={{ background: '#101a2b' }}
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
                </div>                        {beatmaps.length > 0 && (
                    <>                        <button 
                            className="difficulty-toggle" 
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleDifficulty(set.id);
                            }} 
                            aria-label="Toggle difficulty details"
                        >
                            {isDifficultyVisible ? '▲' : '▼'}
                        </button>
                        <div className={`search-artist-beatmap-difficulties-wrapper ${isDifficultyVisible ? 'show-difficulties' : ''}`}>
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
                            </div>                            {isDifficultyVisible && (
                                <div className="search-artist-beatmap-difficulties-details">
                                    {beatmaps
                                        .slice()
                                        .sort((a, b) => a.difficulty_rating - b.difficulty_rating)
                                        .map(bm => {
                                            const inCollection = isBeatmapInCollections(bm.id);
                                            return (
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
                                                    <button
                                                        className={`ml-auto px-2 py-1 rounded text-xs ${inCollection ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
                                                        onClick={() => inCollection ? handleRemoveFromCollection(bm.id) : openAddModal(set, bm, 'single')}
                                                    >
                                                        {inCollection ? 'Remove difficult' : 'Add to collection'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    {beatmaps.length > 1 && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                className={`px-3 py-1 rounded text-xs ${areAllBeatmapsInCollections(beatmaps) ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
                                                onClick={() => openAddModal(set, null, 'all')}
                                            >
                                                {areAllBeatmapsInCollections(beatmaps) ? 'Remove all difficults' : 'Add all difficults'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function getDiffColor(star) {
    if (star < 2) return '#66bb6a';
    if (star < 2.7) return '#42a5f5';
    if (star < 4) return '#ab47bc';
    if (star < 5.3) return '#ffa726';
    if (star < 6.5) return '#ef5350';
    return '#616161';
}