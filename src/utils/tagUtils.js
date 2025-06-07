/**
 * Zestaw funkcji pomocniczych do obsługi tagów beatmap
 */

/**
 * Ekstraktuje tekst tagu z obiektu tagu lub stringa
 * @param {Object|string} tag - Tag do przetworzenia
 * @returns {string|null} - Tekst tagu lub null jeśli nieprawidłowy
 */
export const extractTagText = (tag) => {
  if (typeof tag === 'string') {
    return tag;
  } else if (tag && typeof tag === 'object' && tag.tag) {
    // Dodatkowe sprawdzenie typu dla tag.tag
    return typeof tag.tag === 'string' ? tag.tag : String(tag.tag);
  }
  return null;
};

/**
 * Ekstraktuje listę tekstów tagów z tablicy obiektów lub stringów
 * @param {Array} tags - Tablica tagów do przetworzenia
 * @returns {Array} - Tablica tekstów tagów
 */
export const extractTagsText = (tags = []) => {
  if (!Array.isArray(tags)) return [];
  
  const result = [];
  tags.forEach(tag => {
    const tagText = extractTagText(tag);
    if (tagText) {
      result.push(String(tagText));
    }
  });
  
  return result;
};

/**
 * Formatuje tag w zależności od jego typu
 * @param {string} tag - Tekst tagu
 * @param {string} type - Typ tagu ('Artists', 'Mappers', 'Stars', 'User Tags')
 * @param {number} count - Liczba wystąpień tagu
 * @returns {string} - Sformatowany tekst tagu
 */
export const formatTag = (tag, type, count) => {
  if (type === 'User Tags') {
    return `#${tag} (${count})`;
  }
  return `${tag} (${count})`;
};

/**
 * Określa zakres gwiazdek dla danej wartości
 * @param {number} stars - Wartość gwiazdek
 * @returns {string} - Zakres gwiazdek jako string
 */
export const getStarRange = (stars) => {
  if (stars < 5.71) {
    return '4.99-5.70*';
  } else if (stars < 6.60) {
    return '5.71-6.59*';
  } else {
    return '6.60-7.69*';
  }
};

/**
 * Sprawdza czy beatmapa pasuje do wybranych tagów
 * @param {Object} map - Dane beatmapy
 * @param {Array} selectedTags - Wybrane tagi
 * @returns {boolean} - Czy beatmapa pasuje do wybranych tagów
 */
export const doesBeatmapMatchTags = (map, selectedTags) => {
  if (!selectedTags || selectedTags.length === 0) return true;
  
  return selectedTags.every(tag => {
    // Bezpieczne sprawdzanie tagu
    if (!tag) return false;
    
    // Konwersja tagu do stringa i do lowercase
    const tagLower = String(tag).toLowerCase();
    
    // Bezpieczne przetwarzanie tagów użytkownika
    const userTags = [];
    if (Array.isArray(map.userTags)) {
      map.userTags.forEach(t => {
        const tagText = extractTagText(t);
        if (tagText) {
          userTags.push(String(tagText).toLowerCase());
        }
      });
    }
    
    // Obsługa różnych możliwych nazw pól dla artysty i twórcy
    const artist = (map.artist || map.artist_name || '').toLowerCase();
    const creator = (map.creator || map.creator_name || map.mapper || '').toLowerCase();
    
    // Sprawdź czy tag pasuje do artysty, creatora lub tagu użytkownika
    if (artist === tagLower || creator === tagLower || userTags.includes(tagLower)) {
      return true;
    }
    
    // Sprawdź czy tag to zakres gwiazdek
    if (tagLower.includes('*')) {
      const starRating = map.starRating || map.difficulty_rating || 0;
      if (tagLower === '4.99-5.70*' && starRating < 5.71) return true;
      if (tagLower === '5.71-6.59*' && starRating >= 5.71 && starRating < 6.6) return true;
      if (tagLower === '6.60-7.69*' && starRating >= 6.6) return true;
    }
    
    return false;
  });
};

/**
 * Grupuje tagi według kategorii
 * @param {Array} beatmaps - Lista beatmap
 * @returns {Object} - Pogrupowane tagi
 */
export const groupTagsByCategory = (beatmaps) => {
  const groups = {
    Artists: {},
    Mappers: {},
    Stars: {},
    'User Tags': {}
  };

  if (!beatmaps || !Array.isArray(beatmaps)) return groups;

  beatmaps.forEach(map => {
    // Artist
    const artist = map.artist || map.artist_name || 'Unknown';
    groups.Artists[artist] = (groups.Artists[artist] || 0) + 1;

    // Mapper
    const mapper = map.creator || map.creator_name || map.mapper || 'Unknown';
    groups.Mappers[mapper] = (groups.Mappers[mapper] || 0) + 1;

    // Star Range
    const stars = map.starRating || map.difficulty_rating || 0;
    const range = getStarRange(stars);
    groups.Stars[range] = (groups.Stars[range] || 0) + 1;

  // User Tags
    const userTags = map.userTags || [];
    if (Array.isArray(userTags)) {
      userTags.forEach(tag => {
        const tagName = extractTagText(tag);
        if (tagName) {
          const tagKey = String(tagName);
          groups['User Tags'][tagKey] = (groups['User Tags'][tagKey] || 0) + 1;
        }
      });
    }
  });

  return groups;
};
