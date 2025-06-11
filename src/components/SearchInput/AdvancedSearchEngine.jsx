'use client';

import { useState, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';
import { Search, X } from 'lucide-react';
import './advancedSearchEngine.scss';

/**
 * Zaawansowany silnik wyszukiwania wykorzystujący FuseJS dla wyszukiwania rozmytego
 * Obsługuje różne typy danych, różne opcje wyszukiwania i przeszukiwanie złożonych obiektów
 */
export default function AdvancedSearchEngine({
  data = [],
  keys = ['name'],
  threshold = 0.4, // Próg dopasowania (0 = dokładne dopasowanie, 1 = dowolne dopasowanie)
  onResultsChange,
  minCharacters = 2,
  placeholder = 'Szukaj...',
  className = '',
  renderResult = null, // Custom renderer dla wyników
  highlightMatches = true,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [fuse, setFuse] = useState(null);

  // Inicjalizacja silnika wyszukiwania Fuse
  useEffect(() => {
    if (data && data.length > 0) {
      const options = {
        includeScore: true,
        shouldSort: true,
        threshold,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys
      };
      setFuse(new Fuse(data, options));
    }
  }, [data, keys, threshold]);

  // Funkcja wykonująca wyszukiwanie
  const handleSearch = useCallback((searchQuery) => {
    if (!fuse || !searchQuery || searchQuery.length < minCharacters) {
      setResults([]);
      return;
    }

    const searchResults = fuse.search(searchQuery);
    setResults(searchResults);

    if (onResultsChange) {
      onResultsChange(searchResults);
    }
  }, [fuse, minCharacters, onResultsChange]);

  // Obsługa zmiany zapytania
  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    handleSearch(newQuery);
  };

  // Czyszczenie pola wyszukiwania
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    if (onResultsChange) {
      onResultsChange([]);
    }
  };

  // Domyślny renderer wyników
  const defaultRenderResult = (result, index) => {
    const item = result.item;
    
    // Wyświetlanie prostego tekstu jeśli item jest stringiem
    if (typeof item === 'string') {
      return (
        <div key={index} className="search-result-item">
          {highlightMatches ? highlightText(item, query) : item}
        </div>
      );
    }
    
    // Wyświetlanie nazwy lub pierwszego klucza dla obiektów
    const displayKey = keys[0] || Object.keys(item)[0];
    const displayText = item[displayKey] || 'N/A';
    
    return (
      <div key={index} className="search-result-item">
        {highlightMatches ? highlightText(displayText, query) : displayText}
      </div>
    );
  };

  // Funkcja do podświetlania pasujących fragmentów tekstu
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    try {
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = String(text).split(regex);
      
      return parts.map((part, i) => 
        regex.test(part) ? <mark key={i}>{part}</mark> : part
      );
    } catch (e) {
      return text;
    }
  };

  return (
    <div className={`advanced-search-engine ${className}`}>
      <div className="search-input-container">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder={placeholder}
          className="search-input"
        />
        {query && (
          <button onClick={clearSearch} className="clear-search-button" aria-label="Wyczyść wyszukiwanie">
            <X size={18} />
          </button>
        )}
      </div>
      
      {query && query.length >= minCharacters && results.length > 0 && (
        <div className="search-results">
          {results.map((result, index) => (
            renderResult ? renderResult(result, index) : defaultRenderResult(result, index)
          ))}
        </div>
      )}
    </div>
  );
}
