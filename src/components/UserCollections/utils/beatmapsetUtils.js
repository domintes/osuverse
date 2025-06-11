/**
 * Grupuje beatmapy według beatmapsetów
 * 
 * @param {Object} beatmapsObject - Obiekt z beatmapami
 * @param {string|null} collectionId - Opcjonalny id kolekcji do filtrowania beatmap
 * @param {string|null} subcollectionId - Opcjonalny id podkolekcji do filtrowania beatmap
 * @returns {Object} - Obiekt z beatmapsetami i zgrupowanymi beatmapami
 */
export const groupBeatmapsBySet = (beatmapsObject, collectionId = null, subcollectionId = null) => {
    const beatmapsets = {};
    
    // Filtruj beatmapy według kolekcji i podkolekcji, jeśli podano
    const beatmaps = Object.values(beatmapsObject || {}).filter(beatmap => {
        if (collectionId && beatmap.collectionId !== collectionId) {
            return false;
        }
        if (subcollectionId && beatmap.subcollectionId !== subcollectionId) {
            return false;
        }
        return true;
    });
    
    // Grupuj beatmapy według setId
    beatmaps.forEach(beatmap => {
        const setId = beatmap.setId || beatmap.beatmapset_id;
        if (!setId) return;
        
        if (!beatmapsets[setId]) {
            beatmapsets[setId] = {
                id: setId,
                artist: beatmap.artist || 'Unknown',
                title: beatmap.title || 'Unknown',
                cover: beatmap.cover || null,
                creator: beatmap.creator || 'Unknown',
                difficulties: []
            };
        }
        
        // Dodaj beatmapę do listy trudności beatmapsetu
        beatmapsets[setId].difficulties.push(beatmap);
    });
    
    // Sortuj trudności według difficulty_rating w każdym beatmapsecie
    Object.values(beatmapsets).forEach(beatmapset => {
        beatmapset.difficulties.sort((a, b) => {
            return (a.difficulty_rating || 0) - (b.difficulty_rating || 0);
        });
    });
    
    return beatmapsets;
};

/**
 * Sortuje beatmapsety według różnych kryteriów
 * 
 * @param {Object} beatmapsets - Obiekt z beatmapsetami
 * @param {string} sortMode - Tryb sortowania ('artist', 'title', 'creator', 'difficulty')
 * @param {string} sortDirection - Kierunek sortowania ('asc', 'desc')
 * @returns {Array} - Posortowana tablica beatmapsetów
 */
export const sortBeatmapsets = (beatmapsets, sortMode = 'artist', sortDirection = 'asc') => {
    const sortedSets = Object.values(beatmapsets);
    
    sortedSets.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortMode) {
            case 'artist':
                valueA = a.artist?.toLowerCase() || '';
                valueB = b.artist?.toLowerCase() || '';
                break;
            case 'title':
                valueA = a.title?.toLowerCase() || '';
                valueB = b.title?.toLowerCase() || '';
                break;
            case 'creator':
                valueA = a.creator?.toLowerCase() || '';
                valueB = b.creator?.toLowerCase() || '';
                break;
            case 'difficulty':
                // Dla sortowania po trudności, bierzemy średnią trudność wszystkich map
                const avgDiffA = a.difficulties.reduce((sum, d) => sum + (d.difficulty_rating || 0), 0) / a.difficulties.length;
                const avgDiffB = b.difficulties.reduce((sum, d) => sum + (d.difficulty_rating || 0), 0) / b.difficulties.length;
                valueA = avgDiffA;
                valueB = avgDiffB;
                break;
            default:
                valueA = a.artist?.toLowerCase() || '';
                valueB = b.artist?.toLowerCase() || '';
        }
        
        // Sortowanie w odpowiednim kierunku
        if (sortDirection === 'asc') {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });
    
    return sortedSets;
};

/**
 * Filtruje beatmapsety według tagów
 * 
 * @param {Array} beatmapsets - Tablica beatmapsetów do filtrowania
 * @param {Array} tags - Tablica tagów do filtrowania
 * @returns {Array} - Przefiltrowana tablica beatmapsetów
 */
export const filterBeatmapsetsByTags = (beatmapsets, tags) => {
    if (!tags || tags.length === 0) {
        return beatmapsets;
    }
    
    return beatmapsets.filter(set => {
        // Sprawdź, czy którakolwiek beatmapa w secie ma wszystkie wymagane tagi
        return set.difficulties.some(beatmap => {
            return tags.every(tag => {
                const tagLower = tag.toLowerCase();
                
                // Sprawdź, czy tag znajduje się w userTags
                const userTags = [];
                if (Array.isArray(beatmap.userTags)) {
                    beatmap.userTags.forEach(t => {
                        if (typeof t === 'string') {
                            userTags.push(t.toLowerCase());
                        } else if (t && typeof t === 'object' && t.tag) {
                            userTags.push(t.tag.toLowerCase());
                        }
                    });
                }
                
                // Sprawdź czy tag pasuje do artysty, mappera lub userTags
                return (
                    set.artist?.toLowerCase() === tagLower ||
                    set.creator?.toLowerCase() === tagLower ||
                    userTags.includes(tagLower)
                );
            });
        });
    });
};
