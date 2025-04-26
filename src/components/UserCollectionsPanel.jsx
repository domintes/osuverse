'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { IoIosAddCircle } from 'react-icons/io';
import { MdDragIndicator } from 'react-icons/md';
import { collectionsAtom } from '@/store/collectionAtom';

export default function UserCollectionsPanel() {
    const [collections, setCollections] = useAtom(collectionsAtom);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newSubcollectionNames, setNewSubcollectionNames] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);

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

    const handleDragStart = (collection, e) => {
        setDraggedItem(collection);
        // Create a custom drag image
        const dragImage = document.createElement('div');
        dragImage.textContent = 'Move here';
        dragImage.style.padding = '8px';
        dragImage.style.background = '#333';
        dragImage.style.color = 'white';
        dragImage.style.borderRadius = '4px';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => document.body.removeChild(dragImage), 0);
    };

    const handleDragOver = (e, targetCollection) => {
        e.preventDefault();
        if (draggedItem?.id !== targetCollection.id) {
            setDropTarget(targetCollection);
        }
    };

    const handleDrop = (e, targetCollection) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetCollection.id) return;

        setCollections(prev => {
            const newCollections = [...prev.collections];
            const draggedIndex = newCollections.findIndex(c => c.id === draggedItem.id);
            const targetIndex = newCollections.findIndex(c => c.id === targetCollection.id);
            
            // Update orders
            const [removed] = newCollections.splice(draggedIndex, 1);
            newCollections.splice(targetIndex, 0, removed);
            newCollections.forEach((collection, index) => {
                collection.order = index;
            });

            return {
                ...prev,
                collections: newCollections
            };
        });
        setDraggedItem(null);
        setDropTarget(null);
    };

    return (
        <div className="collections-panel">
            <div className="collections-list">
                {collections.collections
                    .sort((a, b) => a.order - b.order)
                    .map(collection => (
                    <div
                        key={collection.id}
                        className={`collection-item ${dropTarget?.id === collection.id ? 'drop-target' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(collection, e)}
                        onDragOver={(e) => handleDragOver(e, collection)}
                        onDrop={(e) => handleDrop(e, collection)}
                    >
                        <div className="collection-header">
                            <span className="collection-name">{collection.name}</span>
                            <MdDragIndicator className="drag-handle" />
                        </div>
                        
                        <div className="subcollections">
                            {collection.subcollections
                                .sort((a, b) => a.order - b.order)
                                .map(sub => (
                                <div key={sub.id} className="subcollection-item">
                                    {sub.name}
                                </div>
                            ))}
                            
                            <div className="add-subcollection">
                                <input
                                    type="text"
                                    value={newSubcollectionNames[collection.id] || ''}
                                    onChange={(e) => setNewSubcollectionNames(prev => ({
                                        ...prev,
                                        [collection.id]: e.target.value
                                    }))}
                                    placeholder="Subcollection name"
                                    className="subcollection-input"
                                />
                                <button
                                    onClick={() => addSubcollection(collection.id)}
                                    className="add-button"
                                >
                                    <IoIosAddCircle />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="add-collection">
                <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Collection name"
                    className="collection-input"
                />
                <button onClick={addCollection} className="add-button">
                    <IoIosAddCircle />
                </button>
            </div>

            <style jsx>{`
                .collections-panel {
                    padding: 1rem;
                }
                
                .collection-item {
                    background: #2d2d2d;
                    margin-bottom: 1rem;
                    padding: 1rem;
                    border-radius: 8px;
                    cursor: move;
                }

                .collection-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .collection-name {
                    font-weight: bold;
                }

                .drag-handle {
                    cursor: move;
                    color: #666;
                }

                .drop-target {
                    border: 2px dashed #666;
                }

                .subcollections {
                    padding-left: 1rem;
                }

                .subcollection-item {
                    padding: 0.5rem;
                    margin: 0.5rem 0;
                    background: #3d3d3d;
                    border-radius: 4px;
                }

                .add-collection, .add-subcollection {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }

                .collection-input, .subcollection-input {
                    flex: 1;
                    padding: 0.5rem;
                    background: #3d3d3d;
                    border: 1px solid #4d4d4d;
                    border-radius: 4px;
                    color: white;
                }

                .add-button {
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    font-size: 1.5rem;
                    padding: 0;
                    display: flex;
                    align-items: center;
                }

                .add-button:hover {
                    color: #999;
                }
            `}</style>
        </div>
    );
}