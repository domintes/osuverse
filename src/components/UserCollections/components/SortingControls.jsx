import React from 'react';
import PropTypes from 'prop-types';
import './sortingControls.scss';

/**
 * Kontrolki do sortowania list beatmap i beatmapsetów
 */
const SortingControls = ({
  sortBy,
  sortOrder,
  onSortChange,
  onOrderChange,
  options = [
    { value: 'artist', label: 'Artist' },
    { value: 'title', label: 'Title' },
    { value: 'creator', label: 'Mapper' },
    { value: 'difficulty_rating', label: 'Difficulty' }
  ],
  className = ''
}) => {
  return (
    <div className={`sorting-controls ${className}`}>
      <div className="sorting-group">
        <label className="sorting-label">Sort by:</label>
        <select 
          className="sorting-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="sorting-order">
        <button
          className={`sorting-order-button ${sortOrder === 'asc' ? 'active' : ''}`}
          onClick={() => onOrderChange('asc')}
          aria-label="Sort ascending"
          title="Sort ascending"
        >
          <svg className="sorting-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 14l5-5 5 5z" />
          </svg>
        </button>
        <button
          className={`sorting-order-button ${sortOrder === 'desc' ? 'active' : ''}`}
          onClick={() => onOrderChange('desc')}
          aria-label="Sort descending"
          title="Sort descending"
        >
          <svg className="sorting-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

SortingControls.propTypes = {
  sortBy: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onOrderChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  className: PropTypes.string
};

export default SortingControls;
