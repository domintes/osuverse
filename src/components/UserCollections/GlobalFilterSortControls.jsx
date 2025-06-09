import React from 'react';
import PropTypes from 'prop-types';
import { Filter, SortAsc, SortDesc } from 'lucide-react';
import TagSelector from '../UserCollections/TagSelector';

/**
 * Globalny komponent kontrolek filtrowania i sortowania dla wszystkich kolekcji
 * Ten komponent powinien być używany na poziomie głównego panelu kolekcji,
 * zamiast powtarzać go dla każdej kolekcji osobno
 */
const GlobalFilterSortControls = ({
    sortMode,
    sortDirection,
    showTagSelector,
    availableTags,
    activeTags,
    onToggleSortMode,
    onToggleSortDirection,
    onToggleTagSelector,
    onToggleTagFilter,
    beatmapsCount = 0
}) => {
    return (
        <div className="sort-filter-controls global">
            <div className="control-group">
                <span className="beatmaps-count">
                    {beatmapsCount} beatmap{beatmapsCount !== 1 ? 's' : ''}
                </span>
            </div>
            
            <div className="control-group">
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
                
                <button
                    className={`filter-toggle ${showTagSelector ? 'active' : ''}`}
                    onClick={onToggleTagSelector}
                    title="Filter by tags"
                >
                    <Filter size={16} />
                    <span>Filter</span>
                </button>
            </div>
            
            {/* Tag selector panel (visible when toggled) */}
            {showTagSelector && (
                <TagSelector
                    availableTags={availableTags}
                    activeTags={activeTags}
                    onToggleTag={onToggleTagFilter}
                />
            )}
        </div>
    );
};

GlobalFilterSortControls.propTypes = {
    sortMode: PropTypes.string.isRequired,
    sortDirection: PropTypes.string.isRequired,
    showTagSelector: PropTypes.bool.isRequired,
    availableTags: PropTypes.array.isRequired,
    activeTags: PropTypes.array.isRequired,
    onToggleSortMode: PropTypes.func.isRequired,
    onToggleSortDirection: PropTypes.func.isRequired,
    onToggleTagSelector: PropTypes.func.isRequired,
    onToggleTagFilter: PropTypes.func.isRequired,
    beatmapsCount: PropTypes.number
};

export default GlobalFilterSortControls;
