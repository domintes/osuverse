import { useState, useEffect, useCallback } from 'react';
import { useCollection } from '../context/CollectionContext';
import { osuApi } from '../utils/osuApi';
import debounce from 'lodash/debounce';

export default function BeatmapSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'artist', direction: 'ascending' });
    const { collection, dispatch } = useCollection();

    const fetchBeatmaps = async (term, currentPage, append = false) => {
        try {
            if (currentPage === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            setError(null);

            const data = await osuApi.searchBeatmaps(term, currentPage);
            
            if (data.beatmapsets) {
                setResults(prev => append ? [...prev, ...data.beatmapsets] : data.beatmapsets);
            }
        } catch (error) {
            console.error('Error fetching beatmaps:', error);
            setError('Error fetching beatmap data. Please try again.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((searchTerm) => {
            if (searchTerm) {
                setResults([]);
                setPage(1);
                fetchBeatmaps(searchTerm, 1);
            }
        }, 500),
        []
    );

    useEffect(() => {
        debouncedSearch(query);
        return () => debouncedSearch.cancel();
    }, [query, debouncedSearch]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchBeatmaps(query, nextPage, true);
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

    const addToCollection = (beatmap) => {
        if (!collection.some(item => item.id === beatmap.id)) {
            dispatch({ type: 'ADD_TO_COLLECTION', payload: beatmap });
        }
    };

    return (
        <div className="osuverse-search-container">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Search beatmaps..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="osuverse-search-input"
                />
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : results.length > 0 ? (
                <div className="osuverse-search-result-list">
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('artist')}>
                                    Artist {sortConfig.key === 'artist' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('title')}>
                                    Title {sortConfig.key === 'title' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th>Cover</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedResults.map((beatmap) => (
                                <tr key={beatmap.id}>
                                    <td>{beatmap.artist}</td>
                                    <td>{beatmap.title}</td>
                                    <td>
                                        <img 
                                            src={beatmap.covers.list} 
                                            alt={`${beatmap.title} cover`} 
                                            loading="lazy"
                                        />
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => addToCollection(beatmap)}
                                            disabled={collection.some(item => item.id === beatmap.id)}
                                        >
                                            {collection.some(item => item.id === beatmap.id) ? 'Added' : 'Add to Collection'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {loadingMore ? (
                        <div className="loading-spinner">Loading more...</div>
                    ) : (
                        <button 
                            onClick={loadMore} 
                            className="load-more-button"
                        >
                            Load More
                        </button>
                    )}
                </div>
            ) : query && !loading && (
                <div className="no-results">
                    No beatmaps found for "{query}"
                </div>
            )}
        </div>
    );
}
