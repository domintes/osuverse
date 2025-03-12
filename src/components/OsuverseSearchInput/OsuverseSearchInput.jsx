import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import '../../styles/cyberpunk.css';

/**
 * OsuverseSearchInput - A multifunctional search component that can:
 * 1. Search for beatmaps from the osu! API v2
 * 2. Search within local storage collections
 * 3. Display results in a modern dropdown
 * 4. Support sorting and filtering options
 */
export default function OsuverseSearchInput({ 
  onSelect, 
  placeholder = "Search beatmaps, mappers, or collections...",
  includeLocalSearch = true,
  includeApiSearch = true,
  sortOptions = ['relevance', 'difficulty', 'length', 'ranked_date']
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [searchMode, setSearchMode] = useState('all'); // 'all', 'api', 'local'
  const [error, setError] = useState(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Mock API search for development
  const mockApiSearch = useCallback((term) => {
    const mockBeatmaps = [
      {
        id: 1,
        title: "FREEDOM DiVE",
        artist: "Xi",
        creator: "Nakagawa-Kanon",
        cover_url: "https://assets.ppy.sh/beatmaps/39804/covers/cover.jpg",
        difficulty_rating: 8.18,
        bpm: 222.22,
        total_length: 256,
        ranked_date: "2012-10-22",
        source: 'api'
      },
      {
        id: 2,
        title: "The Big Black",
        artist: "The Quick Brown Fox",
        creator: "Blue Dragon",
        cover_url: "https://assets.ppy.sh/beatmaps/131891/covers/cover.jpg",
        difficulty_rating: 6.69,
        bpm: 360.00,
        total_length: 138,
        ranked_date: "2013-02-02",
        source: 'api'
      },
      {
        id: 3,
        title: "Senbonzakura",
        artist: "Kurousa P",
        creator: "pkk",
        cover_url: "https://assets.ppy.sh/beatmaps/95382/covers/cover.jpg",
        difficulty_rating: 5.77,
        bpm: 154.00,
        total_length: 320,
        ranked_date: "2013-11-30",
        source: 'api'
      }
    ];
    
    // Filter by search term
    return mockBeatmaps.filter(beatmap => 
      beatmap.title.toLowerCase().includes(term.toLowerCase()) ||
      beatmap.artist.toLowerCase().includes(term.toLowerCase()) ||
      beatmap.creator.toLowerCase().includes(term.toLowerCase())
    );
  }, []);

  // Search API function
  const searchOsuApi = useCallback(async (term) => {
    // This would be replaced with actual API call
    /* 
    const params = new URLSearchParams({
      q: term,
      sort: selectedSort
    });
    
    const response = await fetch(`https://osu.ppy.sh/api/v2/beatmapsets/search?${params}`);
    const data = await response.json();
    return data.beatmapsets;
    */
    
    // Mock response for now
    return mockApiSearch(term);
  }, [mockApiSearch]);

  // Search local collections
  const searchLocalCollections = useCallback((term) => {
    // Retrieve collections from localStorage
    const collections = JSON.parse(localStorage.getItem('collections') || '{}');
    const results = [];
    
    // Search through collections
    Object.entries(collections).forEach(([collectionName, beatmaps]) => {
      if (collectionName.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          id: `collection-${collectionName}`,
          title: collectionName,
          type: 'collection',
          beatmapCount: beatmaps.length
        });
      }
      
      // Search through beatmaps in collections
      beatmaps.forEach(beatmap => {
        if (
          beatmap.title.toLowerCase().includes(term.toLowerCase()) ||
          beatmap.artist.toLowerCase().includes(term.toLowerCase()) ||
          beatmap.creator.toLowerCase().includes(term.toLowerCase()) ||
          (beatmap.tags && beatmap.tags.some(tag => 
            tag.toLowerCase().includes(term.toLowerCase())
          ))
        ) {
          // Avoid duplicates
          if (!results.some(r => r.id === beatmap.id)) {
            results.push({
              ...beatmap,
              type: 'beatmap',
              collectionName
            });
          }
        }
      });
    });
    
    return results;
  }, []);

  // Sort results based on selected option
  const sortResults = useCallback((results, sortOption) => {
    return [...results].sort((a, b) => {
      switch (sortOption) {
        case 'difficulty':
          return (b.difficulty_rating || 0) - (a.difficulty_rating || 0);
        case 'length':
          return (b.total_length || 0) - (a.total_length || 0);
        case 'ranked_date':
          return new Date(b.ranked_date || 0) - new Date(a.ranked_date || 0);
        case 'relevance':
        default: {
          // For relevance, prioritize exact matches in title
          const aTitle = a.title || '';
          const bTitle = b.title || '';
          const searchLower = debouncedSearchTerm.toLowerCase();
          
          if (aTitle.toLowerCase() === searchLower && bTitle.toLowerCase() !== searchLower) {
            return -1;
          }
          if (bTitle.toLowerCase() === searchLower && aTitle.toLowerCase() !== searchLower) {
            return 1;
          }
          
          // Then check if title starts with search term
          if (aTitle.toLowerCase().startsWith(searchLower) && !bTitle.toLowerCase().startsWith(searchLower)) {
            return -1;
          }
          if (bTitle.toLowerCase().startsWith(searchLower) && !aTitle.toLowerCase().startsWith(searchLower)) {
            return 1;
          }
          
          return 0;
        }
      }
    });
  }, [debouncedSearchTerm]);

  // Define performSearch as useCallback to avoid dependency issues
  const performSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let combinedResults = [];
      
      // Search in osu! API if enabled
      if ((searchMode === 'all' || searchMode === 'api') && includeApiSearch) {
        const apiResults = await searchOsuApi(debouncedSearchTerm);
        combinedResults = [...apiResults];
      }
      
      // Search in local collections if enabled
      if ((searchMode === 'all' || searchMode === 'local') && includeLocalSearch) {
        const localResults = searchLocalCollections(debouncedSearchTerm);
        // Add a source property to distinguish results
        localResults.forEach(item => item.source = 'local');
        combinedResults = [...combinedResults, ...localResults];
      }
      
      // Sort combined results based on selected sort option
      const sortedResults = sortResults(combinedResults, selectedSort);
      
      setResults(sortedResults);
      setIsOpen(sortedResults.length > 0);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearchTerm, 
    selectedSort, 
    searchMode, 
    includeApiSearch, 
    includeLocalSearch, 
    searchOsuApi, 
    searchLocalCollections, 
    sortResults
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search when term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch();
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedSearchTerm, performSearch]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      setIsOpen(true);
    }
  };

  const handleResultSelect = (result) => {
    onSelect(result);
    setIsOpen(false);
  };

  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
  };

  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="osuverse-search-container">
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="osuverse-search-input cyber-input"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => searchTerm && setIsOpen(true)}
        />
        {isLoading && <div className="search-loader"></div>}
        
        <div className="search-controls">
          {includeApiSearch && includeLocalSearch && (
            <div className="search-mode-selector">
              <button 
                className={`search-mode-button ${searchMode === 'all' ? 'active' : ''}`}
                onClick={() => handleSearchModeChange('all')}
              >
                All
              </button>
              <button 
                className={`search-mode-button ${searchMode === 'api' ? 'active' : ''}`}
                onClick={() => handleSearchModeChange('api')}
              >
                osu!
              </button>
              <button 
                className={`search-mode-button ${searchMode === 'local' ? 'active' : ''}`}
                onClick={() => handleSearchModeChange('local')}
              >
                Local
              </button>
            </div>
          )}
          
          <select 
            className="sort-selector cyber-select"
            value={selectedSort}
            onChange={handleSortChange}
          >
            {sortOptions.map(option => (
              <option key={option} value={option}>
                Sort: {option.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {isOpen && (
        <div className="search-results-dropdown cyber-panel" ref={dropdownRef}>
          {error && <div className="search-error">{error}</div>}
          
          {results.length === 0 && !isLoading && !error ? (
            <div className="no-results">No results found</div>
          ) : (
            <ul className="search-results-list">
              {results.map(result => (
                <li 
                  key={`${result.source}-${result.id}`}
                  className={`search-result-item ${result.type || 'beatmap'}`}
                  onClick={() => handleResultSelect(result)}
                >
                  {result.cover_url && (
                    <div className="result-thumbnail">
                      <img src={result.cover_url} alt={result.title} />
                    </div>
                  )}
                  
                  <div className="result-info">
                    <div className="result-title">{result.title}</div>
                    {result.artist && <div className="result-artist">{result.artist}</div>}
                    {result.creator && <div className="result-creator">Mapped by {result.creator}</div>}
                    
                    {result.type === 'collection' && (
                      <div className="result-collection-info">
                        Collection • {result.beatmapCount} beatmaps
                      </div>
                    )}
                    
                    {result.type !== 'collection' && (
                      <div className="result-details">
                        {result.difficulty_rating && (
                          <span className="result-difficulty">
                            {result.difficulty_rating.toFixed(2)}★
                          </span>
                        )}
                        {result.bpm && <span className="result-bpm">{result.bpm} BPM</span>}
                        {result.total_length && (
                          <span className="result-length">{formatTime(result.total_length)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="result-source">
                    {result.source === 'local' ? (
                      <span className="source-badge local">Local</span>
                    ) : (
                      <span className="source-badge api">osu!</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
