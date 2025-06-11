/**
 * Zestaw funkcji pomocniczych do obsługi beatmap
 */

/**
 * Pobiera wszystkie beatmapy z kolekcji i wzbogaca je o metadane
 * @param {Object} collections - Dane kolekcji
 * @returns {Array} - Lista beatmap z metadanymi
 */
export const getAllBeatmapsFromCollections = (collections) => {
  const beatmaps = [];
  const beatmapsData = collections.beatmaps || {};
  const beatmapsetsData = collections.beatmapsets || {};
  
  // Pobierz wszystkie beatmapy z obiektu beatmaps
  Object.values(beatmapsData).forEach(beatmap => {
    // Znajdź odpowiedni beatmapset używając setId
    const beatmapset = beatmapsetsData[beatmap.setId] || {};
    
    beatmaps.push({
      id: beatmap.id,
      // Dane podstawowe
      artist: beatmap.artist || beatmapset.artist || 'Unknown',
      creator: beatmap.creator || beatmapset.creator || 'Unknown',
      title: beatmap.title || beatmapset.title || 'Unknown',
      version: beatmap.version || 'Unknown',
      // Pola do kompatybilności
      artist_name: beatmap.artist || beatmapset.artist || 'Unknown',
      creator_name: beatmap.creator || beatmapset.creator || 'Unknown',
      // Informacje o trudności
      starRating: beatmap.difficulty_rating || 0,
      difficulty_rating: beatmap.difficulty_rating || 0,
      // Metadane kolekcji
      collectionId: beatmap.collectionId,
      subcollectionId: beatmap.subcollectionId,
      // Identyfikatory beatmapsetów
      setId: beatmap.setId || beatmap.beatmapset_id,
      beatmapset_id: beatmap.setId || beatmap.beatmapset_id,
      // Tagi
      userTags: beatmap.userTags || beatmap.tags || [],
      // Dodatkowe pola, które mogą być potrzebne
      cover: beatmap.cover || beatmapset.cover,
      previewUrl: beatmap.preview_url || beatmapset.preview_url
    });
  });
  
  return beatmaps;
};

/**
 * Filtruje beatmapy według tagów
 * @param {Array} beatmaps - Lista beatmap
 * @param {Array} selectedTags - Wybrane tagi
 * @param {Function} matchFunction - Funkcja sprawdzająca dopasowanie beatmapy do tagów
 * @returns {Array} - Przefiltrowane beatmapy
 */
export const filterBeatmapsByTags = (beatmaps, selectedTags, matchFunction) => {
  if (!selectedTags || selectedTags.length === 0) return beatmaps;
  if (!Array.isArray(beatmaps)) return [];
  
  return beatmaps.filter(map => matchFunction(map, selectedTags));
};

/**
 * Grupuje beatmapy według beatmapsetów
 * @param {Array} beatmaps - Lista beatmap
 * @returns {Object} - Pogrupowane beatmapy
 */
export const groupBeatmapsBySet = (beatmaps) => {
  const sets = {};
  
  if (!Array.isArray(beatmaps)) return sets;
  
  beatmaps.forEach(beatmap => {
    const setId = beatmap.setId || beatmap.beatmapset_id;
    if (!setId) return;
    
    if (!sets[setId]) {
      sets[setId] = {
        id: setId,
        artist: beatmap.artist || 'Unknown',
        title: beatmap.title || 'Unknown',
        creator: beatmap.creator || 'Unknown',
        cover: beatmap.cover,
        difficulties: []
      };
    }
    
    sets[setId].difficulties.push(beatmap);
  });
  
  // Sortuj trudności w każdym secie
  Object.values(sets).forEach(set => {
    set.difficulties.sort((a, b) => {
      return (a.difficulty_rating || 0) - (b.difficulty_rating || 0);
    });
  });
  
  return sets;
};

/**
 * Sortuje beatmapy według różnych kryteriów
 * @param {Array} beatmaps - Lista beatmap do posortowania
 * @param {string} sortBy - Pole, po którym sortować (np. 'artist', 'title', 'difficulty_rating')
 * @param {string} order - Kolejność sortowania ('asc' lub 'desc')
 * @returns {Array} - Posortowana lista beatmap
 */
export const sortBeatmaps = (beatmaps, sortBy = 'artist', order = 'asc') => {
  if (!Array.isArray(beatmaps)) return [];
  
  return [...beatmaps].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'artist':
        valueA = (a.artist || a.artist_name || '').toLowerCase();
        valueB = (b.artist || b.artist_name || '').toLowerCase();
        break;
      case 'title':
        valueA = (a.title || '').toLowerCase();
        valueB = (b.title || '').toLowerCase();
        break;
      case 'creator':
      case 'mapper':
        valueA = (a.creator || a.creator_name || a.mapper || '').toLowerCase();
        valueB = (b.creator || b.creator_name || b.mapper || '').toLowerCase();
        break;
      case 'difficulty':
      case 'difficulty_rating':
      case 'starRating':
        valueA = a.difficulty_rating || a.starRating || 0;
        valueB = b.difficulty_rating || b.starRating || 0;
        break;
      default:
        valueA = (a[sortBy] || '').toString().toLowerCase();
        valueB = (b[sortBy] || '').toString().toLowerCase();
    }
    
    // Sortuj według kolejności
    if (order === 'desc') {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
    
    return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
  });
};
