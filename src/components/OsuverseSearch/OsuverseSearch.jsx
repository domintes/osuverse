import { useState, useRef, useEffect } from 'react';
import { debounce } from 'lodash';
import useBeatmapSearch from '../../hooks/useBeatmapSearch';
import SearchSuggestions from '../SearchSuggestions/SearchSuggestions';
import './OsuverseSearch.scss';

export default function OsuverseSearch({ onSearch }) {
    const [query, setQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [filters, setFilters] = useState({
        collections: true,
        allBeatmaps: true,
        ranked: false,
        loved: false,
        unranked: false,
        minStars: '',
        maxStars: ''
    });

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const { search, getSuggestions, results, isLoading, error } = useBeatmapSearch();

    // Pobierz sugestie na podstawie aktualnego zapytania
    const suggestions = getSuggestions(query);

    // Obsługa wyszukiwania
    const handleSearch = debounce((searchQuery) => {
        const filterQuery = [];
        
        if (filters.ranked) filterQuery.push('ranked:yes');
        if (filters.loved) filterQuery.push('loved:yes');
        if (filters.unranked) filterQuery.push('ranked:no');
        if (filters.minStars) filterQuery.push(`stars>${filters.minStars}`);
        if (filters.maxStars) filterQuery.push(`stars<${filters.maxStars}`);

        const fullQuery = [searchQuery, ...filterQuery].join(' ').trim();
        search(fullQuery);
        onSearch(results);
    }, 300);

    // Obsługa zmiany inputa
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setShowSuggestions(true);
        handleSearch(value);
    };

    // Obsługa wyboru sugestii
    const handleSuggestionSelect = (suggestion) => {
        const words = query.split(' ');
        words[words.length - 1] = suggestion.value;
        const newQuery = words.join(' ');
        setQuery(newQuery);
        setShowSuggestions(false);
        inputRef.current.focus();
        handleSearch(newQuery);
    };

    // Obsługa klawiszy
    const handleKeyDown = (e) => {
        const suggestions = [
            ...suggestions.tags,
            ...suggestions.collections,
            ...suggestions.mappers,
            ...suggestions.filters
        ];

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!showSuggestions) {
                    setShowSuggestions(true);
                    setActiveIndex(0);
                } else {
                    setActiveIndex((prev) => 
                        prev < suggestions.length - 1 ? prev + 1 : prev
                    );
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((prev) => prev > 0 ? prev - 1 : prev);
                break;

            case 'Enter':
                if (activeIndex >= 0 && activeIndex < suggestions.length) {
                    e.preventDefault();
                    handleSuggestionSelect(suggestions[activeIndex]);
                }
                break;

            case 'Escape':
                setShowSuggestions(false);
                setActiveIndex(-1);
                break;

            case 'Tab':
                if (showSuggestions && suggestions.length > 0) {
                    e.preventDefault();
                    handleSuggestionSelect(suggestions[0]);
                }
                break;

            default:
                if (e.key.match(/^[1-9]$/) && e.metaKey) {
                    e.preventDefault();
                    const index = parseInt(e.key) - 1;
                    if (index < suggestions.length) {
                        handleSuggestionSelect(suggestions[index]);
                    }
                }
                break;
        }
    };

    // Zamykanie sugestii przy kliknięciu poza
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                !inputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="osuverse-search">
            <div className="search-input-container void-container">
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search beatmaps, collections, or use #tags..."
                />
                <button 
                    className="expand-filters-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? "Hide filters" : "Show filters"}
                >
                    <span className={`arrow-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                </button>
            </div>

            {showSuggestions && (
                <div ref={dropdownRef}>
                    <SearchSuggestions
                        suggestions={suggestions}
                        query={query.split(' ').pop() || ''}
                        onSelect={handleSuggestionSelect}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                        visible={showSuggestions}
                    />
                </div>
            )}

            {isExpanded && (
                <div className="search-filters void-container">
                    <div className="filter-section">
                        <h3>Search in:</h3>
                        <div className="filter-options">
                            <label className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={filters.collections}
                                    onChange={(e) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            collections: e.target.checked
                                        }));
                                        handleSearch(query);
                                    }}
                                />
                                My Collections
                            </label>
                            <label className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={filters.allBeatmaps}
                                    onChange={(e) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            allBeatmaps: e.target.checked
                                        }));
                                        handleSearch(query);
                                    }}
                                />
                                All Beatmaps
                            </label>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3>Filter by:</h3>
                        <div className="filter-options">
                            <label className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={filters.ranked}
                                    onChange={(e) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            ranked: e.target.checked,
                                            unranked: e.target.checked ? false : prev.unranked
                                        }));
                                        handleSearch(query);
                                    }}
                                />
                                Ranked Maps
                            </label>
                            <label className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={filters.loved}
                                    onChange={(e) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            loved: e.target.checked
                                        }));
                                        handleSearch(query);
                                    }}
                                />
                                Loved Maps
                            </label>
                            <label className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={filters.unranked}
                                    onChange={(e) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            unranked: e.target.checked,
                                            ranked: e.target.checked ? false : prev.ranked
                                        }));
                                        handleSearch(query);
                                    }}
                                />
                                Unranked Maps
                            </label>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3>Difficulty Range:</h3>
                        <div className="filter-options range-inputs">
                            <input 
                                type="number" 
                                min="0" 
                                max="10" 
                                step="0.1" 
                                placeholder="Min ★"
                                value={filters.minStars}
                                onChange={(e) => {
                                    setFilters(prev => ({
                                        ...prev,
                                        minStars: e.target.value
                                    }));
                                    handleSearch(query);
                                }}
                            />
                            <span>-</span>
                            <input 
                                type="number" 
                                min="0" 
                                max="10" 
                                step="0.1" 
                                placeholder="Max ★"
                                value={filters.maxStars}
                                onChange={(e) => {
                                    setFilters(prev => ({
                                        ...prev,
                                        maxStars: e.target.value
                                    }));
                                    handleSearch(query);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="search-status loading">
                    Searching...
                </div>
            )}

            {error && (
                <div className="search-status error">
                    Error: {error}
                </div>
            )}
        </div>
    );
}
