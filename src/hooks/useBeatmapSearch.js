import { useState, useCallback, useRef } from 'react';
import { osuApi } from '../utils/api.config';
import useBeatmapStore from '../stores/beatmapStore';

export default function useBeatmapSearch() {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const { beatmaps, collections, tags, filters } = useBeatmapStore();

    // Funkcja do parsowania warunków wyszukiwania
    const parseSearchQuery = useCallback((query) => {
        const conditions = {
            text: [],
            tags: [],
            mappers: [],
            collections: [],
            filters: [],
            ranked: null,
            loved: null,
            minStars: null,
            maxStars: null
        };

        const words = query.split(' ');
        
        words.forEach(word => {
            if (word.startsWith('#')) {
                conditions.tags.push(word.slice(1).toLowerCase());
            } else if (word.startsWith('@')) {
                conditions.mappers.push(word.slice(1).toLowerCase());
            } else if (word.startsWith('collection:')) {
                conditions.collections.push(word.slice(11).toLowerCase());
            } else if (word.startsWith('filter:')) {
                conditions.filters.push(word.slice(7).toLowerCase());
            } else if (word === 'ranked:yes') {
                conditions.ranked = true;
            } else if (word === 'ranked:no') {
                conditions.ranked = false;
            } else if (word === 'loved:yes') {
                conditions.loved = true;
            } else if (word === 'loved:no') {
                conditions.loved = false;
            } else if (word.startsWith('stars>')) {
                conditions.minStars = parseFloat(word.slice(6));
            } else if (word.startsWith('stars<')) {
                conditions.maxStars = parseFloat(word.slice(6));
            } else {
                conditions.text.push(word.toLowerCase());
            }
        });

        return conditions;
    }, []);

    // Funkcja do filtrowania lokalnych beatmap
    const filterLocalBeatmaps = useCallback((conditions) => {
        let filteredMaps = Array.from(beatmaps.values());

        // Filtrowanie po tekście
        if (conditions.text.length > 0) {
            const searchText = conditions.text.join(' ').toLowerCase();
            filteredMaps = filteredMaps.filter(map => 
                map.title.toLowerCase().includes(searchText) ||
                map.artist.toLowerCase().includes(searchText) ||
                map.creator.toLowerCase().includes(searchText)
            );
        }

        // Filtrowanie po tagach
        if (conditions.tags.length > 0) {
            filteredMaps = filteredMaps.filter(map => {
                const mapTags = new Set();
                collections.forEach(collection => {
                    if (collection.beatmaps.has(map.id)) {
                        const beatmapData = collection.beatmaps.get(map.id);
                        beatmapData.tags.forEach(tag => mapTags.add(tag));
                    }
                });
                return conditions.tags.every(tag => mapTags.has(tag));
            });
        }

        // Filtrowanie po mapperach
        if (conditions.mappers.length > 0) {
            filteredMaps = filteredMaps.filter(map =>
                conditions.mappers.some(mapper =>
                    map.creator.toLowerCase().includes(mapper)
                )
            );
        }

        // Filtrowanie po kolekcjach
        if (conditions.collections.length > 0) {
            filteredMaps = filteredMaps.filter(map =>
                conditions.collections.some(collectionName =>
                    Array.from(collections.values()).some(collection =>
                        collection.name.toLowerCase().includes(collectionName) &&
                        collection.beatmaps.has(map.id)
                    )
                )
            );
        }

        // Filtrowanie po statusie ranked
        if (conditions.ranked !== null) {
            filteredMaps = filteredMaps.filter(map =>
                conditions.ranked ? map.status === 'ranked' : map.status !== 'ranked'
            );
        }

        // Filtrowanie po statusie loved
        if (conditions.loved !== null) {
            filteredMaps = filteredMaps.filter(map =>
                conditions.loved ? map.status === 'loved' : map.status !== 'loved'
            );
        }

        // Filtrowanie po gwiazdkach
        if (conditions.minStars !== null) {
            filteredMaps = filteredMaps.filter(map =>
                Math.max(...map.beatmaps.map(b => b.difficulty_rating)) >= conditions.minStars
            );
        }
        if (conditions.maxStars !== null) {
            filteredMaps = filteredMaps.filter(map =>
                Math.min(...map.beatmaps.map(b => b.difficulty_rating)) <= conditions.maxStars
            );
        }

        return filteredMaps;
    }, [beatmaps, collections]);

    // Funkcja do wyszukiwania w API osu!
    const searchOsuApi = useCallback(async (query) => {
        try {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            const response = await osuApi.get('/beatmapsets/search', {
                params: { q: query },
                signal: abortControllerRef.current.signal
            });

            return response.data.beatmapsets;
        } catch (error) {
            if (error.name === 'AbortError') {
                return [];
            }
            throw error;
        }
    }, []);

    // Główna funkcja wyszukiwania
    const search = useCallback(async (query) => {
        if (!query.trim()) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const conditions = parseSearchQuery(query);
            
            // Najpierw szukamy lokalnie
            const localResults = filterLocalBeatmaps(conditions);
            
            // Jeśli mamy tekst do wyszukania, szukamy też w API
            let apiResults = [];
            if (conditions.text.length > 0) {
                apiResults = await searchOsuApi(conditions.text.join(' '));
            }

            // Łączymy wyniki, usuwamy duplikaty
            const combinedResults = [...localResults];
            apiResults.forEach(apiMap => {
                if (!combinedResults.some(localMap => localMap.id === apiMap.id)) {
                    combinedResults.push(apiMap);
                }
            });

            setResults(combinedResults);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [parseSearchQuery, filterLocalBeatmaps, searchOsuApi, setResults, setIsLoading, setError]);

    // Funkcja do pobierania sugestii
    const getSuggestions = useCallback((query) => {
        const suggestions = {
            tags: [],
            collections: [],
            mappers: [],
            filters: []
        };

        const word = query.split(' ').pop() || '';

        if (word.startsWith('#')) {
            const tagQuery = word.slice(1).toLowerCase();
            suggestions.tags = Array.from(tags)
                .filter(tag => tag.toLowerCase().includes(tagQuery))
                .slice(0, 5);
        } else if (word.startsWith('@')) {
            const mapperQuery = word.slice(1).toLowerCase();
            const uniqueMappers = new Set(
                Array.from(beatmaps.values()).map(map => map.creator)
            );
            suggestions.mappers = Array.from(uniqueMappers)
                .filter(mapper => mapper.toLowerCase().includes(mapperQuery))
                .slice(0, 5);
        } else if (word.startsWith('collection:')) {
            const collectionQuery = word.slice(11).toLowerCase();
            suggestions.collections = Array.from(collections.values())
                .filter(collection => 
                    collection.name.toLowerCase().includes(collectionQuery)
                )
                .map(collection => collection.name)
                .slice(0, 5);
        } else if (word.startsWith('filter:')) {
            const filterQuery = word.slice(7).toLowerCase();
            suggestions.filters = Array.from(filters.values())
                .filter(filter => 
                    filter.name.toLowerCase().includes(filterQuery)
                )
                .map(filter => filter.name)
                .slice(0, 5);
        }

        return suggestions;
    }, [beatmaps, collections, tags, filters]);

    return {
        results,
        isLoading,
        error,
        search,
        getSuggestions
    };
}
