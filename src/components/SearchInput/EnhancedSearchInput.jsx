'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAtom } from 'jotai';
import { collectionsReducerAtom } from '@/store/collectionsReducerAtom';
import { authAtom } from '@/store/authAtom';
import Fuse from 'fuse.js';
import { motion } from 'motion';
import './enhancedSearchInput.scss';

/**
 * Zaawansowany komponent wyszukiwania bazujący na fuse.js dla lepszych wyników
 */
const EnhancedSearchInput = ({ 
  onSearch, 
  placeholder = 'Wyszukaj beatmapy...',
  debounceTime = 300,
  className = '',
  searchOptions = {
    keys: ['title', 'artist', 'creator', 'tags'],
    threshold: 0.3,
    ignoreLocation: true,
    useExtendedSearch: true
  }
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [state] = useAtom(collectionsReducerAtom);
  const [token] = useAtom(authAtom);
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Konfiguracja fuse.js dla wyszukiwania lokalnego
  const fuse = useMemo(() => {
    // Przygotuj dane do wyszukiwania
    const beatmapData = Object.values(state.beatmaps || {}).map(beatmap => {
      // Znajdź beatmapset dla tej beatmapy
      const beatmapset = state.beatmapsets?.[beatmap.beatmapset_id];
      
      return {
        id: beatmap.id,
        beatmapset_id: beatmap.beatmapset_id,
        title: beatmapset?.title || '',
        artist: beatmapset?.artist || '',
        creator: beatmapset?.creator || '',
        tags: [...(beatmap.tags || []), ...(beatmap.userTags || [])],
        difficulty_name: beatmap.version || '',
        difficulty_rating: beatmap.difficulty_rating || 0
      };
    });

    return new Fuse(beatmapData, searchOptions);
  }, [state.beatmaps, state.beatmapsets, searchOptions]);

  // Funkcja do wyszukiwania lokalnego
  const performLocalSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return [];
    }
    
    const results = fuse.search(searchQuery);
    setSearchResults(results.map(r => r.item));
    return results.map(r => r.item);
  };

  // Funkcja do wyszukiwania na serwerze
  const performServerSearch = async (searchQuery) => {
    if (!token || !searchQuery.trim()) return [];
    
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({ query: searchQuery });
      const response = await fetch(`/api/search?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Błąd wyszukiwania');
      
      const data = await response.json();
      return data.beatmaps || [];
    } catch (error) {
      console.error('Błąd wyszukiwania:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Debouncing dla wyszukiwania
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performLocalSearch(query);
      }
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [query, debounceTime]);

  // Obsługa wyszukiwania pełnego
  const handleSearch = async (e) => {
    e?.preventDefault();
    setShowSuggestions(false);
    
    let results = performLocalSearch(query);
    
    // Jeśli lokalnie jest mniej niż 5 wyników, wyszukaj również na serwerze
    if (results.length < 5) {
      const serverResults = await performServerSearch(query);
      
      // Połącz wyniki, unikając duplikatów
      const mergedResults = [...results];
      serverResults.forEach(serverItem => {
        if (!results.some(localItem => localItem.id === serverItem.id)) {
          mergedResults.push(serverItem);
        }
      });
      
      results = mergedResults;
    }
    
    if (onSearch) {
      onSearch(results);
    }
  };

  return (
    <div className={`enhanced-search-container ${className}`}>
      <form onSubmit={handleSearch} className="enhanced-search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) {
              setShowSuggestions(true);
            } else {
              setShowSuggestions(false);
            }
          }}
          placeholder={placeholder}
          className="enhanced-search-input"
          onFocus={() => query.trim() && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        
        <motion.button 
          type="submit"
          className="enhanced-search-button"
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? 'Szukam...' : 'Szukaj'}
        </motion.button>
      </form>
      
      {showSuggestions && searchResults.length > 0 && (
        <motion.div 
          className="search-suggestions"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {searchResults.slice(0, 5).map(result => (
            <div 
              key={result.id} 
              className="search-suggestion-item"
              onClick={() => {
                setQuery(`${result.artist} - ${result.title}`);
                handleSearch();
              }}
            >
              <div className="suggestion-main">
                <span className="suggestion-artist">{result.artist}</span>
                <span className="suggestion-title">{result.title}</span>
              </div>
              <div className="suggestion-details">
                <span className="suggestion-mapper">mapper: {result.creator}</span>
                <span className="suggestion-difficulty">
                  {result.difficulty_name} ({result.difficulty_rating.toFixed(2)}★)
                </span>
              </div>
            </div>
          ))}
          
          {searchResults.length > 5 && (
            <div className="more-results">
              + {searchResults.length - 5} więcej wyników
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedSearchInput;
