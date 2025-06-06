"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import MainOsuverseDiv from '@/components/MainOsuverseDiv';
import BeatmapSearchResults from '@/components/BeatmapSearchResults/BeatmapSearchResults';
import { useAtom } from 'jotai';
import { authAtom } from '@/store/authAtom';
import OsuversePopup from '@/components/OsuversePopup/OsuversePopup';
import '@/components/BeatmapSearchResults/beatmapSearchResults.scss';
import '@/components/OsuversePopup/osuversePopup.scss';
import './search.scss';

export default function SearchPage() {
    useAuth();
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

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!token) return;

        setLoading(true);
        setError(null);        try {
            const queryParams = new URLSearchParams();
            if (query) queryParams.append('query', query);
            if (artist) queryParams.append('artist', artist);
            if (mapper) queryParams.append('mapper', mapper);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.mode) queryParams.append('mode', filters.mode);

            const res = await fetch(`/api/search?${queryParams.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });            if (!res.ok) throw new Error('Error during search');

            const data = await res.json();
            setResults(data.beatmaps || []);
            setCurrentPage(1);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to fetch results. Please try again later.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Paginacja
    const totalResults = results.length;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <MainOsuverseDiv className="search-container">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#ea81fb', textShadow: '0 0 16px #2f0f3a' }}>Find beatmaps by artist</h1>
            
            <form onSubmit={handleSearch} className="beatmap-search-form">
                <div className="beatmap-search-form-inputs">
                    <div className="beatmap-search-input-group">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search beatmaps"
                            className="beatmap-search-input"
                        />
                    </div>
                    
                    <div className="beatmap-search-secondary-inputs">
                        <input
                            type="text"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            placeholder="Artist filter"
                            className="beatmap-search-input"
                        />
                        <input
                            type="text"
                            value={mapper}
                            onChange={(e) => setMapper(e.target.value)}
                            placeholder="Mapper filter"
                            className="beatmap-search-input"
                        />
                    </div>
                    
                    <div className="beatmap-search-selects">
                        <div className="beatmap-search-select-group">
                            <label className="beatmap-search-select-label">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="beatmap-search-select"
                            >
                                <option value="all">All Status</option>
                                <option value="ranked">Ranked</option>
                                <option value="loved">Loved</option>
                                <option value="pending">Pending</option>
                                <option value="graveyard">Graveyard</option>
                            </select>
                        </div>
                        
                        <div className="beatmap-search-select-group">
                            <label className="beatmap-search-select-label">Game Mode</label>
                            <select
                                value={filters.mode}
                                onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value }))}
                                className="beatmap-search-select"
                            >
                                <option value="all">All Modes</option>
                                <option value="0">osu!</option>
                                <option value="1">osu!taiko</option>
                                <option value="2">osu!catch</option>
                                <option value="3">osu!mania</option>
                            </select>
                        </div>
                        
                        <div className="beatmap-search-select-group">
                            <label className="beatmap-search-select-label">Layout</label>
                            <select
                                value={rowCount}
                                onChange={e => setRowCount(Number(e.target.value))}
                                className="beatmap-search-select"
                            >
                                <option value={1}>1 column</option>
                                <option value={2}>2 columns</option>
                                <option value={3}>3 columns</option>
                                <option value={4}>4 columns</option>
                            </select>
                        </div>
                        
                        <div className="beatmap-search-select-group">
                            <label className="beatmap-search-select-label">Per Page</label>
                            <select
                                value={itemsPerPage}
                                onChange={e => setItemsPerPage(Number(e.target.value))}
                                className="beatmap-search-select"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    className="beatmap-search-button"
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && (
                <div className="beatmap-search-error">
                    {error}
                </div>
            )}            {results.length > 0 && (
                <div className="beatmap-search-results-info">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, results.length)} of {results.length} results
                    <OsuversePopup buttonClassName="beatmap-search-help-button" />
                </div>
            )}

            <BeatmapSearchResults
                results={currentItems}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                rowCount={rowCount}
                onPageChange={handlePageChange}
                totalResults={results.length}
            />
        </MainOsuverseDiv>
    );
}