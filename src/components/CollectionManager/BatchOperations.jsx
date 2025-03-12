import { useState, useMemo } from 'react';
import useBeatmapStore from '../../stores/beatmapStore';

export default function BatchOperations({ onClose }) {
    const [selectedCollections, setSelectedCollections] = useState(new Set());
    const [selectedOperation, setSelectedOperation] = useState('merge');
    const [newName, setNewName] = useState('');
    const [commonTags, setCommonTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState(new Set());

    const {
        collections,
        createCollection,
        mergeTags,
        deleteCollection,
        addTag
    } = useBeatmapStore();

    // Znajdowanie wspólnych tagów dla wybranych kolekcji
    const { allTags, commonTagsList } = useMemo(() => {
        const allTagsSet = new Set();
        const tagCounts = new Map();
        const selectedCount = selectedCollections.size;

        selectedCollections.forEach(collectionId => {
            const collection = collections.get(collectionId);
            if (!collection) return;

            const collectionTags = new Set();
            collection.beatmaps.forEach(beatmap => {
                beatmap.tags.forEach(tag => {
                    allTagsSet.add(tag);
                    collectionTags.add(tag);
                });
            });

            collectionTags.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
        });

        const common = Array.from(tagCounts.entries())
            .filter(([_, count]) => count === selectedCount)
            .map(([tag]) => tag);

        return {
            allTags: Array.from(allTagsSet),
            commonTagsList: common
        };
    }, [selectedCollections, collections]);

    // Obsługa operacji wsadowych
    const handleBatchOperation = () => {
        switch (selectedOperation) {
            case 'merge': {
                if (!newName.trim()) return;

                // Tworzenie nowej kolekcji z połączonych
                const id = createCollection(newName);
                const newCollection = collections.get(id);

                // Łączenie beatmap i tagów
                selectedCollections.forEach(collectionId => {
                    const collection = collections.get(collectionId);
                    if (!collection) return;

                    collection.beatmaps.forEach((beatmapData, beatmapId) => {
                        newCollection.beatmaps.set(beatmapId, {
                            ...beatmapData,
                            tags: new Set([...beatmapData.tags, ...selectedTags])
                        });
                    });
                });

                // Usuwanie starych kolekcji
                selectedCollections.forEach(id => deleteCollection(id));
                break;
            }

            case 'tags': {
                // Dodawanie/usuwanie tagów we wszystkich wybranych kolekcjach
                selectedCollections.forEach(collectionId => {
                    const collection = collections.get(collectionId);
                    if (!collection) return;

                    collection.beatmaps.forEach(beatmapData => {
                        selectedTags.forEach(tag => {
                            addTag(tag);
                            beatmapData.tags.add(tag);
                        });
                    });
                });
                break;
            }

            case 'delete':
                // Usuwanie wybranych kolekcji
                selectedCollections.forEach(id => deleteCollection(id));
                break;
        }

        onClose();
    };

    return (
        <div className="batch-operations void-container">
            <div className="batch-header">
                <h3>Batch Operations</h3>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="batch-content">
                <div className="collections-section">
                    <h4>Select Collections</h4>
                    <div className="collections-list">
                        {Array.from(collections.values()).map(collection => (
                            <label key={collection.id} className="collection-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedCollections.has(collection.id)}
                                    onChange={(e) => {
                                        const newSelected = new Set(selectedCollections);
                                        if (e.target.checked) {
                                            newSelected.add(collection.id);
                                        } else {
                                            newSelected.delete(collection.id);
                                        }
                                        setSelectedCollections(newSelected);
                                    }}
                                />
                                <span className="checkbox-custom" />
                                <span className="collection-name">{collection.name}</span>
                                <span className="beatmap-count">
                                    {collection.beatmaps.size} beatmaps
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="operation-section">
                    <h4>Select Operation</h4>
                    <div className="operation-types">
                        <label className="operation-radio">
                            <input
                                type="radio"
                                value="merge"
                                checked={selectedOperation === 'merge'}
                                onChange={(e) => setSelectedOperation(e.target.value)}
                            />
                            <span className="radio-custom" />
                            <span>Merge Collections</span>
                        </label>
                        <label className="operation-radio">
                            <input
                                type="radio"
                                value="tags"
                                checked={selectedOperation === 'tags'}
                                onChange={(e) => setSelectedOperation(e.target.value)}
                            />
                            <span className="radio-custom" />
                            <span>Manage Tags</span>
                        </label>
                        <label className="operation-radio">
                            <input
                                type="radio"
                                value="delete"
                                checked={selectedOperation === 'delete'}
                                onChange={(e) => setSelectedOperation(e.target.value)}
                            />
                            <span className="radio-custom" />
                            <span>Delete Collections</span>
                        </label>
                    </div>
                </div>

                {selectedOperation === 'merge' && (
                    <div className="merge-options">
                        <h4>Merge Options</h4>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="New collection name..."
                            className="merge-input"
                        />
                        <div className="tags-section">
                            <h5>Common Tags</h5>
                            <div className="tags-list">
                                {commonTagsList.map(tag => (
                                    <label key={tag} className="tag-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedTags.has(tag)}
                                            onChange={(e) => {
                                                const newSelected = new Set(selectedTags);
                                                if (e.target.checked) {
                                                    newSelected.add(tag);
                                                } else {
                                                    newSelected.delete(tag);
                                                }
                                                setSelectedTags(newSelected);
                                            }}
                                        />
                                        <span className="checkbox-custom" />
                                        <span>{tag}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {selectedOperation === 'tags' && (
                    <div className="tags-options">
                        <h4>Tag Options</h4>
                        <div className="tags-section">
                            <h5>Available Tags</h5>
                            <div className="tags-list">
                                {allTags.map(tag => (
                                    <label key={tag} className="tag-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedTags.has(tag)}
                                            onChange={(e) => {
                                                const newSelected = new Set(selectedTags);
                                                if (e.target.checked) {
                                                    newSelected.add(tag);
                                                } else {
                                                    newSelected.delete(tag);
                                                }
                                                setSelectedTags(newSelected);
                                            }}
                                        />
                                        <span className="checkbox-custom" />
                                        <span>{tag}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {selectedOperation === 'delete' && (
                    <div className="delete-warning">
                        <p>⚠️ This operation will permanently delete the selected collections.</p>
                        <p>This action cannot be undone.</p>
                    </div>
                )}

                <div className="batch-actions">
                    <button 
                        className="cancel-btn"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="apply-btn"
                        onClick={handleBatchOperation}
                        disabled={
                            selectedCollections.size === 0 ||
                            (selectedOperation === 'merge' && !newName.trim())
                        }
                    >
                        {selectedOperation === 'merge' ? 'Merge Collections' :
                         selectedOperation === 'tags' ? 'Apply Tags' :
                         'Delete Collections'}
                    </button>
                </div>
            </div>
        </div>
    );
}
