import { useEffect, useRef } from 'react';
import './SearchSuggestions.scss';

export default function SearchSuggestions({ 
    suggestions, 
    query, 
    onSelect, 
    activeIndex,
    setActiveIndex,
    visible 
}) {
    const containerRef = useRef(null);

    // Grupowanie sugestii
    const allSuggestions = [
        ...suggestions.tags.map(tag => ({ type: 'tag', value: `#${tag}` })),
        ...suggestions.collections.map(collection => ({ type: 'collection', value: `collection:${collection}` })),
        ...suggestions.mappers.map(mapper => ({ type: 'mapper', value: `@${mapper}` })),
        ...suggestions.filters.map(filter => ({ type: 'filter', value: `filter:${filter}` }))
    ];

    // Przewijanie do aktywnej sugestii
    useEffect(() => {
        if (!containerRef.current || activeIndex === -1) return;

        const activeElement = containerRef.current.children[activeIndex];
        if (activeElement) {
            activeElement.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [activeIndex]);

    if (!visible || allSuggestions.length === 0) return null;

    // Funkcja pomocnicza do wyświetlania ikony
    const getIcon = (type) => {
        switch (type) {
            case 'tag':
                return '🏷️';
            case 'collection':
                return '📁';
            case 'mapper':
                return '👤';
            case 'filter':
                return '🔍';
            default:
                return '•';
        }
    };

    // Funkcja pomocnicza do podświetlania dopasowanego tekstu
    const highlightMatch = (text, searchQuery) => {
        if (!searchQuery) return text;

        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === searchQuery.toLowerCase() ? 
                <span key={i} className="highlight">{part}</span> : 
                part
        );
    };

    return (
        <div className="search-suggestions void-container" ref={containerRef}>
            {allSuggestions.map((suggestion, index) => (
                <div
                    key={`${suggestion.type}-${suggestion.value}`}
                    className={`suggestion-item ${index === activeIndex ? 'active' : ''}`}
                    onClick={() => onSelect(suggestion)}
                    onMouseEnter={() => setActiveIndex(index)}
                >
                    <span className="suggestion-icon">
                        {getIcon(suggestion.type)}
                    </span>
                    <span className="suggestion-content">
                        <span className="suggestion-type">{suggestion.type}</span>
                        <span className="suggestion-value">
                            {highlightMatch(suggestion.value, query)}
                        </span>
                    </span>
                    <span className="suggestion-shortcut">
                        {index < 9 ? `⌘${index + 1}` : ''}
                    </span>
                </div>
            ))}
        </div>
    );
}
