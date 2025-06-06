'use client';

import { useState, useRef, useCallback } from 'react';
import { useAtom } from 'jotai';
import { collectionsAtom } from '@/store/collectionAtom';

/**
 * Hook do zarządzania funkcjonalnością przeciągania i upuszczania kolekcji i podkolekcji
 */
export const useCollectionDragDrop = () => {
    const [collections, setCollections] = useAtom(collectionsAtom);
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedSubcollection, setDraggedSubcollection] = useState(null);
    const [dragOverCollectionId, setDragOverCollectionId] = useState(null);
    const [errors, setErrors] = useState({});
    const dragPointRef = useRef({ y: 0 });

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
    }, [setCollections]);

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
    }, [setCollections]);

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
    }, [setCollections]);

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

    return {
        draggedItem,
        draggedSubcollection,
        dragOverCollectionId,
        errors,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDrop,
        handleSubcollectionDragStart,
        handleSubcollectionDragOver
    };
};
