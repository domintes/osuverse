'use client';

import { useState, useCallback, useRef } from 'react';
import { useAtom } from 'jotai';
import { IoIosAddCircle } from 'react-icons/io';
import { MdDragIndicator, MdEdit, MdDelete } from 'react-icons/md';
import { collectionsAtom } from '@/store/collectionAtom';

export default function UserCollectionsPanel() {
    const [collections, setCollections] = useAtom(collectionsAtom);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newSubcollectionNames, setNewSubcollectionNames] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedSubcollection, setDraggedSubcollection] = useState(null);
    const [dragOverCollectionId, setDragOverCollectionId] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editingCollectionId, setEditingCollectionId] = useState(null);
    const [editingSubcollectionId, setEditingSubcollectionId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [errors, setErrors] = useState({});
    const [validationStates, setValidationStates] = useState({
        collection: { isValid: true, message: '' },
        subcollections: {}
    });
    const dragPointRef = useRef({ y: 0 });

    const removeCollection = (collectionId) => {
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

    const canMoveSubcollection = (subcollection, targetCollectionId) => {
        const targetCollection = collections.collections.find(c => c.id === targetCollectionId);
        if (!targetCollection) return true;

        return !targetCollection.subcollections.some(s => 
            s.name.toLowerCase() === subcollection.name.toLowerCase()
        );
    };

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
            
            if (!canMoveSubcollection(draggedSubcollection.subcollection, targetCollection.id)) {
                // Show temporary error message
                setErrors(prev => ({
                    ...prev,
                    [`drop-${targetCollection.id}`]: 'Cannot move: A subcollection with this name already exists in the target collection'
                }));
                setTimeout(() => {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors[`drop-${targetCollection.id}`];
                        return newErrors;
                    });
                }, 3000);
                return;
            }

            moveSubcollection(
                draggedSubcollection.subcollection,
                draggedSubcollection.fromCollectionId,
                targetCollection.id
            );
        }
        
        handleDragEnd();
    };

    const validateCollectionName = (name, isNew = true) => {
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

    const validateSubcollectionName = (name, collectionId, isNew = true) => {
        if (!name.trim()) {
            return { isValid: false, message: 'Subcollection name cannot be empty' };
        }

        const collection = collections.collections.find(c => c.id === collectionId);
        if (!collection) return { isValid: true, message: '' };

        const exists = collection.subcollections.some(s => 
            s.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (exists && isNew) {
            return { isValid: false, message: 'Subcollection with this name already exists in this collection' };
        }

        return { isValid: true, message: '' };
    };

    const handleCollectionInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            const validation = validateCollectionName(newCollectionName);
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
            const validation = validateSubcollectionName(name, collectionId);
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
        <div className="collections-panel">
            <div className="edit-mode-toggle">
                <button 
                    onClick={() => setEditMode(!editMode)}
                    className={`toggle-button ${editMode ? 'active' : ''}`}
                >
                    {editMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}
                </button>
            </div>

            <div className="collections-list">
                {collections.collections
                    .sort((a, b) => a.order - b.order)
                    .map(collection => (
                    <div
                        key={collection.id}
                        data-collection-id={collection.id}
                        className={`collection-item ${dragOverCollectionId === collection.id ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, collection)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, collection)}
                    >
                        <div className="collection-header">
                            {editMode && editingCollectionId === collection.id ? (
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    onBlur={saveEdit}
                                    className="edit-input"
                                    autoFocus
                                />
                            ) : (
                                <span className="collection-name">{collection.name}</span>
                            )}
                            <div className="collection-actions">
                                {editMode && (
                                    <>
                                        <MdEdit 
                                            className="edit-icon" 
                                            onClick={() => startEditing(collection.id, 'collection', collection.name)} 
                                        />
                                        <MdDelete 
                                            className="delete-icon" 
                                            onClick={() => removeCollection(collection.id)} 
                                        />
                                    </>
                                )}
                                <div
                                    draggable
                                    onDragStart={(e) => handleDragStart(collection, e)}
                                    className="drag-handle-wrapper"
                                >
                                    <MdDragIndicator className="drag-handle" />
                                </div>
                            </div>
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
                                    onDragOver={(e) => handleSubcollectionDragOver(e, collection, sub)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="subcollection-content">
                                        {editMode && editingSubcollectionId === sub.id ? (
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={handleKeyPress}
                                                onBlur={saveEdit}
                                                className="edit-input"
                                                autoFocus
                                            />
                                        ) : (
                                            <span>{sub.name}</span>
                                        )}
                                        <div className="subcollection-actions">
                                            {editMode && (
                                                <>
                                                    <MdEdit 
                                                        className="edit-icon" 
                                                        onClick={() => startEditing(sub.id, 'subcollection', sub.name)} 
                                                    />
                                                    <MdDelete 
                                                        className="delete-icon" 
                                                        onClick={() => removeSubcollection(collection.id, sub.id)} 
                                                    />
                                                </>
                                            )}
                                            <div
                                                draggable
                                                onDragStart={(e) => handleSubcollectionDragStart(e, collection, sub)}
                                                className="drag-handle-wrapper"
                                            >
                                                <MdDragIndicator className="drag-handle" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {editMode && (
                                <div className="add-subcollection">
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            value={newSubcollectionNames[collection.id] || ''}
                                            onChange={(e) => setNewSubcollectionNames(prev => ({
                                                ...prev,
                                                [collection.id]: e.target.value
                                            }))}
                                            onKeyDown={(e) => handleSubcollectionInputKeyPress(e, collection.id)}
                                            placeholder="Subcollection name"
                                            className={`subcollection-input ${validationStates.subcollections[collection.id]?.isValid === false ? 'error' : ''}`}
                                        />
                                        {validationStates.subcollections[collection.id]?.isValid === false && (
                                            <div className="error-message">
                                                {validationStates.subcollections[collection.id].message}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => addSubcollection(collection.id)}
                                        className="add-button"
                                    >
                                        <IoIosAddCircle />
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors[`drop-${collection.id}`] && (
                            <div className="drop-error-message">
                                {errors[`drop-${collection.id}`]}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {editMode && (
                <div className="add-collection">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            onKeyDown={handleCollectionInputKeyPress}
                            placeholder="Collection name"
                            className={`collection-input ${validationStates.collection.isValid === false ? 'error' : ''}`}
                        />
                        {validationStates.collection.isValid === false && (
                            <div className="error-message">
                                {validationStates.collection.message}
                            </div>
                        )}
                    </div>
                    <button onClick={addCollection} className="add-button">
                        <IoIosAddCircle />
                    </button>
                </div>
            )}

            <style jsx>{`
                .collections-panel {
                    padding: 1rem;
                }
                
                .edit-mode-toggle {
                    margin-bottom: 1rem;
                }

                .toggle-button {
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    border: none;
                    background: #3d3d3d;
                    color: white;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .toggle-button.active {
                    background: #4a90e2;
                }

                .toggle-button:hover {
                    background: ${editMode ? '#357abd' : '#4d4d4d'};
                }
                
                .collection-item {
                    background: #2d2d2d;
                    margin-bottom: 1rem;
                    padding: 1rem;
                    border-radius: 8px;
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
                    min-height: 24px;
                    display: flex;
                    align-items: center;
                }

                .collection-actions, .subcollection-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .subcollections {
                    padding-left: 1rem;
                }

                .subcollection-item {
                    padding: 0.5rem;
                    margin: 0.5rem 0;
                    background: #3d3d3d;
                    border-radius: 4px;
                    cursor: default;
                    transition: transform 0.2s ease, background-color 0.2s ease;
                }

                .subcollection-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    min-height: 24px;
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

                .edit-input {
                    flex: 1;
                    padding: 0.5rem;
                    background: #3d3d3d;
                    border: 1px solid #4d4d4d;
                    border-radius: 4px;
                    color: white;
                    margin: 0;
                    min-height: 24px;
                }

                .error {
                    border-color: #e25555;
                    background-color: rgba(226, 85, 85, 0.1);
                }

                .input-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .error-message {
                    color: #e25555;
                    font-size: 0.875rem;
                }

                .drop-error-message {
                    color: #e25555;
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                    padding-left: 1rem;
                }

                .drag-handle-wrapper {
                    display: flex;
                    align-items: center;
                    cursor: move;
                    padding: 4px;
                }

                .drag-handle {
                    color: #666;
                }

                .subcollection-item {
                    cursor: default;
                }
            `}</style>
        </div>
    );
}