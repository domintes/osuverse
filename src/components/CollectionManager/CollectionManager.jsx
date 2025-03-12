import { useState, useMemo } from 'react';
import useBeatmapStore from '../../stores/beatmapStore';
import OsuverseSearch from '../OsuverseSearch/OsuverseSearch';
import BeatmapSet from '../BeatmapSet/BeatmapSet';
import CollectionExport from './CollectionExport';

export default function CollectionManager() {
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [collectionFilter, setCollectionFilter] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortType, setSortType] = useState('updated'); // updated, name, size, created

    const {
        collections,
        createCollection,
        addBeatmapToCollection,
        toggleFavorite,
        favorites
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

    return (
        <div className="collection-manager">
            <div className="collections-sidebar void-container">
                <div className="collections-header">
                    <h2>Collections</h2>
                    <div className="header-actions">
                        <button 
                            className="export-btn"
                            onClick={() => setIsExporting(true)}
                            title="Export/Import collections"
                        >
                            ↔️
                        </button>
                        <button 
                            className="add-collection-btn"
                            onClick={() => setIsAddingNew(true)}
                            title="Create new collection"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="collections-filter">
                    <input
                        type="text"
                        value={collectionFilter}
                        onChange={(e) => setCollectionFilter(e.target.value)}
                        placeholder="Search collections..."
                        className="filter-input"
                    />
                    <div className="filter-types">
                        <button
                            className={filterType === 'all' ? 'active' : ''}
                            onClick={() => setFilterType('all')}
                        >
                            All
                        </button>
                        <button
                            className={filterType === 'favorites' ? 'active' : ''}
                            onClick={() => setFilterType('favorites')}
                        >
                            Favorites
                        </button>
                        <button
                            className={filterType === 'recent' ? 'active' : ''}
                            onClick={() => setFilterType('recent')}
                        >
                            Recent
                        </button>
                    </div>
                    <div className="sort-types">
                        <select
                            value={sortType}
                            onChange={(e) => setSortType(e.target.value)}
                            className="sort-select"
                        >
                            <option value="updated">Last Updated</option>
                            <option value="created">Date Created</option>
                            <option value="name">Name</option>
                            <option value="size">Size</option>
                        </select>
                    </div>
                </div>

                <div className="collections-list">
                    {filteredCollections.map(collection => (
                        <div 
                            key={collection.id}
                            className={`collection-item ${selectedCollection?.id === collection.id ? 'active' : ''}`}
                            onClick={() => setSelectedCollection(collection)}
                        >
                            <div className="collection-info">
                                <span className="collection-name">{collection.name}</span>
                                <span className="beatmap-count">
                                    {collection.beatmaps.size} beatmaps
                                </span>
                            </div>
                            <button
                                className={`favorite-btn ${favorites.collections.has(collection.id) ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite('collections', collection.id);
                                }}
                                title={favorites.collections.has(collection.id) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                ★
                            </button>
                        </div>
                    ))}
                </div>
            </div>

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
}
