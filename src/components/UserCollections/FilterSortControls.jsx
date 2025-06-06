'use client';

import React from 'react';
import { Filter, SortAsc, SortDesc } from 'lucide-react';
import TagSelector from './TagSelector';
import '../../components/userCollections.scss';
import './userCollections.scss';

/**
 * Komponent z kontrolkami filtrowania i sortowania
 */
const FilterSortControls = ({
    sortMode,
    sortDirection,
    showTagSelector,
    availableTags,
    activeTags,
    onToggleSortMode,
    onToggleSortDirection,
    onToggleTagSelector,
    onToggleTagFilter
}) => {
    return (
        <div className="sort-filter-controls">
            <div className="sorting-controls">
                <button
                    className="sort-mode-toggle"
                    onClick={onToggleSortMode}
                    title="Change sort criteria"
                >
                    <span>Sort by: </span>
                    {sortMode === 'priority' && 'Priority'}
                    {sortMode === 'name' && 'Name'}
                    {sortMode === 'date' && 'Date Added'}
                </button>
                <button
                    className="sort-direction-toggle"
                    onClick={onToggleSortDirection}
                    title="Change sort direction"
                >
                    {sortDirection === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />}
                </button>
            </div>

            <div className="filter-controls">
                <button
                    className="filter-toggle"
                    onClick={() => onToggleTagSelector(!showTagSelector)}
                    title="Filter by tags"
                >
                    <Filter size={16} />
                    <span>Filter{activeTags.length > 0 && ` (${activeTags.length})`}</span>
                </button>

                <TagSelector
                    showTagSelector={showTagSelector}
                    availableTags={availableTags}
                    activeTags={activeTags}
                    onToggleTag={onToggleTagFilter}
                    onClose={() => onToggleTagSelector(false)}
                />
            </div>
        </div>
    );
};

export default FilterSortControls;
