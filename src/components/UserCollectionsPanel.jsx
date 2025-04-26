'use client';

import { useState, useCallback, useRef } from 'react';
import { useAtom } from 'jotai';
import { IoIosAddCircle } from 'react-icons/io';
import { MdDragIndicator } from 'react-icons/md';
import { collectionsAtom } from '@/store/collectionAtom';

export default function UserCollectionsPanel() {
    const [collections, setCollections] = useAtom(collectionsAtom);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newSubcollectionNames, setNewSubcollectionNames] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedSubcollection, setDraggedSubcollection] = useState(null);
    const [dragOverCollectionId, setDragOverCollectionId] = useState(null);
    const dragPointRef = useRef({ y: 0 });

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
        e.dataTransfer.effectAllowed = 'move';
        // Store initial drag point
        dragPointRef.current = { y: e.clientY };
    };

    const handleSubcollectionDragStart = (e, collection, subcollection) => {
        e.stopPropagation();
        setDraggedSubcollection({ 
            subcollection,
            fromCollectionId: collection.id 
        });
        e.dataTransfer.effectAllowed = 'move';
        dragPointRef.current = { y: e.clientY };
    };

    const reorderCollections = useCallback((draggedId, targetId, mouseY) => {
        setCollections(prev => {
            const newCollections = [...prev.collections];
            const draggedIndex = newCollections.findIndex(c => c.id === draggedId);
            const targetIndex = newCollections.findIndex(c => c.id === targetId);
            
            if (draggedIndex === -1 || targetIndex === -1) return prev;

            // Get the target element's position
            const targetElement = document.querySelector(`[data-collection-id="${targetId}"]`);
            if (!targetElement) return prev;

            const targetRect = targetElement.getBoundingClientRect();
            const targetCenter = targetRect.top + targetRect.height / 2;

            // Only reorder if mouse is above/below center based on drag direction
            const shouldReorder = draggedIndex < targetIndex ? 
                mouseY > targetCenter : 
                mouseY < targetCenter;

            if (!shouldReorder) return prev;

            const [removed] = newCollections.splice(draggedIndex, 1);
            newCollections.splice(targetIndex, 0, removed);

            return {
                ...prev,
                collections: newCollections.map((c, index) => ({
                    ...c,
                    order: index
                }))
            };
        });
    }, []);

    const reorderSubcollections = useCallback((collectionId, draggedId, targetId, mouseY) => {
        setCollections(prev => {
            const newCollections = prev.collections.map(collection => {
                if (collection.id !== collectionId) return collection;

                const newSubcollections = [...collection.subcollections];
                const draggedIndex = newSubcollections.findIndex(s => s.id === draggedId);
                const targetIndex = newSubcollections.findIndex(s => s.id === targetId);

                if (draggedIndex === -1 || targetIndex === -1) return collection;

                // Get the target element's position
                const targetElement = document.querySelector(`[data-subcollection-id="${targetId}"]`);
                if (!targetElement) return collection;

                const targetRect = targetElement.getBoundingClientRect();
                const targetCenter = targetRect.top + targetRect.height / 2;

                // Only reorder if mouse is above/below center based on drag direction
                const shouldReorder = draggedIndex < targetIndex ? 
                    mouseY > targetCenter : 
                    mouseY < targetCenter;

                if (!shouldReorder) return collection;

                const [removed] = newSubcollections.splice(draggedIndex, 1);
                newSubcollections.splice(targetIndex, 0, removed);

                return {
                    ...collection,
                    subcollections: newSubcollections.map((s, index) => ({
                        ...s,
                        order: index
                    }))
                };
            });

            return {
                ...prev,
                collections: newCollections
            };
        });
    }, []);

    const moveSubcollection = useCallback((subcollection, fromCollectionId, toCollectionId) => {
        setCollections(prev => {
            const newCollections = prev.collections.map(collection => {
                if (collection.id === fromCollectionId) {
                    return {
                        ...collection,
                        subcollections: collection.subcollections.filter(
                            sub => sub.id !== subcollection.id
                        ).map((s, index) => ({ ...s, order: index }))
                    };
                }
                if (collection.id === toCollectionId) {
                    return {
                        ...collection,
                        subcollections: [...collection.subcollections, {
                            ...subcollection,
                            order: collection.subcollections.length
                        }]
                    };
                }
                return collection;
            });

            return {
                ...prev,
                collections: newCollections
            };
        });
    }, []);

    const handleDragOver = useCallback((e, targetCollection) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (draggedItem && draggedItem.id !== targetCollection.id) {
            setDragOverCollectionId(targetCollection.id);
            reorderCollections(draggedItem.id, targetCollection.id, e.clientY);
        }
        
        if (draggedSubcollection && draggedSubcollection.fromCollectionId !== targetCollection.id) {
            setDragOverCollectionId(targetCollection.id);
        }
    }, [draggedItem, draggedSubcollection, reorderCollections]);

    const handleSubcollectionDragOver = useCallback((e, collection, targetSubcollection) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        if (draggedSubcollection && 
            draggedSubcollection.subcollection.id !== targetSubcollection.id) {
            reorderSubcollections(
                collection.id,
                draggedSubcollection.subcollection.id,
                targetSubcollection.id,
                e.clientY
            );
        }
    }, [draggedSubcollection, reorderSubcollections]);

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDraggedSubcollection(null);
        setDragOverCollectionId(null);
    };

    const handleDrop = (e, targetCollection) => {
        e.preventDefault();
        
        if (draggedSubcollection && 
            draggedSubcollection.fromCollectionId !== targetCollection.id) {
            moveSubcollection(
                draggedSubcollection.subcollection,
                draggedSubcollection.fromCollectionId,
                targetCollection.id
            );
        }
        
        handleDragEnd();
    };

    return (
        <div className="collections-panel">
            <div className="collections-list">
                {collections.collections
                    .sort((a, b) => a.order - b.order)
                    .map(collection => (
                    <div
                        key={collection.id}
                        data-collection-id={collection.id}
                        className={`collection-item ${dragOverCollectionId === collection.id ? 'drag-over' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(collection, e)}
                        onDragOver={(e) => handleDragOver(e, collection)}
                        onDragEnd={handleDragEnd}
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
                                <div 
                                    key={sub.id}
                                    data-subcollection-id={sub.id}
                                    className={`subcollection-item ${
                                        draggedSubcollection?.subcollection.id === sub.id ? 'dragging' : ''
                                    }`}
                                    draggable
                                    onDragStart={(e) => handleSubcollectionDragStart(e, collection, sub)}
                                    onDragOver={(e) => handleSubcollectionDragOver(e, collection, sub)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="subcollection-content">
                                        <span>{sub.name}</span>
                                        <MdDragIndicator className="drag-handle" />
                                    </div>
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
                    transition: transform 0.2s ease, background-color 0.2s ease;
                    position: relative;
                }

                .collection-item.drag-over {
                    background: #3d3d3d;
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

                .subcollections {
                    padding-left: 1rem;
                }

                .subcollection-item {
                    padding: 0.5rem;
                    margin: 0.5rem 0;
                    background: #3d3d3d;
                    border-radius: 4px;
                    cursor: move;
                    transition: transform 0.2s ease, background-color 0.2s ease;
                }

                .subcollection-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .subcollection-item.dragging {
                    opacity: 0.5;
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