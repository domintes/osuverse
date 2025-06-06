'use client';

import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '@/store/authAtom';
import { collectionsAtom } from '@/store/collectionAtom';
import './searchInput.scss';
import NeonBorderBox from './NeonBorderBox';
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

    // Dostosowanie itemsPerPage na podstawie rowCount, aby uniknąć pustych miejsc
    useEffect(() => {
        // Podstawowe wartości dla różnych rowCount
        const baseValues = {
            1: 5,  // dla 1 rzędu - 5 elementów
            2: 10, // dla 2 rzędów - 10 elementów 
            3: 12, // dla 3 rzędów - 12 elementów
            4: 16  // dla 4 rzędów - 16 elementów
        };
        
        // Ustawienie odpowiedniej wartości itemsPerPage
        setItemsPerPage(baseValues[rowCount] || 10);
    }, [rowCount]);

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
                });                // Sprawdzenie, czy sieć jest dostępna
                if (!navigator.onLine) {
                    throw new Error('Network is unavailable. Check your internet connection.');
                }                const res = await fetch(`/api/search?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (!res.ok) {
                    if (res.status === 500) {
                        throw new Error('Internal server error. Please try again later.');
                    } else if (res.status === 401 || res.status === 403) {
                        throw new Error('Authorization error. Your session may have expired. Please try logging in again.');
                    } else if (res.status === 404) {
                        throw new Error('Beatmap not found or API endpoint does not exist.');
                    } else {
                        const errorData = await res.json().catch(() => ({ error: `HTTP Error: ${res.status}` }));
                        throw new Error(errorData.error || 'Error fetching beatmap');
                    }
                }
                
                const data = await res.json();
                setResults(data.beatmaps);            } catch (err) {
                console.error('Search error:', err.message);
                if (err.message === 'Failed to fetch') {
                    setError('Cannot connect to the server. Check your internet connection or try again later.');
                } else {
                    setError(err.message);
                }
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [query, artist, mapper, token, filters]);    useEffect(() => {
        if (!searchMappers || !mapper || !token) {
            setFoundMapper(null);
            return;
        }
        let cancelled = false;
        setFoundMapper(null);
        setLoading(true);
        setError(null);
        
        // Check if the network is available
        if (!navigator.onLine) {
            setError('Network is unavailable. Check your internet connection.');
            setLoading(false);
            return;
        }

        // Fetch mapper data
        fetch(`/api/user?username=${encodeURIComponent(mapper)}&token=${encodeURIComponent(token)}`)            .then(res => {
                if (!res.ok) {
                    if (res.status === 500) {
                        throw new Error('Internal server error. Please try again later.');
                    } else if (res.status === 401 || res.status === 403) {
                        throw new Error('Authorization error. Your session may have expired. Please try logging in again.');
                    } else if (res.status === 404) {
                        throw new Error('Mapper not found.');
                    } else {
                        throw new Error(`HTTP Error: ${res.status}`);
                    }
                }
                return res.json();
            })
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
            .catch((err) => {
                if (!cancelled) {
                    console.error('Mapper search error:', err.message);
                    if (err.message === 'Failed to fetch') {
                        setError('Cannot connect to the server. Check your internet connection or try again later.');
                    } else {
                        setError(`Mapper search error: ${err.message}`);
                    }
                    setFoundMapper(null);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
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

    // Obserwuj stan połączenia z siecią
    useEffect(() => {
        const handleOnlineStatusChange = () => {            if (!navigator.onLine && (query || artist || mapper)) {
                setError('Network is unavailable. Internet connection was interrupted.');
            } else if (navigator.onLine && error?.includes('connect')) {
                // If connection was restored, clear the error
                setError(null);
            }
        };

        window.addEventListener('online', handleOnlineStatusChange);
        window.addEventListener('offline', handleOnlineStatusChange);
        
        return () => {
            window.removeEventListener('online', handleOnlineStatusChange);
            window.removeEventListener('offline', handleOnlineStatusChange);
        };
    }, [query, artist, mapper, error]);

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
    };    return (        <div className="search-artist-input-container" ref={componentRef}>
            <div className="search-artist-input-controls">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search beatmaps"
                    className="search-artist-input"
                />
                <div className="search-artist-input-group">
                    <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        placeholder="Artists filter"
                        className="search-artist-input"
                    />
                    <input
                        type="text"
                        value={mapper}
                        onChange={(e) => setMapper(e.target.value)}
                        placeholder="Mappers filter"
                        className="search-artist-input"
                    />
                    <label className="search-artist-checkbox-label">
                        <input
                            type="checkbox"
                            checked={searchMappers}
                            onChange={e => setSearchMappers(e.target.checked)}
                        />
                        <span>search mappers</span>
                    </label>
                </div>                <div className="search-artist-input-select-group">
                    <div className="search-artist-filter">
                        <label className="search-artist-filter-label">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="search-artist-select"
                        >
                            <option value="all">All Status</option>
                            <option value="ranked">Ranked</option>
                            <option value="loved">Loved</option>
                            <option value="pending">Pending</option>
                            <option value="graveyard">Graveyard</option>
                        </select>
                    </div>
                    <div className="search-artist-filter">
                        <label className="search-artist-filter-label">Game Mode</label>
                        <select
                            value={filters.mode}
                            onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value }))}
                            className="search-artist-select"
                        >
                            <option value="all">All Modes</option>
                            <option value="osu">osu!</option>
                            <option value="mania">osu!mania</option>
                            <option value="taiko">osu!taiko</option>
                            <option value="fruits">osu!catch</option>
                        </select>
                    </div>                    <div className="search-artist-filter">
                        <label className="search-artist-filter-label">Results per page</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="search-artist-select"
                        >
                            {rowCount === 1 && (
                                <>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                </>
                            )}
                            {rowCount === 2 && (
                                <>
                                    <option value={8}>8</option>
                                    <option value={10}>10</option>
                                    <option value={12}>12</option>
                                    <option value={20}>20</option>
                                </>
                            )}
                            {rowCount === 3 && (
                                <>
                                    <option value={9}>9</option>
                                    <option value={12}>12</option>
                                    <option value={15}>15</option>
                                    <option value={24}>24</option>
                                </>
                            )}
                            {rowCount === 4 && (
                                <>
                                    <option value={8}>8</option>
                                    <option value={12}>12</option>
                                    <option value={16}>16</option>
                                    <option value={20}>20</option>
                                    <option value={24}>24</option>
                                </>
                            )}
                        </select>
                    </div>                    <div className="search-artist-filter">
                        <label className="search-artist-filter-label">Row of results</label>
                        <select
                            value={rowCount}
                            onChange={e => setRowCount(Number(e.target.value))}
                            className="search-artist-select"
                        >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                        </select>
                    </div>
                </div>
            </div>            {searchMappers && foundMapper && (
                <div className="search-artist-mapper-result">
                    <img
                        src={foundMapper.avatar_url}
                        alt={foundMapper.username}
                        className="search-artist-mapper-avatar"
                    />
                    <div className="search-artist-mapper-info">
                        <a
                            href={foundMapper.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="search-artist-mapper-name"
                        >
                            {foundMapper.username}
                        </a>
                        {foundMapper.country && (
                            <span className="search-artist-mapper-country">({foundMapper.country})</span>
                        )}
                    </div>
                </div>            )}            {loading && <div className="search-artist-loading">Loading...</div>}            {error && (                <NeonBorderBox 
                    error 
                    className="search-artist-error-box"
                    title="An error occurred:"
                    message={error}
                    onRetry={error.includes('connect') || error.includes('network') ? () => {
                        // Re-inicjalizacja zapytania
                        setError(null);
                        setLoading(true);
                        setTimeout(() => {
                            // Symulacja nowej próby
                            const currentQuery = query;
                            setQuery("");
                            setTimeout(() => setQuery(currentQuery), 10);
                        }, 300);
                    } : null}
                    onClose={() => setError(null)}
                />
            )}
            
            {results.length > 0 && (
                <div className="search-artist-results-info">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, results.length)} of {results.length} results
                </div>
            )}            <div
                className={`search-artist-results search-artist-results-${rowCount}-columns`}
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
            </div>                {modalOpen && modalTarget && (
                <div className="search-artist-modal-overlay">
                    <div className="search-artist-modal-content">
                        <button className="search-artist-modal-close" onClick={closeModal}>✕</button>
                        <h2 className="search-artist-modal-title">Select collection to add</h2>
                        <div className="search-artist-modal-items">
                            {collections.collections.length === 0 && <div>No collections found.</div>}
                            {collections.collections.map(col => (
                                <div key={col.id} className="search-artist-collection-item">
                                    <div className="search-artist-collection-header">
                                        <span className="search-artist-collection-name">{col.name}</span>
                                        <button className="search-artist-collection-button" onClick={() => handleAddToCollection(col.id)}>
                                            Add
                                        </button>
                                    </div>
                                    {col.subcollections && col.subcollections.length > 0 && (
                                        <div className="search-artist-subcollections">
                                            {col.subcollections.map(sub => (
                                                <div key={sub.id} className="search-artist-subcollection-item">
                                                    <span>{sub.name}</span>
                                                    <button className="search-artist-subcollection-button" onClick={() => handleAddToCollection(col.id, sub.id)}>
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
            )}            {results.length > 0 && (
                <div className="search-artist-pagination">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="search-artist-pagination-button"
                    >
                        First
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="search-artist-pagination-button"
                    >
                        Previous
                    </button>
                    
                    <span className="search-artist-pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="search-artist-pagination-button"
                    >
                        Next
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="search-artist-pagination-button"
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
    
    return (        <div
            key={set.id}
            className="search-artist-beatmap-item"
            style={{'--beatmap-bg-image': `url(${imgSrc})`}}
            onMouseEnter={() => setHoveredItem(set.id)}
            onMouseLeave={() => setHoveredItem(null)}
        >
            <div className="search-artist-beatmap-thumbnail">                <img 
                    src={imgSrc}
                    alt={`${set.title} Beatmap Background`}
                    onError={handleImgError}
                    className="beatmap-thumbnail-img"
                />
            </div>
            <div className="search-artist-beatmap-info">                <div className="search-artist-beatmap-title">
                    <a href={`https://osu.ppy.sh/beatmapsets/${set.id}`} target="_blank" rel="noopener noreferrer">
                        {set.artist} - {set.title}
                    </a>
                </div>
                <div className="search-artist-beatmap-details">
                    <span className="search-artist-beatmap-mapper">
                        mapped by <a href={`https://osu.ppy.sh/users/${set.user_id}`} target="_blank" rel="noopener noreferrer">{set.creator}</a>
                    </span>
                    <span className="search-artist-beatmap-status">
                        {set.status}
                    </span>
                </div>{beatmaps.length > 0 && (
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
                            <div className="search-artist-beatmap-difficulties-squares">
                                {beatmaps
                                    .slice()
                                    .sort((a, b) => a.difficulty_rating - b.difficulty_rating)
                                    .map((bm) => (                                            <div
                                            key={bm.id}
                                            className={`difficulty-rect difficulty-${getDifficultyClass(bm.difficulty_rating)}`}
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
                                            return (                                <div key={bm.id} className="search-artist-beatmap-difficulty">                                                    <span 
                                                        className={`search-artist-beatmap-difficulty-indicator difficulty-${getDifficultyClass(bm.difficulty_rating)}`}
                                                    />
                                                    <a 
                                                        href={`https://osu.ppy.sh/beatmaps/${bm.id}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="search-artist-beatmap-difficulty-name"
                                                    >
                                                        {bm.version}
                                                    </a>
                                                    <span className="search-artist-beatmap-difficulty-rating">
                                                        {bm.difficulty_rating.toFixed(2)}★
                                                    </span>
                                                    <button
                                                        className={`search-artist-beatmap-difficulty-button ${inCollection ? 'remove' : 'add'}`}
                                                        onClick={() => inCollection ? handleRemoveFromCollection(bm.id) : openAddModal(set, bm, 'single')}
                                                    >
                                                        {inCollection ? 'Remove difficult' : 'Add to collection'}
                                                    </button>
                                                </div>
                                            );
                                        })}                                    {beatmaps.length > 1 && (
                                        <div className="search-artist-beatmap-difficulty-all">
                                            <button
                                                className={`search-artist-beatmap-difficulty-button ${areAllBeatmapsInCollections(beatmaps) ? 'remove' : 'add'}`}
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

function getDifficultyClass(star) {
    if (star < 2) return 'easy';
    if (star < 2.7) return 'normal';
    if (star < 4) return 'hard';
    if (star < 5.3) return 'insane';
    if (star < 6.5) return 'expert';
    return 'extreme';
}