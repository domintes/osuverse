'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { PlusCircle } from 'lucide-react';
import { collectionsAtom } from '@/store/collectionAtom';
import { selectedTagsAtom } from '@/store/selectedTagsAtom';
import './userCollectionsPanel.scss';
import './userCollections.scss';
import NeonBorderBox from './NeonBorderBox';
import AddBeatmapModal from './BeatmapSearchResults/AddBeatmapModal';
import CollectionItem from './UserCollections/CollectionItem';
import { useBeatmapSort } from './UserCollections/hooks/useBeatmapSort';
import { useBeatmapFilter } from './UserCollections/hooks/useBeatmapFilter';
import { useCollectionDragDrop } from './UserCollections/hooks/useCollectionDragDrop';
import { validateCollectionName, getBeatmapsForCollection } from './UserCollections/utils/collectionUtils';
import GlobalFilterSortControls from './UserCollections/GlobalFilterSortControls';

/**
 * Główny komponent panelu kolekcji użytkownika
 */
export default function UserCollectionsPanel({ editMode }) {
    const [collections, setCollections] = useAtom(collectionsAtom);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newSubcollectionNames, setNewSubcollectionNames] = useState({});
    const [editingCollectionId, setEditingCollectionId] = useState(null);
    const [editingSubcollectionId, setEditingSubcollectionId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [errors, setErrors] = useState({});
    const [validationStates, setValidationStates] = useState({
        collection: { isValid: true, message: '' },
        subcollections: {}
    });    // Sprawdź, czy jest zapisana ostatnio rozwinięta kolekcja w localStorage
    const savedExpandedCollection = typeof window !== 'undefined' ? localStorage.getItem('lastExpandedCollection') : null;
    
    // Stan dla rozwijanych kolekcji i podkolekcji
    // Używaj zapisanej kolekcji, a jeśli nie ma to pierwszy "Unsorted" jako rozwiniętą
    const getDefaultExpandedCollection = () => {
        // Próbuj najpierw załadować z localStorage
        if (savedExpandedCollection) {
            return savedExpandedCollection;
        }
        
        // Jeśli nie ma zapisanej, spróbuj rozwinąć "Unsorted" system collection
        if (collections && collections.collections) {
            const unsorted = collections.collections.find(c => c.name === 'Unsorted');
            if (unsorted) {
                return unsorted.id;
            }
        }
        
        // Jeśli nic innego, rozwiń pierwszą kolekcję
        return collections?.collections?.[0]?.id || null;
    };
    
    const [expandedCollection, setExpandedCollection] = useState(getDefaultExpandedCollection);
    const [expandedSubcollection, setExpandedSubcollection] = useState(null);
    const [editingBeatmap, setEditingBeatmap] = useState(null);
    const [highlightedBeatmapId, setHighlightedBeatmapId] = useState(null);
    
    // Referencja do beatmapy, która ma być przewinięta do widoku
    const beatmapRef = useRef({});
    
    // Dostęp do wybranych tagów z TagSections
    const [selectedTags] = useAtom(selectedTagsAtom);    // Importowanie hooków
    const { 
        sortMode, sortDirection, sortBeatmaps, 
        toggleSortMode, toggleSortDirection 
    } = useBeatmapSort();

    const {
        activeTags, showTagSelector, availableTags,
        filterBeatmapsByTags, toggleTagFilter, 
        setShowTagSelector, updateAvailableTags
    } = useBeatmapFilter();
    
    // Efekt do obsługi automatycznego przewijania do beatmapy z wyszukiwania
    useEffect(() => {
        const scrollToBeatmapId = localStorage.getItem('scrollToBeatmapId');
        if (!scrollToBeatmapId || !collections || !collections.beatmaps) return;
        
        // Znajdź beatmapę w kolekcjach
        const beatmapToFind = collections.beatmaps[scrollToBeatmapId];
        if (!beatmapToFind) return;
        
        // Ustaw podświetlenie dla znalezionej beatmapy
        setHighlightedBeatmapId(scrollToBeatmapId);
        
        // Rozwiń odpowiednią kolekcję
        if (beatmapToFind.collectionId) {
            setExpandedCollection(beatmapToFind.collectionId);
            
            // Jeśli beatmapa jest w podkolekcji, rozwiń ją również
            if (beatmapToFind.subcollectionId) {
                setExpandedSubcollection(beatmapToFind.subcollectionId);
            }
            
            // Używamy timeoutu, aby dać czas na wyrenderowanie komponentów
            setTimeout(() => {
                const beatmapElement = document.getElementById(`beatmap-${scrollToBeatmapId}`);
                if (beatmapElement) {
                    // Przewiń do znalezionej beatmapy z animacją
                    beatmapElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    
                    // Dodaj animację podświetlającą
                    beatmapElement.classList.add('highlighted-beatmap');
                    
                    // Usuń animację po 5 sekundach
                    setTimeout(() => {
                        beatmapElement.classList.remove('highlighted-beatmap');
                    }, 5000);
                }
            }, 500);
        }
        
        // Wyczyść localStorage po znalezieniu beatmapy
        localStorage.removeItem('scrollToBeatmapId');
    }, [collections]);

    const {
        draggedItem, draggedSubcollection, dragOverCollectionId, errors: dragErrors,
        handleDragStart, handleDragEnd, handleDragOver, handleDrop,
        handleSubcollectionDragStart, handleSubcollectionDragOver
    } = useCollectionDragDrop();    // Funkcja rozwijająca/zwijająca kolekcję
    const toggleExpandCollection = (collectionId) => {
        if (expandedCollection === collectionId) {
            setExpandedCollection(null);
            setExpandedSubcollection(null);
        } else {
            setExpandedCollection(collectionId);
            setExpandedSubcollection(null);
            
            // Pobierz dostępne tagi dla kolekcji
            const beatmaps = getBeatmapsForCollection(collections, collectionId);
            updateAvailableTags(beatmaps);
            
            // Aktualizuj właściwą kolekcję w localStorage, aby zachować stan po odświeżeniu
            localStorage.setItem('lastExpandedCollection', collectionId);
        }
    };

    // Funkcja rozwijająca/zwijająca podkolekcję
    const toggleExpandSubcollection = (subcollectionId) => {
        if (expandedSubcollection === subcollectionId) {
            setExpandedSubcollection(null);
        } else {
            setExpandedSubcollection(subcollectionId);
            
            // Pobierz dostępne tagi dla podkolekcji
            const beatmaps = getBeatmapsForCollection(collections, expandedCollection, subcollectionId);
            updateAvailableTags(beatmaps);
        }
    };

    // Funkcja obsługująca edycję beatmapy (tagów)
    const handleEditBeatmap = (beatmap) => {
        setEditingBeatmap(beatmap);
    };

    // Funkcja zapisująca zmiany w beatmapie
    const handleBeatmapEditSubmit = (formData) => {
        if (!editingBeatmap) return;

        const beatmapId = editingBeatmap.id;
        const userTags = formData.tags || [];

        // Calculate beatmap_priority based on tag values sum
        const beatmap_priority = userTags.reduce((sum, t) => sum + (parseInt(t.tag_value) || 0), 0);

        setCollections(prev => {
            const newBeatmaps = { ...prev.beatmaps };
            const newTags = { ...prev.tags };

            // Remove beatmap from previous tags
            const oldTags = (prev.beatmaps[beatmapId]?.userTags || []).map(t => t.tag);
            oldTags.forEach(tagName => {
                if (tagName && newTags[tagName]) {
                    newTags[tagName].count = Math.max(0, newTags[tagName].count - 1);
                    newTags[tagName].beatmapIds = newTags[tagName].beatmapIds.filter(id => id !== beatmapId);
                }
            });

            // Add beatmap to new tags
            userTags.forEach(tagObj => {
                const tagName = tagObj.tag;
                if (!tagName) return;

                if (!newTags[tagName]) {
                    newTags[tagName] = { count: 0, beatmapIds: [] };
                }

                if (!newTags[tagName].beatmapIds.includes(beatmapId)) {
                    newTags[tagName].count++;
                    newTags[tagName].beatmapIds.push(beatmapId);
                }
            });

            // Update beatmap
            newBeatmaps[beatmapId] = {
                ...prev.beatmaps[beatmapId],
                userTags,
                notes: formData.notes || '',
                beatmap_priority,
                collectionId: formData.collectionId || prev.beatmaps[beatmapId].collectionId,
                subcollectionId: formData.subcollectionId || prev.beatmaps[beatmapId].subcollectionId
            };

            return {
                ...prev,
                beatmaps: newBeatmaps,
                tags: newTags
            };
        });

        setEditingBeatmap(null);
    };

    // Funkcja usuwająca beatmapę z kolekcji
    const handleRemoveBeatmap = (beatmapId) => {
        setCollections(prev => {
            const newBeatmaps = { ...prev.beatmaps };
            const newTags = { ...prev.tags };

            // Remove beatmap from tags
            const beatmap = prev.beatmaps[beatmapId];
            if (beatmap) {
                (beatmap.userTags || []).forEach(tagObj => {
                    const tagName = tagObj.tag;
                    if (tagName && newTags[tagName]) {
                        newTags[tagName].count = Math.max(0, newTags[tagName].count - 1);
                        newTags[tagName].beatmapIds = newTags[tagName].beatmapIds.filter(id => id !== beatmapId);
                    }
                });
            }

            // Remove beatmap
            delete newBeatmaps[beatmapId];

            return {
                ...prev,
                beatmaps: newBeatmaps,
                tags: newTags
            };
        });
    };

    // Funkcja obsługująca dodanie/usunięcie beatmapy z ulubionych
    const toggleFavorite = (beatmap) => {
        // Pobierz kolekcję "Favorites"
        const favoritesCollection = collections.collections.find(c => c.name === 'Favorites');
        if (!favoritesCollection) return;

        // Sprawdź czy beatmapa jest już w ulubionych
        const isFavorited = Object.values(collections.beatmaps).some(b =>
            b.id === beatmap.id && b.collectionId === favoritesCollection.id
        );

        if (isFavorited) {
            // Usuń z ulubionych - przenieś do Unsorted
            const unsortedCollection = collections.collections.find(c => c.name === 'Unsorted');
            if (!unsortedCollection) {
                handleRemoveBeatmap(beatmap.id);
                return;
            }

            setCollections(prev => {
                const updatedBeatmaps = { ...prev.beatmaps };
                if (updatedBeatmaps[beatmap.id]) {
                    updatedBeatmaps[beatmap.id] = {
                        ...updatedBeatmaps[beatmap.id],
                        collectionId: unsortedCollection.id,
                        subcollectionId: null
                    };
                }
                return { ...prev, beatmaps: updatedBeatmaps };
            });
        } else {
            // Dodaj do ulubionych - przenieś z obecnej kolekcji do Favorites
            setCollections(prev => {
                const updatedBeatmaps = { ...prev.beatmaps };
                if (updatedBeatmaps[beatmap.id]) {
                    // Aktualizuj istniejącą beatmapę
                    updatedBeatmaps[beatmap.id] = {
                        ...updatedBeatmaps[beatmap.id],
                        collectionId: favoritesCollection.id,
                        subcollectionId: null
                    };
                    return { ...prev, beatmaps: updatedBeatmaps };
                } else {
                    // Utwórz nową beatmapę w ulubionych
                    return {
                        ...prev,
                        beatmaps: {
                            ...prev.beatmaps,
                            [beatmap.id]: {
                                ...beatmap,
                                collectionId: favoritesCollection.id,
                                subcollectionId: null
                            }
                        }
                    };
                }
            });
        }
    };

    const removeCollection = (collectionId) => {
        // Don't allow removing system collections
        const collection = collections.collections.find(c => c.id === collectionId);
        if (collection?.isSystemCollection) return;

        setCollections(prev => ({
            ...prev,
            collections: prev.collections.filter(c => c.id !== collectionId)
        }));
    };

    const removeSubcollection = (collectionId, subcollectionId) => {
        setCollections(prev => ({
            ...prev,
            collections: prev.collections.map(collection => {
                if (collection.id === collectionId) {
                    return {
                        ...collection,
                        subcollections: collection.subcollections.filter(s => s.id !== subcollectionId)
                    };
                }
                return collection;
            })
        }));
    };

    const startEditing = (id, type, initialName) => {
        if (type === 'collection') {
            setEditingCollectionId(id);
            setEditingSubcollectionId(null);
        } else {
            setEditingSubcollectionId(id);
            setEditingCollectionId(null);
        }
        setEditingName(initialName);
    };

    const saveEdit = () => {
        if (editingCollectionId) {
            setCollections(prev => ({
                ...prev,
                collections: prev.collections.map(c =>
                    c.id === editingCollectionId ? { ...c, name: editingName } : c
                )
            }));
        } else if (editingSubcollectionId) {
            setCollections(prev => ({
                ...prev,
                collections: prev.collections.map(collection => ({
                    ...collection,
                    subcollections: collection.subcollections.map(sub =>
                        sub.id === editingSubcollectionId ? { ...sub, name: editingName } : sub
                    )
                }))
            }));
        }
        setEditingCollectionId(null);
        setEditingSubcollectionId(null);
        setEditingName('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            setEditingCollectionId(null);
            setEditingSubcollectionId(null);
            setEditingName('');
        }
    };

    const addCollection = () => {
        if (!newCollectionName.trim()) return;

        setCollections(prev => ({
            ...prev,
            collections: [...prev.collections, {
                id: crypto.randomUUID(),
                name: newCollectionName.trim(),
                order: prev.collections.length,
                subcollections: []
            }]
        }));
        setNewCollectionName('');
    };

    const addSubcollection = (collectionId) => {
        const subcollectionName = newSubcollectionNames[collectionId];
        if (!subcollectionName?.trim()) return;

        setCollections(prev => ({
            ...prev,
            collections: prev.collections.map(collection => {
                if (collection.id === collectionId) {
                    return {
                        ...collection,
                        subcollections: [...collection.subcollections, {
                            id: crypto.randomUUID(),
                            name: subcollectionName.trim(),
                            order: collection.subcollections.length
                        }]
                    };
                }
                return collection;
            })
        }));
        setNewSubcollectionNames(prev => ({ ...prev, [collectionId]: '' }));
    };

    const handleCollectionInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            const validation = validateCollectionName(collections, newCollectionName);
            setValidationStates(prev => ({
                ...prev,
                collection: validation
            }));

            if (validation.isValid) {
                addCollection();
            }
        }
    };

    const handleSubcollectionInputKeyPress = (e, collectionId) => {
        if (e.key === 'Enter') {
            const name = newSubcollectionNames[collectionId] || '';
            const validation = validateCollectionName(collections, name, collectionId);
            setValidationStates(prev => ({
                ...prev,
                subcollections: {
                    ...prev.subcollections,
                    [collectionId]: validation
                }
            }));

            if (validation.isValid) {
                addSubcollection(collectionId);
            }
        }
    };

    return (
        <NeonBorderBox className="user-collections-panel">
            <h2 className="panel-title collection-header-title">Yours Collection</h2>
            
            {/* Add new collection form */}
            {editMode && (
                <div className="add-collection-form">
                    <div className="new-collection-input">
                        <input
                            type="text"
                            placeholder="New collection..."
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            onKeyDown={handleCollectionInputKeyPress}
                        />
                        <button
                            className="add-collection-button"
                            onClick={addCollection}
                            title="Add new collection"
                        >
                            <PlusCircle size={16} />
                        </button>
                    </div>
                    
                    {!validationStates.collection.isValid && (
                        <div className="error-message">
                            {validationStates.collection.message}
                        </div>
                    )}
                </div>
            )}
            
            {/* Global filter and sort controls */}
            <GlobalFilterSortControls
                sortMode={sortMode}
                sortDirection={sortDirection}
                showTagSelector={showTagSelector}
                availableTags={availableTags}
                activeTags={activeTags}
                onToggleSortMode={toggleSortMode}
                onToggleSortDirection={toggleSortDirection}
                onToggleTagSelector={() => setShowTagSelector(!showTagSelector)}
                onToggleTagFilter={toggleTagFilter}
                beatmapsCount={Object.keys(collections.beatmaps || {}).length}
            />
            
            {/* Collections list */}
            <div className="collections-list">
                {collections.collections?.map((collection) => (
                    <CollectionItem
                        key={collection.id}
                        collection={collection}
                        collections={collections} // Dodano przekazanie collections
                        editMode={editMode}
                        expandedCollection={expandedCollection}
                        expandedSubcollection={expandedSubcollection}
                        editingCollectionId={editingCollectionId}
                        editingSubcollectionId={editingSubcollectionId}
                        editingName={editingName}
                        errors={errors}
                        validationStates={validationStates}
                        newSubcollectionNames={newSubcollectionNames}                        globalTags={selectedTags}
                        dragOverCollectionId={dragOverCollectionId}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onSubcollectionDragStart={handleSubcollectionDragStart}
                        onSubcollectionDragOver={handleSubcollectionDragOver}
                        onEditCollection={(id, name) => startEditing(id, 'collection', name)}
                        onEditSubcollection={(id, name) => startEditing(id, 'subcollection', name)}
                        onEditingNameChange={setEditingName}
                        onKeyPress={handleKeyPress}
                        onSaveEdit={saveEdit}
                        onNewSubcollectionNameChange={(id, value) => setNewSubcollectionNames(prev => ({ ...prev, [id]: value }))}
                        onSubcollectionInputKeyPress={handleSubcollectionInputKeyPress}
                        onAddSubcollection={addSubcollection}
                        onRemoveCollection={removeCollection}
                        onRemoveSubcollection={removeSubcollection}
                        onToggleExpandCollection={toggleExpandCollection}
                        onToggleExpandSubcollection={toggleExpandSubcollection}
                        onToggleSortMode={toggleSortMode}
                        onToggleSortDirection={toggleSortDirection}
                        onToggleTagSelector={setShowTagSelector}
                        onToggleTagFilter={toggleTagFilter}
                        onEditBeatmap={handleEditBeatmap}
                        onDeleteBeatmap={handleRemoveBeatmap}
                        onToggleFavorite={toggleFavorite}
                        sortBeatmaps={sortBeatmaps}
                        filterBeatmapsByTags={filterBeatmapsByTags}
                    />
                ))}
            </div>
            
            {/* Modal do edycji beatmap */}
            {editingBeatmap && (
                <AddBeatmapModal
                    isOpen={!!editingBeatmap}
                    onClose={() => setEditingBeatmap(null)}
                    onSubmit={handleBeatmapEditSubmit}
                    initialData={editingBeatmap}
                    collections={collections.collections}
                    editMode={true}
                />
            )}
        </NeonBorderBox>
    );
}
