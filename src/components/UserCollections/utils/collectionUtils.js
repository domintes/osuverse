'use client';

/**
 * Funkcje pomocnicze dla zarządzania kolekcjami
 */

// Funkcja pobierająca beatmapy przypisane do kolekcji lub podkolekcji
export const getBeatmapsForCollection = (collections, collectionId, subcollectionId = null) => {
    if (!collections || !collectionId) {
        return [];
    }
    
    // Pobierz beatmapy na podstawie ID kolekcji/podkolekcji
    // Upewnij się, że każda beatmapa jest pokazywana dokładnie w jednej kolekcji
    const beatmaps = Object.values(collections.beatmaps || {}).filter(beatmap => 
        beatmap.collectionId === collectionId &&
        (subcollectionId === null || beatmap.subcollectionId === subcollectionId)
    );
    
    // Wzbogać beatmapy o dodatkowe metadane z beatmapsets
    return beatmaps.map(beatmap => {
        const beatmapset = collections.beatmapsets?.[beatmap.setId] || {};
        
        // Zachowaj oryginalne userTags i nie modyfikuj ich formatu
        // Jeśli beatmap.userTags istnieje, użyj ich, w przeciwnym razie sprawdź beatmap.tags
        const userTags = beatmap.userTags || beatmap.tags || [];
        
        return {
            ...beatmap,
            artist: beatmap.artist || beatmapset.artist || 'Unknown',
            creator: beatmap.creator || beatmapset.creator || 'Unknown',
            // Zachowaj oryginalne nazwy pól dla kompatybilności wstecznej
            artist_name: beatmap.artist || beatmapset.artist || 'Unknown',
            creator_name: beatmap.creator || beatmapset.creator || 'Unknown',
            // Zachowaj oryginalne tagi w niezmienionej formie
            userTags: userTags
        };
    });
};

/**
 * Funkcja wyszukująca kolekcję systemową po nazwie lub zwracająca domyślną
 * @param {Object} collections - Obiekt z kolekcjami
 * @param {string} systemCollectionName - Nazwa kolekcji systemowej do wyszukania (np. 'Unsorted', 'Favorites')
 * @returns {Object|null} - Znaleziona kolekcja lub null
 */
export const findSystemCollection = (collections, systemCollectionName) => {
    if (!collections || !collections.collections || !systemCollectionName) {
        return null;
    }
    
    // Szukaj kolekcji po nazwie
    const collection = collections.collections.find(c => c.name === systemCollectionName);
    
    return collection || null;
};

// Funkcja sprawdzająca, czy beatmapa jest w ulubionych
export const isBeatmapFavorited = (collections, beatmapId) => {
    if (!collections || !collections.collections || !collections.beatmaps) return false;
    
    const favoritesCollection = collections.collections.find(c => c.name === 'Favorites');
    if (!favoritesCollection) return false;
    
    return Object.values(collections.beatmaps).some(b =>
        b.id === beatmapId && b.collectionId === favoritesCollection.id
    );
};

// Funkcja do walidacji nazwy kolekcji
export const validateCollectionName = (collections, name, isNew = true) => {
    if (!name.trim()) {
        return { isValid: false, message: 'Collection name cannot be empty' };
    }

    const exists = collections.collections.some(c =>
        c.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (exists && isNew) {
        return { isValid: false, message: 'Collection with this name already exists' };
    }

    return { isValid: true, message: '' };
};

// Funkcja do walidacji nazwy podkolekcji
export const validateSubcollectionName = (collections, name, collectionId, isNew = true) => {
    if (!name.trim()) {
        return { isValid: false, message: 'Subcollection name cannot be empty' };
    }
    const collection = collections.collections.find(c => c.id === collectionId);
    if (!collection) return { isValid: true, message: '' };
    
    const exists = collection.subcollections.some(s =>
        s.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    
    if (exists && isNew) {
        return { isValid: false, message: 'Subcollection with this name already exists in this collection' };
    }
    
    return { isValid: true, message: '' };
};

/**
 * Sprawdza czy kolekcja jest pusta (nie ma przypisanych beatmap)
 * @param {Object} collections - Obiekt z kolekcjami
 * @param {string} collectionId - ID kolekcji do sprawdzenia
 * @returns {boolean} - true jeśli kolekcja jest pusta, false w przeciwnym razie
 */
export const isCollectionEmpty = (collections, collectionId) => {
    if (!collections || !collections.beatmaps || !collectionId) {
        return true;
    }
    
    return !Object.values(collections.beatmaps).some(beatmap => 
        beatmap.collectionId === collectionId
    );
};
