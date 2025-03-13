import React, { useState, useMemo } from 'react';
import { FaTrash, FaEdit, FaEye, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useBeatmapStore from '../../stores/beatmapStore';
import OsuverseSearch from '../OsuverseSearch/OsuverseSearch';
import BeatmapSet from '../BeatmapSet/BeatmapSet';
import CollectionExport from './CollectionExport';
import {
  collectionManagerClass,
  collectionListClass,
  collectionItemClass,
  collectionItemActiveClass,
  collectionItemTitleClass,
  collectionItemCountClass,
  collectionItemActionsClass,
  collectionItemButtonClass,
  collectionItemButtonDeleteClass,
  collectionItemButtonEditClass,
  collectionItemButtonViewClass,
  collectionFormClass,
  collectionFormInputClass,
  collectionFormButtonClass,
  collectionFormButtonCancelClass,
  collectionFormButtonSubmitClass
} from './components';
import './CollectionManager.css';

const CollectionManager = () => {
    const navigate = useNavigate();
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [collectionFilter, setCollectionFilter] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortType, setSortType] = useState('updated'); // updated, name, size, created
    const [editingCollection, setEditingCollection] = useState(null);
    const [editName, setEditName] = useState('');

    const {
        collections,
        createCollection,
        addBeatmapToCollection,
        toggleFavorite,
        favorites,
        addCollection,
        removeCollection,
        updateCollection
    } = useBeatmapStore();

    // Filtrowanie i sortowanie kolekcji
    const filteredCollections = useMemo(() => {
        let filtered = Array.from(collections.values());

        // Filtrowanie po tekście
        if (collectionFilter) {
            const searchText = collectionFilter.toLowerCase();
            filtered = filtered.filter(collection =>
                collection.name.toLowerCase().includes(searchText) ||
                Array.from(collection.beatmaps.values()).some(beatmap =>
                    beatmap.tags.some(tag => tag.toLowerCase().includes(searchText))
                )
            );
        }

        // Filtrowanie po typie
        switch (filterType) {
            case 'favorites':
                filtered = filtered.filter(collection => 
                    favorites.collections.has(collection.id)
                );
                break;
            case 'recent':
                filtered = filtered.filter(collection => 
                    Date.now() - collection.updatedAt < 7 * 24 * 60 * 60 * 1000
                );
                break;
        }

        // Sortowanie
        switch (sortType) {
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'size':
                filtered.sort((a, b) => b.beatmaps.size - a.beatmaps.size);
                break;
            case 'created':
                filtered.sort((a, b) => b.createdAt - a.createdAt);
                break;
            case 'updated':
            default:
                filtered.sort((a, b) => b.updatedAt - a.updatedAt);
        }

        return filtered;
    }, [collections, collectionFilter, filterType, sortType, favorites.collections]);

    // Obsługa wyszukiwania
    const handleSearch = (results) => {
        setSearchResults(results);
    };

    // Obsługa dodawania beatmapy do kolekcji
    const handleAddToCollection = (beatmapId) => {
        if (!selectedCollection) {
            setIsAddingNew(true);
            return;
        }
        addBeatmapToCollection(selectedCollection.id, beatmapId);
    };

    // Tworzenie nowej kolekcji
    const handleCreateCollection = () => {
        if (!newCollectionName.trim()) return;
        const id = createCollection(newCollectionName);
        setSelectedCollection(collections.get(id));
        setIsAddingNew(false);
        setNewCollectionName('');
    };

    const handleAddCollection = (e) => {
        e.preventDefault();
        if (newCollectionName.trim()) {
            addCollection({ name: newCollectionName.trim(), beatmaps: [] });
            setNewCollectionName('');
        }
    };

    const handleEditCollection = (e) => {
        e.preventDefault();
        if (editName.trim() && editingCollection) {
            updateCollection(editingCollection.id, { ...editingCollection, name: editName.trim() });
            setEditingCollection(null);
            setEditName('');
        }
    };

    const startEditing = (collection) => {
        setEditingCollection(collection);
        setEditName(collection.name);
    };

    const cancelEditing = () => {
        setEditingCollection(null);
        setEditName('');
    };

    const viewCollection = (collection) => {
        navigate('/collection-details', { state: { collection } });
    };

    return (
        <div className={collectionManagerClass}>
            <h2>Twoje kolekcje</h2>
            
            <div className={collectionListClass}>
                {filteredCollections.map(collection => (
                    <div 
                        key={collection.id} 
                        className={`${collectionItemClass} ${editingCollection?.id === collection.id ? collectionItemActiveClass : ''}`}
                    >
                        {editingCollection?.id === collection.id ? (
                            <form className={collectionFormClass} onSubmit={handleEditCollection}>
                                <input
                                    type="text"
                                    className={collectionFormInputClass}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    autoFocus
                                />
                                <button 
                                    type="button" 
                                    className={`${collectionFormButtonClass} ${collectionFormButtonCancelClass}`}
                                    onClick={cancelEditing}
                                >
                                    Anuluj
                                </button>
                                <button 
                                    type="submit" 
                                    className={`${collectionFormButtonClass} ${collectionFormButtonSubmitClass}`}
                                >
                                    Zapisz
                                </button>
                            </form>
                        ) : (
                            <>
                                <div>
                                    <span className={collectionItemTitleClass}>{collection.name}</span>
                                    <span className={collectionItemCountClass}>
                                        ({collection.beatmaps.size} beatmap)
                                    </span>
                                </div>
                                <div className={collectionItemActionsClass}>
                                    <button 
                                        className={`${collectionItemButtonClass} ${collectionItemButtonViewClass}`}
                                        onClick={() => viewCollection(collection)}
                                        title="Zobacz kolekcję"
                                    >
                                        <FaEye />
                                    </button>
                                    <button 
                                        className={`${collectionItemButtonClass} ${collectionItemButtonEditClass}`}
                                        onClick={() => startEditing(collection)}
                                        title="Edytuj nazwę"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        className={`${collectionItemButtonClass} ${collectionItemButtonDeleteClass}`}
                                        onClick={() => removeCollection(collection.id)}
                                        title="Usuń kolekcję"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            
            <form className={collectionFormClass} onSubmit={handleAddCollection}>
                <input
                    type="text"
                    className={collectionFormInputClass}
                    placeholder="Nazwa nowej kolekcji..."
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                />
                <button 
                    type="submit" 
                    className={`${collectionFormButtonClass} ${collectionFormButtonSubmitClass}`}
                    disabled={!newCollectionName.trim()}
                >
                    <FaPlus style={{ marginRight: '5px' }} /> Dodaj kolekcję
                </button>
            </form>

            <div className="collection-content">
                <div className="search-container">
                    <OsuverseSearch onSearch={handleSearch} />
                </div>

                <div className="beatmaps-container">
                    {searchResults.map(beatmapset => (
                        <BeatmapSet
                            key={beatmapset.id}
                            beatmapset={beatmapset}
                            onAddToCollection={handleAddToCollection}
                            onRemoveFromCollection={(beatmapId) => {
                                if (selectedCollection) {
                                    selectedCollection.beatmaps.delete(beatmapId);
                                }
                            }}
                            isInCollection={selectedCollection?.beatmaps.has(beatmapset.id)}
                        />
                    ))}
                </div>
            </div>

            {isAddingNew && (
                <div className="modal-overlay">
                    <div className="modal void-container">
                        <h3>Create New Collection</h3>
                        <input
                            type="text"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            placeholder="Collection name..."
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button 
                                className="cancel-btn"
                                onClick={() => {
                                    setIsAddingNew(false);
                                    setNewCollectionName('');
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="create-btn"
                                onClick={handleCreateCollection}
                                disabled={!newCollectionName.trim()}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isExporting && (
                <div className="modal-overlay">
                    <CollectionExport onClose={() => setIsExporting(false)} />
                </div>
            )}
        </div>
    );
};

export default CollectionManager;
