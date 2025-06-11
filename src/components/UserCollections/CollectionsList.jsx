'use client';

import React from 'react';
import CollectionItem from './CollectionItem';
import { isCollectionEmpty } from './utils/collectionUtils';

/**
 * Komponent renderujący listę wszystkich kolekcji
 */
const CollectionsList = ({
  collections,
  collectionsState,
  editMode,
  expandedCollection,
  expandedSubcollection,
  editingCollectionId,
  editingSubcollectionId,
  editingName,
  errors,
  validationStates,
  newSubcollectionNames,
  globalTags,
  dragOverCollectionId,
  onDragStart,
  onDragOver,
  onDrop,
  onSubcollectionDragStart,
  onSubcollectionDragOver,
  onEditCollection,
  onEditSubcollection,
  onEditingNameChange,
  onKeyPress,
  onSaveEdit,
  onNewSubcollectionNameChange,
  onSubcollectionInputKeyPress,
  onAddSubcollection,
  onRemoveCollection,
  onRemoveSubcollection,
  onToggleExpandCollection,
  onToggleExpandSubcollection,
  onToggleSortMode,
  onToggleSortDirection,
  onToggleTagSelector,
  onToggleTagFilter,
  onEditBeatmap,
  onDeleteBeatmap,
  onToggleFavorite,
  sortBeatmaps,
  filterBeatmapsByTags
}) => {
  return (
    <div className="collections-list">
      {collections?.map((collection) => {
        // Sprawdź czy kolekcja systemowa jest pusta
        if (collection.isSystemCollection) {
          const collectionBeatmaps = Object.values(collectionsState.beatmaps || {}).filter(
            beatmap => beatmap.collectionId === collection.id
          );
          // Ukryj pustą kolekcję systemową
          if (collectionBeatmaps.length === 0) {
            return null;
          }
        }
                
        return (
          <CollectionItem
            key={collection.id}
            collection={collection}
            collections={collectionsState}
            editMode={editMode}
            expandedCollection={expandedCollection}
            expandedSubcollection={expandedSubcollection}
            editingCollectionId={editingCollectionId}
            editingSubcollectionId={editingSubcollectionId}
            editingName={editingName}                        
            errors={errors}
            validationStates={validationStates}
            newSubcollectionNames={newSubcollectionNames}
            globalTags={globalTags}
            dragOverCollectionId={dragOverCollectionId}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onSubcollectionDragStart={onSubcollectionDragStart}
            onSubcollectionDragOver={onSubcollectionDragOver}
            onEditCollection={(id, name) => onEditCollection(id, name)}
            onEditSubcollection={(id, name) => onEditSubcollection(id, name)}
            onEditingNameChange={onEditingNameChange}
            onKeyPress={onKeyPress}
            onSaveEdit={onSaveEdit}
            onNewSubcollectionNameChange={(id, value) => onNewSubcollectionNameChange(id, value)}
            onSubcollectionInputKeyPress={onSubcollectionInputKeyPress}
            onAddSubcollection={onAddSubcollection}
            onRemoveCollection={onRemoveCollection}
            onRemoveSubcollection={onRemoveSubcollection}
            onToggleExpandCollection={onToggleExpandCollection}
            onToggleExpandSubcollection={onToggleExpandSubcollection}
            onToggleSortMode={onToggleSortMode}
            onToggleSortDirection={onToggleSortDirection}
            onToggleTagSelector={onToggleTagSelector}
            onToggleTagFilter={onToggleTagFilter}
            onEditBeatmap={onEditBeatmap}
            onDeleteBeatmap={onDeleteBeatmap}
            onToggleFavorite={onToggleFavorite}
            sortBeatmaps={sortBeatmaps}
            filterBeatmapsByTags={filterBeatmapsByTags}
          />
        );
      })}
    </div>
  );
};

export default CollectionsList;
