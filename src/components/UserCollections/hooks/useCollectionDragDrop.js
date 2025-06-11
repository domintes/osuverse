'use client';

import { useState, useRef, useCallback } from 'react';
import { useAtom } from 'jotai';
import { collectionsReducerAtom } from '@/store/collectionsReducerAtom';
import { reorderCollections, reorderSubcollections, moveSubcollection } from '@/store/reducers/actions';
import { setError, clearErrors } from '@/store/reducers/uiActions';

/**
 * Hook do zarządzania funkcjonalnością przeciągania i upuszczania kolekcji i podkolekcji
 * Zrefaktoryzowany, aby używać atomWithReducer zamiast direct state
 */
export const useCollectionDragDrop = () => {
    const [state, dispatch] = useAtom(collectionsReducerAtom);
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedSubcollection, setDraggedSubcollection] = useState(null);
    const [dragOverCollectionId, setDragOverCollectionId] = useState(null);
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
    };    const handleReorderCollections = useCallback((draggedId, targetId, mouseY) => {
        // Używamy teraz akcji do dispatchowania do reducera
        // Reducer zajmie się całą logiką zmiany kolejności
        dispatch(reorderCollections(draggedId, targetId, mouseY));
    }, [dispatch]);    const handleReorderSubcollections = useCallback((collectionId, draggedId, targetId, mouseY) => {
        // Używamy teraz akcji do dispatchowania do reducera
        dispatch(reorderSubcollections(collectionId, draggedId, targetId, mouseY));
    }, [dispatch]);    const handleMoveSubcollection = useCallback((subcollection, fromCollectionId, toCollectionId) => {
        // Używamy teraz akcji do dispatchowania do reducera
        dispatch(moveSubcollection(subcollection, fromCollectionId, toCollectionId));
    }, [dispatch]);    const canMoveSubcollection = (subcollection, targetCollectionId) => {
        const targetCollection = state.collections.find(c => c.id === targetCollectionId);
        if (!targetCollection) return true;

        return !targetCollection.subcollections.some(s =>
            s.name.toLowerCase() === subcollection.name.toLowerCase()
        );
    };    const handleDragOver = useCallback((e, targetCollection) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedItem && draggedItem.id !== targetCollection.id) {
            setDragOverCollectionId(targetCollection.id);
            handleReorderCollections(draggedItem.id, targetCollection.id, e.clientY);
        }

        if (draggedSubcollection && draggedSubcollection.fromCollectionId !== targetCollection.id) {
            setDragOverCollectionId(targetCollection.id);
        }
    }, [draggedItem, draggedSubcollection, handleReorderCollections]);    const handleSubcollectionDragOver = useCallback((e, collection, targetSubcollection) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        if (draggedSubcollection &&
            draggedSubcollection.subcollection.id !== targetSubcollection.id) {
            handleReorderSubcollections(
                collection.id,
                draggedSubcollection.subcollection.id,
                targetSubcollection.id,
                e.clientY
            );
        }
    }, [draggedSubcollection, handleReorderSubcollections]);

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDraggedSubcollection(null);
        setDragOverCollectionId(null);
    };    const handleDrop = useCallback((e, targetCollection) => {
        e.preventDefault();

        if (draggedSubcollection &&
            draggedSubcollection.fromCollectionId !== targetCollection.id) {

            if (!canMoveSubcollection(draggedSubcollection.subcollection, targetCollection.id)) {
                // Show temporary error message using reducer
                const errorMessage = 'Cannot move: A subcollection with this name already exists in the target collection';
                dispatch(setError(`drop-${targetCollection.id}`, errorMessage));
                
                setTimeout(() => {
                    dispatch(clearErrors([`drop-${targetCollection.id}`]));
                }, 3000);
                return;
            }

            handleMoveSubcollection(
                draggedSubcollection.subcollection,
                draggedSubcollection.fromCollectionId,
                targetCollection.id
            );
        }

        handleDragEnd();
    }, [draggedSubcollection, canMoveSubcollection, dispatch, handleMoveSubcollection]);    return {
        draggedItem,
        draggedSubcollection,
        dragOverCollectionId,
        errors: state.errors, // Używamy błędów z centralnego stanu
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDrop,
        handleSubcollectionDragStart,
        handleSubcollectionDragOver
    };
};
