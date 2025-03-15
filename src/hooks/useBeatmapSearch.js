import { useState, useCallback, useRef } from 'react';
import { osuApi } from '../utils/api.config';
import useBeatmapStore from '../stores/beatmapStore';

// Funkcja do zwracania mockowych wyników dla trybu testowego
const getMockSearchResults = (query) => {
    const mockResults = [
        {
            id: 1,
            title: "The Big Black",
            artist: "The Quick Brown Fox",
            creator: "Blue Dragon",
            status: "ranked",
            beatmaps: [
                { difficulty_rating: 6.69 },
                { difficulty_rating: 3.8 }
            ],
            covers: {
                cover: "https://assets.ppy.sh/beatmaps/131891/covers/cover.jpg",
                card: "https://assets.ppy.sh/beatmaps/131891/covers/card.jpg",
                list: "https://assets.ppy.sh/beatmaps/131891/covers/list.jpg"
            },
            tags: ["speedcore", "hard", "jump", "circles"]
        },
        {
            id: 2,
            title: "Senbonzakura",
            artist: "Kurousa P",
            creator: "pkk",
            status: "ranked",
            beatmaps: [
                { difficulty_rating: 5.77 },
                { difficulty_rating: 4.5 }
            ],
            covers: {
                cover: "https://assets.ppy.sh/beatmaps/95382/covers/cover.jpg",
                card: "https://assets.ppy.sh/beatmaps/95382/covers/card.jpg",
                list: "https://assets.ppy.sh/beatmaps/95382/covers/list.jpg"
            },
            tags: ["japanese", "vocaloid", "stream"]
        },
        {
            id: 3, 
            title: "Avalanche",
            artist: "Memme",
            creator: "Niva",
            status: "ranked",
            beatmaps: [
                { difficulty_rating: 6.12 },
                { difficulty_rating: 5.3 }
            ],
            covers: {
                cover: "https://assets.ppy.sh/beatmaps/900867/covers/cover.jpg",
                card: "https://assets.ppy.sh/beatmaps/900867/covers/card.jpg",
                list: "https://assets.ppy.sh/beatmaps/900867/covers/list.jpg"
            },
            tags: ["breakcore", "electronic", "technical"]
        },
        {
            id: 4,
            title: "FREEDOM DiVE",
            artist: "Xi",
            creator: "Nakagawa-Kanon",
            status: "ranked",
            beatmaps: [
                { difficulty_rating: 8.18 },
                { difficulty_rating: 7.1 }
            ],
            covers: {
                cover: "https://assets.ppy.sh/beatmaps/39804/covers/cover.jpg",
                card: "https://assets.ppy.sh/beatmaps/39804/covers/card.jpg",
                list: "https://assets.ppy.sh/beatmaps/39804/covers/list.jpg"
            },
            tags: ["stream", "technical", "high-bpm"]
        },
        {
            id: 5,
            title: "DJ Noriken - #ERASEERASE",
            artist: "DJ Noriken",
            creator: "lcfc",
            status: "loved",
            beatmaps: [
                { difficulty_rating: 5.62 },
                { difficulty_rating: 4.9 }
            ],
            covers: {
                cover: "https://assets.ppy.sh/beatmaps/1290041/covers/cover.jpg",
                card: "https://assets.ppy.sh/beatmaps/1290041/covers/card.jpg",
                list: "https://assets.ppy.sh/beatmaps/1290041/covers/list.jpg"
            },
            tags: ["frenchcore", "electronic", "hardcore"]
        }
    ];

    // Jeśli nie ma zapytania, zwróć wszystkie wyniki
    if (!query) return mockResults;

    // Szukaj w tytule, artyście, twórcy lub tagach
    return mockResults.filter(result => {
        const lowercaseQuery = query.toLowerCase();
        
        return (
            result.title.toLowerCase().includes(lowercaseQuery) ||
            result.artist.toLowerCase().includes(lowercaseQuery) ||
            result.creator.toLowerCase().includes(lowercaseQuery) ||
            result.tags.some(tag => tag.includes(lowercaseQuery))
        );
    });
};

export default function useBeatmapSearch() {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const { beatmaps, collections, tags } = useBeatmapStore();
    
    // Sprawdź czy używamy trybu testowego
    const isTestMode = useCallback(() => {
        return localStorage.getItem('test_mode') === 'true';
    }, []);

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

    const filterLocalBeatmaps = useCallback((conditions) => {
        let filteredMaps = Array.from(beatmaps.values());

        // Filtrowanie po texcie
        if (conditions.text.length > 0) {
            filteredMaps = filteredMaps.filter(map => {
                const titleLower = map.title ? map.title.toLowerCase() : '';
                const artistLower = map.artist ? map.artist.toLowerCase() : '';
                const creatorLower = map.creator ? map.creator.toLowerCase() : '';
                
                return conditions.text.every(text => 
                    titleLower.includes(text) || 
                    artistLower.includes(text) || 
                    creatorLower.includes(text)
                );
            });
        }

        // Filtrowanie po tagach
        if (conditions.tags.length > 0) {
            filteredMaps = filteredMaps.filter(map => {
                const mapTags = map.tags ? map.tags.map(tag => tag.toLowerCase()) : [];
                return conditions.tags.every(tag => mapTags.includes(tag));
            });
        }

        // Filtrowanie po mapperach
        if (conditions.mappers.length > 0) {
            filteredMaps = filteredMaps.filter(map => {
                const creatorLower = map.creator ? map.creator.toLowerCase() : '';
                return conditions.mappers.some(mapper => creatorLower.includes(mapper));
            });
        }

        // Filtrowanie po kolekcjach
        if (conditions.collections.length > 0) {
            const matchingCollections = [];
            collections.forEach((collection, name) => {
                if (conditions.collections.some(coll => name.toLowerCase().includes(coll))) {
                    matchingCollections.push(...collection);
                }
            });
            
            // Dodajemy mapy z pasujących kolekcji do naszego zestawu wyników
            // i utrzymujemy unikalność przez ID
            const uniqueIds = new Set(filteredMaps.map(map => map.id));
            matchingCollections.forEach(mapId => {
                if (!uniqueIds.has(mapId) && beatmaps.has(mapId)) {
                    filteredMaps.push(beatmaps.get(mapId));
                    uniqueIds.add(mapId);
                }
            });
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
            // Jeśli jesteśmy w trybie testowym, używamy mockowych danych
            if (isTestMode()) {
                console.log('⚠️ Używam mockowych danych dla wyszukiwania API');
                return getMockSearchResults(query);
            }
            
            console.log('🔍 Wyszukiwanie w API osu!:', query);
            
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            const response = await osuApi.get('/beatmapsets/search', {
                params: { q: query },
                signal: abortControllerRef.current.signal
            });
            
            console.log('✅ Otrzymano wyniki wyszukiwania:', response.data.beatmapsets?.length || 0);
            return response.data.beatmapsets || [];
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('🔄 Przerwano poprzednie wyszukiwanie');
                return [];
            }
            console.error('❌ Błąd wyszukiwania API:', error);
            
            // W przypadku błędu zwróć mockowe dane, aby aplikacja mogła dalej działać
            console.log('⚠️ Używam danych awaryjnych dla wyszukiwania');
            return getMockSearchResults(query);
        }
    }, [isTestMode]);

    // Główna funkcja wyszukiwania
    const search = useCallback(async (query, searchInCollectionOnly = false) => {
        if (!query) {
            setResults([]);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Parsuj zapytanie
            const conditions = parseSearchQuery(query);
            
            // Wyszukaj w lokalnych beatmapach jeśli szukamy tylko w kolekcji
            let results = [];
            if (searchInCollectionOnly) {
                results = filterLocalBeatmaps(conditions);
            } else {
                // Wyszukaj w API
                try {
                    results = await searchOsuApi(query);
                } catch (error) {
                    console.error('❌ Błąd podczas wyszukiwania w API:', error);
                    setError('Nie udało się pobrać wyników z osu!api v2');
                    results = [];
                }
            }
            
            // Dodaj informację o tym, czy beatmapa jest w kolekcji
            results = results.map(beatmap => ({
                ...beatmap,
                isInCollection: beatmaps.has(beatmap.id)
            }));
            
            setResults(results.slice(0, 8)); // Limitujemy do 8 wyników
        } catch (error) {
            console.error('❌ Błąd podczas wyszukiwania:', error);
            setError(error.message || 'Wystąpił błąd podczas wyszukiwania');
        } finally {
            setIsLoading(false);
        }
    }, [parseSearchQuery, filterLocalBeatmaps, searchOsuApi, beatmaps]);

    // Zwracanie sugestii wyszukiwania
    const getSuggestions = useCallback((query) => {
        if (!query) {
            return {
                tags: [],
                collections: [],
                mappers: [],
                filters: []
            };
        }

        const lastWord = query.split(' ').pop().toLowerCase();
        
        // Jeśli ostatnie słowo jest puste, nie pokazuj sugestii
        if (!lastWord) {
            return {
                tags: [],
                collections: [],
                mappers: [],
                filters: []
            };
        }

        // Zbierz sugestie dla tagów
        const tagSuggestions = tags && tags.size > 0 
            ? Array.from(tags)
                .filter(tag => tag.toLowerCase().includes(lastWord))
                .map(tag => ({
                    value: '#' + tag,
                    description: 'Tag'
                }))
                .slice(0, 5)
            : [];

        // Zbierz sugestie dla kolekcji
        const collectionSuggestions = collections && collections.size > 0 
            ? Array.from(collections.keys())
                .filter(name => name.toLowerCase().includes(lastWord))
                .map(name => ({
                    value: 'collection:' + name,
                    description: `Kolekcja (${collections.get(name).size} map)`
                }))
                .slice(0, 3)
            : [];

        // Zbierz sugestie dla mapperów
        const mapperSet = new Set();
        if (beatmaps && beatmaps.size > 0) {
            beatmaps.forEach(beatmap => {
                if (beatmap && beatmap.creator && beatmap.creator.toLowerCase().includes(lastWord)) {
                    mapperSet.add(beatmap.creator);
                }
            });
        }

        const mapperSuggestions = Array.from(mapperSet)
            .map(mapper => ({
                value: '@' + mapper,
                description: 'Mapper'
            }))
            .slice(0, 3);

        // Przygotuj sugestie filtrów
        const filterSuggestions = [
            { value: 'ranked:yes', description: 'Tylko ranked' },
            { value: 'ranked:no', description: 'Bez ranked' },
            { value: 'loved:yes', description: 'Tylko loved' },
            { value: 'stars>5', description: 'Trudność > 5 gwiazdek' },
            { value: 'stars<4', description: 'Trudność < 4 gwiazdki' }
        ].filter(filter => filter.value.includes(lastWord))
            .slice(0, 5);

        return {
            tags: tagSuggestions,
            collections: collectionSuggestions,
            mappers: mapperSuggestions,
            filters: filterSuggestions
        };
    }, [tags, collections, beatmaps]);

    return {
        search,
        getSuggestions,
        results,
        isLoading,
        error
    };
}
