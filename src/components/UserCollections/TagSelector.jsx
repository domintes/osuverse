'use client';

import React from 'react';
import '../../components/userCollections.scss';
import './userCollections.scss';

/**
 * Komponent selektora tagów do filtrowania beatmap
 */
const TagSelector = ({ 
    showTagSelector, 
    availableTags, 
    activeTags, 
    onToggleTag, 
    onClose 
}) => {
    if (!showTagSelector) return null;
    
    return (
        <div className="tag-selector">
            <div className="tag-selector-header">
                <h4>Filter by Tags</h4>
                <button
                    className="tag-selector-close"
                    onClick={onClose}
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
                                onChange={() => onToggleTag(tag)}
                            />
                            <span>{tag}</span>
                        </label>
                    ))
                )}
            </div>
        </div>
    );
};

export default TagSelector;
