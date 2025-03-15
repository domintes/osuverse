import React, { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { debounce } from 'lodash';
import useBeatmapSearch from '../../hooks/useBeatmapSearch';
import SearchSuggestions from '../SearchSuggestions/SearchSuggestions';
import './OsuverseSearch.css';

const OsuverseSearch = ({ placeholder = 'Szukaj...', onSearch = () => {} }) => {
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
        
        // Sprawdź czy onSearch jest funkcją przed wywołaniem
        if (typeof onSearch === 'function') {
            onSearch(results);
        }
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
        // Zabezpieczenie przed błędem undefined is not iterable
        const suggestionsList = suggestions ? [
            ...(suggestions.tags || []),
            ...(suggestions.collections || []),
            ...(suggestions.mappers || []),
            ...(suggestions.filters || [])
        ] : [];

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!showSuggestions) {
                    setShowSuggestions(true);
                    setActiveIndex(0);
                } else {
                    setActiveIndex((prev) => 
                        prev < suggestionsList.length - 1 ? prev + 1 : prev
                    );
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((prev) => prev > 0 ? prev - 1 : prev);
                break;

            case 'Enter':
                if (activeIndex >= 0 && activeIndex < suggestionsList.length) {
                    e.preventDefault();
                    handleSuggestionSelect(suggestionsList[activeIndex]);
                }
                break;

            case 'Escape':
                setShowSuggestions(false);
                setActiveIndex(-1);
                break;

            case 'Tab':
                if (showSuggestions && suggestionsList.length > 0) {
                    e.preventDefault();
                    handleSuggestionSelect(suggestionsList[0]);
                }
                break;

            default:
                if (e.key.match(/^[1-9]$/) && e.metaKey) {
                    e.preventDefault();
                    const index = parseInt(e.key) - 1;
                    if (index < suggestionsList.length) {
                        handleSuggestionSelect(suggestionsList[index]);
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

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            handleSearch(query);
            // Sprawdź czy onSearch jest funkcją przed wywołaniem
            if (typeof onSearch === 'function') {
                onSearch(results);
            }
        }
    };

    return (
        <div className="osuverse-search" ref={inputRef}>
            <form onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    className="osuverse-search__input"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                />
                <button type="submit" className="osuverse-search__button">
                    <FaSearch className="osuverse-search__icon" />
                </button>
            </form>

            {showSuggestions && (
                <div ref={dropdownRef}>
                    <SearchSuggestions
                        suggestions={suggestions || {tags: [], collections: [], mappers: [], filters: []}}
                        query={query.split(' ').pop() || ''}
                        onSelect={handleSuggestionSelect}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                        visible={showSuggestions}
                    />
                </div>
            )}

            {isExpanded && (
                <div className="osuverse-search__results">
                    <div className="osuverse-search__result-item">
                        <div className="search-dropdown">
                            <div className="search-dropdown__header">
                                <div className="search-dropdown__title">Zaawansowane filtry</div>
                                <button className="search-dropdown__close-button" onClick={() => setIsExpanded(false)}>×</button>
                            </div>
                            
                            <div className="search-filters">
                                <div className="filter-group">
                                    <div className="filter-label">Szukaj w:</div>
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
                                            Moje kolekcje
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
                                            Wszystkie Beatmapy
                                        </label>
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <div className="filter-label">Status:</div>
                                    <div className="filter-options">
                                        <label className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={filters.ranked}
                                                onChange={(e) => {
                                                    setFilters(prev => ({
                                                        ...prev,
                                                        ranked: e.target.checked
                                                    }));
                                                    handleSearch(query);
                                                }}
                                            />
                                            Ranked
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
                                            Loved
                                        </label>
                                        <label className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={filters.unranked}
                                                onChange={(e) => {
                                                    setFilters(prev => ({
                                                        ...prev,
                                                        unranked: e.target.checked
                                                    }));
                                                    handleSearch(query);
                                                }}
                                            />
                                            Unranked
                                        </label>
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <div className="filter-label">Gwiazdki:</div>
                                    <div className="filter-range">
                                        <input
                                            className="filter-input"
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minStars}
                                            onChange={(e) => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    minStars: e.target.value
                                                }));
                                                handleSearch(query);
                                            }}
                                            min="0"
                                            max="12"
                                            step="0.1"
                                        />
                                        <span>do</span>
                                        <input
                                            className="filter-input"
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxStars}
                                            onChange={(e) => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    maxStars: e.target.value
                                                }));
                                                handleSearch(query);
                                            }}
                                            min="0"
                                            max="12"
                                            step="0.1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && <div className="loading-indicator">Szukanie...</div>}
            
            {error && (
                <div className="error-message">
                    Błąd: {error}
                </div>
            )}
        </div>
    );
};

export default OsuverseSearch;
