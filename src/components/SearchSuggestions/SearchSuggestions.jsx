import React from 'react';
import './SearchSuggestions.css';

const SuggestionCategory = ({ title, suggestions, query, onSelect, activeIndex, baseIndex }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="suggestion-category">
      <div className="suggestion-category__title">{title}</div>
      <div className="suggestion-category__items">
        {suggestions.map((suggestion, index) => {
          const absoluteIndex = baseIndex + index;
          const isActive = absoluteIndex === activeIndex;
          
          return (
            <div
              key={suggestion.value}
              className={`suggestion-item ${isActive ? 'suggestion-item--active' : ''}`}
              onClick={() => onSelect(suggestion)}
              onMouseEnter={() => {}} // Możesz dodać aktualizację aktywnego indeksu po najechaniu
            >
              <span className="suggestion-item__value">{suggestion.value}</span>
              {suggestion.description && (
                <span className="suggestion-item__description">{suggestion.description}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SearchSuggestions = ({ suggestions, query, onSelect, activeIndex, setActiveIndex, visible }) => {
  if (!visible) return null;
  
  const { tags, collections, mappers, filters } = suggestions;
  const hasAnySuggestions = 
    (tags && tags.length > 0) || 
    (collections && collections.length > 0) || 
    (mappers && mappers.length > 0) || 
    (filters && filters.length > 0);
  
  if (!hasAnySuggestions) return null;
  
  // Obliczanie indeksu bazowego dla każdej kategorii
  let baseIndices = { tags: 0 };
  baseIndices.collections = baseIndices.tags + (tags ? tags.length : 0);
  baseIndices.mappers = baseIndices.collections + (collections ? collections.length : 0);
  baseIndices.filters = baseIndices.mappers + (mappers ? mappers.length : 0);

  return (
    <div className="search-suggestions">
      <SuggestionCategory 
        title="Tagi" 
        suggestions={tags} 
        query={query} 
        onSelect={onSelect} 
        activeIndex={activeIndex} 
        baseIndex={baseIndices.tags} 
      />
      
      <SuggestionCategory 
        title="Kolekcje" 
        suggestions={collections} 
        query={query} 
        onSelect={onSelect} 
        activeIndex={activeIndex} 
        baseIndex={baseIndices.collections} 
      />
      
      <SuggestionCategory 
        title="Mapperzy" 
        suggestions={mappers} 
        query={query} 
        onSelect={onSelect} 
        activeIndex={activeIndex} 
        baseIndex={baseIndices.mappers} 
      />
      
      <SuggestionCategory 
        title="Filtry" 
        suggestions={filters} 
        query={query} 
        onSelect={onSelect} 
        activeIndex={activeIndex} 
        baseIndex={baseIndices.filters} 
      />
    </div>
  );
};

export default SearchSuggestions;
