'use client';

import { useState, useCallback, useRef } from 'react';
import { useAtom } from 'jotai';
import { PlusCircle, Edit, Trash2, GripVertical, X, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, Tag, Star } from 'lucide-react';
import { collectionsAtom } from '@/store/collectionAtom';
import './userCollectionsPanel.scss';
import NeonBorderBox from './NeonBorderBox';
import BeatmapModal from './BeatmapSearchResults/BeatmapModal';

export default function UserCollectionsPanel() {
    const [collections, setCollections] = useAtom(collectionsAtom);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newSubcollectionNames, setNewSubcollectionNames] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedSubcollection, setDraggedSubcollection] = useState(null);
    const [dragOverCollectionId, setDragOverCollectionId] = useState(null);
    const [editMode, setEditMode] = useState(false); // Change default to false to show beatmaps by default
    const [editingCollectionId, setEditingCollectionId] = useState(null);
    const [editingSubcollectionId, setEditingSubcollectionId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [errors, setErrors] = useState({});
    const [validationStates, setValidationStates] = useState({
        collection: { isValid: true, message: '' },
        subcollections: {}
    });
    const dragPointRef = useRef({ y: 0 });
    
    // Stan dla filtrowania i sortowania beatmap
    const [activeTags, setActiveTags] = useState([]);
    const [expandedCollection, setExpandedCollection] = useState(null);
    const [expandedSubcollection, setExpandedSubcollection] = useState(null);
    const [sortMode, setSortMode] = useState('priority'); // 'priority', 'name', 'date'
    const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'
    const [editingBeatmap, setEditingBeatmap] = useState(null);
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);

    // Funkcja filtrująca beatmapy według aktywnych tagów
    const filterBeatmapsByTags = (beatmaps) => {
        if (activeTags.length === 0) return beatmaps;
        
        return beatmaps.filter(beatmap => {
            const beatmapTags = beatmap.userTags?.map(t => t.tag) || [];
            return activeTags.every(tag => beatmapTags.includes(tag));
        });
    };
    
    // Funkcja sortująca beatmapy według różnych kryteriów
    const sortBeatmaps = (beatmaps) => {
        return [...beatmaps].sort((a, b) => {
            if (sortMode === 'priority') {
                const priorityA = a.beatmap_priority || 0;
                const priorityB = b.beatmap_priority || 0;
                return sortDirection === 'desc' 
                    ? priorityB - priorityA 
                    : priorityA - priorityB;
            } 
            
            if (sortMode === 'name') {
                const nameA = `${a.artist} - ${a.title}`.toLowerCase();
                const nameB = `${b.artist} - ${b.title}`.toLowerCase();
                return sortDirection === 'desc' 
                    ? nameB.localeCompare(nameA) 
                    : nameA.localeCompare(nameB);
            }
            
            // Default sort by date added (assumes newer beatmaps have higher IDs)
            return sortDirection === 'desc' 
                ? b.id - a.id 
                : a.id - b.id;
        });
    };
    
    // Funkcja przełączająca tag w filtrze
    const toggleTagFilter = (tag) => {
        setActiveTags(prev => 
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };
    
    // Funkcja przełączająca tryb sortowania
    const toggleSortMode = () => {
        if (sortMode === 'priority') setSortMode('name');
        else if (sortMode === 'name') setSortMode('date');
        else setSortMode('priority');
    };
    
    // Funkcja przełączająca kierunek sortowania
    const toggleSortDirection = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };
    
    // Funkcja pobierająca beatmapy przypisane do kolekcji lub podkolekcji
    const getBeatmapsForCollection = (collectionId, subcollectionId = null) => {
        return Object.values(collections.beatmaps || {}).filter(beatmap => 
            beatmap.collectionId === collectionId && 
            (subcollectionId === null || beatmap.subcollectionId === subcollectionId)
        );
    };
    
    // Funkcja pobierająca wszystkie tagi używane w kolekcji
    const getTagsForCollection = (collectionId, subcollectionId = null) => {
        const beatmaps = getBeatmapsForCollection(collectionId, subcollectionId);
        const tags = new Set();
        
        beatmaps.forEach(beatmap => {
            (beatmap.userTags || []).forEach(tagObj => {
                if (tagObj.tag) tags.add(tagObj.tag);
            });
        });
        
        return Array.from(tags);
    };
    
    // Funkcja rozwijająca/zwijająca kolekcję
    const toggleExpandCollection = (collectionId) => {
        if (expandedCollection === collectionId) {
            setExpandedCollection(null);
            setExpandedSubcollection(null);
        } else {
            setExpandedCollection(collectionId);
            setExpandedSubcollection(null);
            // Pobierz dostępne tagi dla kolekcji
            const collectionTags = getTagsForCollection(collectionId);
            setAvailableTags(collectionTags);
        }
    };
    
    // Funkcja rozwijająca/zwijająca podkolekcję
    const toggleExpandSubcollection = (subcollectionId) => {
        if (expandedSubcollection === subcollectionId) {
            setExpandedSubcollection(null);
        } else {
            setExpandedSubcollection(subcollectionId);
            // Pobierz dostępne tagi dla podkolekcji
            const subcollectionTags = getTagsForCollection(expandedCollection, subcollectionId);
            setAvailableTags(subcollectionTags);
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
            s.name.trim().toLowerCase() === name.trim().toLowerCase()
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
    };    // Funkcja renderująca wskaźnik priorytetu
    const renderPriorityIndicator = (priority) => {
        let colorClass = 'priority-neutral';
        if (priority > 3) colorClass = 'priority-high';
        else if (priority > 0) colorClass = 'priority-medium';
        else if (priority < -3) colorClass = 'priority-very-low';
        else if (priority < 0) colorClass = 'priority-low';
        
        return (
            <div className={`priority-indicator ${colorClass}`}>
                <Star size={16} />
                <span>{priority}</span>
            </div>
        );
    };
      // Funkcja renderująca beatmapę
    const renderBeatmap = (beatmap) => {
        return (
            <div className="beatmap-item" key={beatmap.id}>
                <div 
                    className="beatmap-cover" 
                    style={{backgroundImage: `url(${beatmap.cover})`}}
                />
                <div className="beatmap-info">
                    <div className="beatmap-title">{beatmap.artist} - {beatmap.title}</div>
                    <div className="beatmap-details">
                        <span className="beatmap-difficulty">{beatmap.version} ({beatmap.difficulty_rating.toFixed(2)}★)</span>
                        <span className="beatmap-creator">mapped by {beatmap.creator}</span>
                    </div>
                    <div className="beatmap-tags">
                        {beatmap.userTags?.map((tag, idx) => (
                            <div 
                                key={idx} 
                                className={`beatmap-tag ${tag.tag_value > 0 ? 'positive' : tag.tag_value < 0 ? 'negative' : ''}`}
                                title={`Priority value: ${tag.tag_value}`}
                            >
                                {tag.tag}
                                {tag.tag_value !== 0 && <span className="tag-value">{tag.tag_value}</span>}
                            </div>
                        ))}
                    </div>
                </div>
                {renderPriorityIndicator(beatmap.beatmap_priority || 0)}
                <div className="beatmap-actions">
                    <button 
                        className="beatmap-edit" 
                        onClick={() => handleEditBeatmap(beatmap)}
                        title="Edit tags and collection"
                    >
                        <Edit size={16} />
                    </button>
                    <button 
                        className="beatmap-delete"
                        onClick={() => handleRemoveBeatmap(beatmap.id)}
                        title="Remove from collection"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    };
    
    // Renderowanie listy beatmap dla kolekcji/podkolekcji
    const renderBeatmapList = (collectionId, subcollectionId = null) => {
        let beatmaps = getBeatmapsForCollection(collectionId, subcollectionId);
        beatmaps = filterBeatmapsByTags(beatmaps);
        beatmaps = sortBeatmaps(beatmaps);
        
        if (beatmaps.length === 0) {
            return <div className="empty-beatmaps">No beatmaps found in this collection.</div>;
        }
        
        return (
            <div className="beatmaps-container">
                {beatmaps.map(renderBeatmap)}
            </div>
        );
    };
    
    // Renderowanie kontrolek sortowania i filtrowania
    const renderSortFilterControls = () => {
        return (
            <div className="sort-filter-controls">
                <div className="sorting-controls">
                    <button 
                        className="sort-mode-toggle"
                        onClick={toggleSortMode}
                        title="Change sort criteria"
                    >
                        <span>Sort by: </span>
                        {sortMode === 'priority' && 'Priority'}
                        {sortMode === 'name' && 'Name'}
                        {sortMode === 'date' && 'Date Added'}
                    </button>
                    <button 
                        className="sort-direction-toggle"
                        onClick={toggleSortDirection}
                        title="Change sort direction"
                    >
                        {sortDirection === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />}
                    </button>
                </div>
                
                <div className="filter-controls">
                    <button
                        className="filter-toggle"
                        onClick={() => setShowTagSelector(!showTagSelector)}
                        title="Filter by tags"
                    >
                        <Filter size={16} />
                        <span>Filter{activeTags.length > 0 && ` (${activeTags.length})`}</span>
                    </button>
                    
                    {showTagSelector && (
                        <div className="tag-selector">
                            <div className="tag-selector-header">
                                <h4>Filter by Tags</h4>
                                <button 
                                    className="tag-selector-close"
                                    onClick={() => setShowTagSelector(false)}
                                >×</button>
                            </div>
                            <div className="tag-list">
                                {availableTags.length === 0 ? (
                                    <div className="no-tags">No tags available.</div>
                                ) : (
                                    availableTags.map((tag, idx) => (
                                        <label key={idx} className="tag-checkbox">
                                            <input 
                                                type="checkbox"
                                                checked={activeTags.includes(tag)}
                                                onChange={() => toggleTagFilter(tag)}
                                            />
                                            <span>{tag}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    // Renderowanie szczegółów kolekcji lub podkolekcji
    const renderCollectionDetails = (collectionId, subcollectionId = null) => {
        if (!collectionId) return null;
        
        return (
            <div className="collection-details">
                {renderSortFilterControls()}
                {renderBeatmapList(collectionId, subcollectionId)}
            </div>
        );
    };
}