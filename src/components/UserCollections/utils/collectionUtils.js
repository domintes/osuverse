'use client';

/**
 * Funkcje pomocnicze dla zarządzania kolekcjami
 */

// Funkcja pobierająca beatmapy przypisane do kolekcji lub podkolekcji
export const getBeatmapsForCollection = (collections, collectionId, subcollectionId = null) => {
    return Object.values(collections.beatmaps || {}).filter(beatmap =>
        beatmap.collectionId === collectionId &&
        (subcollectionId === null || beatmap.subcollectionId === subcollectionId)
    );
};

// Funkcja sprawdzająca, czy beatmapa jest w ulubionych
export const isBeatmapFavorited = (collections, beatmapId) => {
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
