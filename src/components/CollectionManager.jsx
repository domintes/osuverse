import { useState } from 'react';
import useStore from '../store';
import './collectionManager.scss';

export default function CollectionManager({ beatmap }) {
    const [newCollectionName, setNewCollectionName] = useState('');
    const { collections, createCollection, addBeatmapToCollection } = useStore();

    const handleCreateCollection = (e) => {
        e.preventDefault();
        if (newCollectionName.trim()) {
            createCollection(newCollectionName.trim());
            setNewCollectionName('');
        }
    };

    const handleAddToCollection = (collectionName) => {
        addBeatmapToCollection(collectionName, beatmap);
    };

    return (
        <div className="collection-manager">
            <form onSubmit={handleCreateCollection}>
                <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="New collection name..."
                />
                <button type="submit">Create Collection</button>
            </form>
            
            <div className="collections-list">
                <h3>Add to collection:</h3>
                {Object.keys(collections).map((collectionName) => (
                    <button
                        key={collectionName}
                        onClick={() => handleAddToCollection(collectionName)}
                    >
                        {collectionName}
                    </button>
                ))}
            </div>
        </div>
    );
}
