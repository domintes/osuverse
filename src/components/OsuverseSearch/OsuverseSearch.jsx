import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaChevronDown, FaChevronUp, FaPlus, FaUserPlus } from 'react-icons/fa';
import { debounce } from 'lodash';
import useBeatmapSearch from '../../hooks/useBeatmapSearch';
import useUserSearch from '../../hooks/useUserSearch';
import SearchSuggestions from '../SearchSuggestions/SearchSuggestions';
import './OsuverseSearch.css';

const OsuverseSearch = ({ placeholder = 'Szukaj...', onSearch = () => {} }) => {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [searchSection, setSearchSection] = useState('everything'); // 'everything', 'collection', 'users'
    const [expandedBeatmapsets, setExpandedBeatmapsets] = useState(new Set());
    const [userResults, setUserResults] = useState([]);

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const { search, getSuggestions, results, isLoading: isBeatmapLoading, error: beatmapError } = useBeatmapSearch();
    const { searchUsers, isLoading: isUserLoading, error: userError } = useUserSearch();

    // Pobierz sugestie na podstawie aktualnego zapytania
    const suggestions = getSuggestions(query);

    const toggleBeatmapsetExpansion = (beatmapsetId) => {
        setExpandedBeatmapsets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(beatmapsetId)) {
                newSet.delete(beatmapsetId);
            } else {
                newSet.add(beatmapsetId);
            }
            return newSet;
        });
    };

    // Modyfikacja handleSearch aby obsługiwać różne sekcje
    const handleSearch = debounce(async (searchQuery) => {
        if (!searchQuery.trim()) return;

        if (searchSection === 'users') {
            const users = await searchUsers(searchQuery);
            setUserResults(users.slice(0, 8));
        } else {
            search(searchQuery, searchSection === 'collection');
        }
        
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
            <div className="osuverse-search__header">
                <form onSubmit={handleSearchSubmit} className="osuverse-search__form">
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
                <div className="osuverse-search__sections">
                    <button 
                        className={`section-button ${searchSection === 'everything' ? 'active' : ''}`}
                        onClick={() => setSearchSection('everything')}
                    >
                        Everything in osu!
                    </button>
                    <button 
                        className={`section-button ${searchSection === 'collection' ? 'active' : ''}`}
                        onClick={() => setSearchSection('collection')}
                    >
                        Your Collection
                    </button>
                    <button 
                        className={`section-button ${searchSection === 'users' ? 'active' : ''}`}
                        onClick={() => setSearchSection('users')}
                    >
                        Players
                    </button>
                </div>
            </div>

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

            {searchSection === 'users' && userResults.length > 0 ? (
                <div className="osuverse-search__results">
                    {userResults.map(user => (
                        <div key={user.id} className="user-item">
                            <div className="user-info">
                                <img src={user.avatar_url} alt={user.username} className="user-avatar" />
                                <div className="user-details">
                                    <div className="user-name">{user.username}</div>
                                    <div className="user-rank">#{user.statistics?.global_rank || '?'}</div>
                                </div>
                            </div>
                            <button className="add-user-button" onClick={() => {/* Dodaj obsługę dodawania użytkownika */}}>
                                <FaUserPlus /> Add User
                            </button>
                        </div>
                    ))}
                </div>
            ) : results.length > 0 && (
                <div className="osuverse-search__results">
                    {results.map(beatmapset => (
                        <div key={beatmapset.id} className="beatmapset-item">
                            <div className="beatmapset-header" onClick={() => toggleBeatmapsetExpansion(beatmapset.id)}>
                                <div className="beatmapset-thumbnail">
                                    <img src={beatmapset.covers.card} alt={beatmapset.title} />
                                </div>
                                <div className="beatmapset-info">
                                    <div className="beatmapset-title">
                                        {beatmapset.artist} - {beatmapset.title}
                                    </div>
                                    <div className="beatmapset-mapper">
                                        mapped by {beatmapset.creator}
                                    </div>
                                </div>
                                <div className="beatmapset-actions">
                                    <button 
                                        className={`add-all-button ${beatmapset.isInCollection ? 'remove' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Tutaj dodamy funkcję dodawania/usuwania wszystkich beatmap
                                        }}
                                    >
                                        <FaPlus /> {beatmapset.isInCollection ? 'Remove All' : 'Add All'}
                                    </button>
                                    {expandedBeatmapsets.has(beatmapset.id) ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                            </div>
                            
                            {expandedBeatmapsets.has(beatmapset.id) && (
                                <div className="beatmapset-difficulties">
                                    {beatmapset.beatmaps.map(beatmap => (
                                        <div key={beatmap.id} className="difficulty-item">
                                            <div className="difficulty-info">
                                                <span className="difficulty-name">{beatmap.version}</span>
                                                <span className="difficulty-stars">{beatmap.difficulty_rating.toFixed(2)}★</span>
                                            </div>
                                            <button 
                                                className={`add-difficulty-button ${beatmap.isInCollection ? 'remove' : ''}`}
                                                onClick={() => {
                                                    // Tutaj dodamy funkcję dodawania/usuwania pojedynczej beatmapy
                                                }}
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {(isBeatmapLoading || isUserLoading) && <div className="loading-indicator">Szukanie...</div>}
            
            {(beatmapError || userError) && (
                <div className="error-message">
                    Błąd: {beatmapError || userError}
                </div>
            )}
        </div>
    );
};

export default OsuverseSearch;
