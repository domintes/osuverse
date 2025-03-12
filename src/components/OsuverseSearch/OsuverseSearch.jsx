import { useState, useRef, useEffect } from 'react';
import { debounce } from 'lodash';
import './OsuverseSearch.scss';

export default function OsuverseSearch({ onSearch }) {
    const [query, setQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeFilters, setActiveFilters] = useState([]);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Debounced search function
    const debouncedSearch = useRef(
        debounce((searchQuery) => {
            const filters = parseSearchQuery(searchQuery);
            onSearch(searchQuery, filters);
        }, 300)
    ).current;

    // Parse search query to extract filters
    const parseSearchQuery = (searchQuery) => {
        const filters = {
            tags: [],
            collections: [],
            mappers: [],
            general: []
        };

        const words = searchQuery.split(' ');
        words.forEach(word => {
            if (word.startsWith('#')) {
                // Tag filter
                filters.tags.push(word.slice(1));
            } else if (word.startsWith('@')) {
                // Mapper filter
                filters.mappers.push(word.slice(1));
            } else if (word.startsWith('collection:')) {
                // Collection filter
                filters.collections.push(word.slice(11));
            } else {
                // General search term
                filters.general.push(word);
            }
        });

        return filters;
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        debouncedSearch(value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown' && !isExpanded) {
            setIsExpanded(true);
        } else if (e.key === 'Escape') {
            setIsExpanded(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                !inputRef.current.contains(event.target)) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Clean up debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

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
                    onFocus={() => setIsExpanded(true)}
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

            {isExpanded && (
                <div className="search-dropdown void-container" ref={dropdownRef}>
                    <div className="active-filters">
                        {activeFilters.map((filter, index) => (
                            <div key={index} className="filter-tag">
                                {filter}
                                <button 
                                    className="remove-filter"
                                    onClick={() => {
                                        const newFilters = activeFilters.filter((_, i) => i !== index);
                                        setActiveFilters(newFilters);
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="search-filters">
                        <div className="filter-section">
                            <h3>Search in:</h3>
                            <div className="filter-options">
                                <label className="filter-option">
                                    <input type="checkbox" /> My Collections
                                </label>
                                <label className="filter-option">
                                    <input type="checkbox" /> All Beatmaps
                                </label>
                            </div>
                        </div>
                        <div className="filter-section">
                            <h3>Filter by:</h3>
                            <div className="filter-options">
                                <label className="filter-option">
                                    <input type="checkbox" /> Ranked Maps
                                </label>
                                <label className="filter-option">
                                    <input type="checkbox" /> Loved Maps
                                </label>
                                <label className="filter-option">
                                    <input type="checkbox" /> Unranked Maps
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
                                />
                                <span>-</span>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="10" 
                                    step="0.1" 
                                    placeholder="Max ★"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
