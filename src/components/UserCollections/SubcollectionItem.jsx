'use client';

import React from 'react';
import { Edit, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import '../../components/userCollections.scss';
import './userCollections.scss';

/**
 * Komponent pojedynczej podkolekcji
 */
const SubcollectionItem = ({
    collection,
    subcollection,
    editMode,
    expandedSubcollection,
    editingSubcollectionId,
    editingName,
    onDragStart,
    onDragOver,
    onEdit,
    onSaveEdit,
    onEditingNameChange,
    onKeyPress,
    onRemove,
    onToggleExpand,
    errors
}) => {
    const isEditing = editingSubcollectionId === subcollection.id;
    const isExpanded = expandedSubcollection === subcollection.id;

    return (
        <div
            className={`subcollection ${isExpanded ? 'expanded' : ''}`}
            data-subcollection-id={subcollection.id}
            draggable={editMode}
            onDragStart={(e) => onDragStart(e, collection, subcollection)}
            onDragOver={(e) => onDragOver(e, collection, subcollection)}
        >
            <div className="subcollection-header">
                {editMode && (
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
                ) : (
                    <div
                        className="subcollection-name"
                        onClick={() => onToggleExpand(subcollection.id)}
                    >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        <span>{subcollection.name}</span>
                    </div>
                )}

                {editMode && !isEditing && (
                    <div className="subcollection-actions">
                        <button
                            className="edit-button"
                            onClick={() => onEdit(subcollection.id, subcollection.name)}
                            title="Edit subcollection name"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            className="delete-button"
                            onClick={() => onRemove(collection.id, subcollection.id)}
                            title="Delete subcollection"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            {errors[`subcollection-${subcollection.id}`] && (
                <div className="error-message">{errors[`subcollection-${subcollection.id}`]}</div>
            )}
        </div>
    );
};

export default SubcollectionItem;
