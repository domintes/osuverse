'use client';

import React from 'react';
import { Edit, Trash2, GripVertical, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import SubcollectionItem from './SubcollectionItem';
import BeatmapList from './BeatmapList';
import FilterSortControls from './FilterSortControls';
import { validateSubcollectionName } from './utils/collectionUtils';
import '../../components/userCollections.scss';
import './userCollections.scss';

/**
 * Komponent pojedynczej kolekcji
 */
const CollectionItem = ({
    collection,
    collections,
    editMode,
    expandedCollection,
    expandedSubcollection,
    editingCollectionId,
    editingSubcollectionId,
    editingName,
    errors,
    validationStates,
    newSubcollectionNames,
    sortMode,
    sortDirection,
    showTagSelector,    availableTags,
    activeTags,
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
    const isEditing = editingCollectionId === collection.id;
    const isExpanded = expandedCollection === collection.id;
    const isDragOver = dragOverCollectionId === collection.id;

    return (
        <div
            className={`collection ${isExpanded ? 'expanded' : ''} ${isDragOver ? 'drag-over' : ''}`}
            data-collection-id={collection.id}
            draggable={editMode && !collection.isSystemCollection}
            onDragStart={(e) => onDragStart(collection, e)}
            onDragOver={(e) => onDragOver(e, collection)}
            onDrop={(e) => onDrop(e, collection)}
        >
            <div className="collection-header">
                {editMode && !collection.isSystemCollection && (
                    <div className="drag-handle">
                        <GripVertical size={16} />
                    </div>
                )}

                {isEditing ? (
                    <input
                        type="text"
                        value={editingName}
                        onChange={(e) => onEditingNameChange(e.target.value)}
                        onBlur={onSaveEdit}
                        onKeyDown={onKeyPress}
                        autoFocus
                    />
                ) : (                    <div
                        className="collection-name"
                        onClick={() => onToggleExpandCollection(collection.id)}
                    >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        <span>{collection.name}</span>
                    </div>
                )}

                {editMode && !isEditing && !collection.isSystemCollection && (
                    <div className="collection-actions">
                        <button
                            className="edit-button"
                            onClick={() => onEditCollection(collection.id, collection.name)}
                            title="Edit collection name"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            className="delete-button"
                            onClick={() => onRemoveCollection(collection.id)}
                            title="Delete collection"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            {errors[`collection-${collection.id}`] && (
                <div className="error-message">{errors[`collection-${collection.id}`]}</div>
            )}

            {errors[`drop-${collection.id}`] && (
                <div className="error-message">{errors[`drop-${collection.id}`]}</div>
            )}

            {/* Subcollections */}
            <div className="subcollections">
                {collection.subcollections?.map((subcollection) => (
                    <div key={subcollection.id} className="subcollection-wrapper">
                        <SubcollectionItem
                            collection={collection}
                            subcollection={subcollection}
                            editMode={editMode}
                            expandedSubcollection={expandedSubcollection}
                            editingSubcollectionId={editingSubcollectionId}
                            editingName={editingName}
                            onDragStart={onSubcollectionDragStart}
                            onDragOver={onSubcollectionDragOver}
                            onEdit={(id, name) => onEditSubcollection(id, name)}
                            onSaveEdit={onSaveEdit}
                            onEditingNameChange={onEditingNameChange}
                            onKeyPress={onKeyPress}
                            onRemove={onRemoveSubcollection}
                            onToggleExpand={onToggleExpandSubcollection}
                            errors={errors}
                        />
                        
                        {expandedSubcollection === subcollection.id && (
                            <>
                                <FilterSortControls
                                    sortMode={sortMode}
                                    sortDirection={sortDirection}
                                    showTagSelector={showTagSelector}
                                    availableTags={availableTags}
                                    activeTags={activeTags}
                                    onToggleSortMode={onToggleSortMode}
                                    onToggleSortDirection={onToggleSortDirection}
                                    onToggleTagSelector={onToggleTagSelector}
                                    onToggleTagFilter={onToggleTagFilter}
                                />                                <BeatmapList
                                    collections={collections}
                                    collectionId={collection.id}
                                    subcollectionId={subcollection.id}
                                    sortBeatmaps={sortBeatmaps}
                                    filterBeatmapsByTags={filterBeatmapsByTags}
                                    globalTags={collection.globalTags || []}
                                    onEdit={onEditBeatmap}
                                    onDelete={onDeleteBeatmap}
                                    onToggleFavorite={onToggleFavorite}
                                />
                            </>
                        )}
                    </div>
                ))}

                {/* Add new subcollection form */}
                {editMode && (
                    <div className="add-subcollection">
                        <div className="new-subcollection-input">
                            <input
                                type="text"
                                placeholder="New subcollection..."
                                value={newSubcollectionNames[collection.id] || ''}
                                onChange={(e) => onNewSubcollectionNameChange(collection.id, e.target.value)}
                                onKeyDown={(e) => onSubcollectionInputKeyPress(e, collection.id)}
                            />
                            <button
                                className="add-subcollection-button"
                                onClick={() => onAddSubcollection(collection.id)}
                                title="Add new subcollection"
                            >
                                <PlusCircle size={16} />
                            </button>
                        </div>
                        
                        {validationStates.subcollections[collection.id] && 
                        !validationStates.subcollections[collection.id].isValid && (
                            <div className="error-message">
                                {validationStates.subcollections[collection.id].message}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Collection's beatmaps (direct, not in subcollections) */}
            {isExpanded && expandedSubcollection === null && (
                <>
                    <FilterSortControls
                        sortMode={sortMode}
                        sortDirection={sortDirection}
                        showTagSelector={showTagSelector}
                        availableTags={availableTags}
                        activeTags={activeTags}
                        onToggleSortMode={onToggleSortMode}
                        onToggleSortDirection={onToggleSortDirection}
                        onToggleTagSelector={onToggleTagSelector}
                        onToggleTagFilter={onToggleTagFilter}
                    />                    <BeatmapList
                        collections={collections}
                        collectionId={collection.id}
                        subcollectionId={null}
                        sortBeatmaps={sortBeatmaps}
                        filterBeatmapsByTags={filterBeatmapsByTags}
                        globalTags={globalTags}
                        onEdit={onEditBeatmap}
                        onDelete={onDeleteBeatmap}
                        onToggleFavorite={onToggleFavorite}
                    />
                </>
            )}
        </div>
    );
};

export default CollectionItem;
