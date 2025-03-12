import { useState } from 'react';
import useStore from '../store';
import '../styles/cyberpunk.css';

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
        <div className="collection-manager cyber-panel">
            <form className="collection-form" onSubmit={handleCreateCollection}>
                <input
                    type="text"
                    className="collection-input cyber-input"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="New collection name..."
                />
                <button className="create-collection-button cyber-button" type="submit">
                    Create Collection
                </button>
            </form>
            
            <div className="collections-list">
                <h3 className="collections-title">Add to collection:</h3>
                {Object.keys(collections).map((collectionName) => (
                    <button
                        key={collectionName}
                        className="collection-button cyber-button cyber-button-small"
                        onClick={() => handleAddToCollection(collectionName)}
                    >
                        {collectionName}
                    </button>
                ))}
            </div>
        </div>
    );
}
