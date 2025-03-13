import React, { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { debounce } from 'lodash';
import useBeatmapSearch from '../../hooks/useBeatmapSearch';
import SearchSuggestions from '../SearchSuggestions/SearchSuggestions';1
import './OsuverseSearch.scss';

const OsuverseSearch = ({ placeholder = 'Szukaj...', onSearch }) => {
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
        const suggestionsList = [
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
        if (onSearch && query.trim()) {
            onSearch(results);
        }
    };

    return (
        <div className={searchBarClass} ref={inputRef}>
            <form onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    className={searchInputClass}
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                />
                <button type="submit" className={searchButtonClass}>
                    <FaSearch className={searchIconClass} />
                </button>
            </form>

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
                <div className={resultsContainerClass}>
                    <div className={resultItemClass}>
                        <SearchDropdown>
                            <SearchDropdownHeader>
                                <SearchTitle>Advanced Filters</SearchTitle>
                                <SearchCloseButton onClick={() => setIsExpanded(false)}>×</SearchCloseButton>
                            </SearchDropdownHeader>
                            
                            <SearchFilters>
                                <FilterGroup>
                                    <FilterLabel>Search in:</FilterLabel>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                                </FilterGroup>

                                <FilterGroup>
                                    <FilterLabel>Status:</FilterLabel>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                                </FilterGroup>

                                <FilterGroup>
                                    <FilterLabel>Star Rating:</FilterLabel>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FilterInput
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
                                        <span>to</span>
                                        <FilterInput
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
                                </FilterGroup>
                            </SearchFilters>
                        </SearchDropdown>
                    </div>
                </div>
            )}

            {isLoading && <LoadingIndicator>Searching...</LoadingIndicator>}
            
            {error && (
                <div style={{ 
                    padding: '10px',
                    color: '#ff6b6b',
                    marginTop: '10px',
                    textAlign: 'center'
                }}>
                    Error: {error}
                </div>
            )}
        </div>
    );
};

export default OsuverseSearch;
