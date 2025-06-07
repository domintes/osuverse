import React from 'react';
import PropTypes from 'prop-types';

/**
 * Komponent przełącznika widoczności grupy tagów
 */
const TagGroupToggle = ({ name, isVisible, onToggle }) => {
  return (
    <label className="tag-group-toggle">
      <input 
        type="checkbox" 
        checked={isVisible} 
        onChange={() => onToggle(name)} 
        aria-label={`Pokaż/ukryj grupę ${name}`}
      />
      {name}
    </label>
  );
};

TagGroupToggle.propTypes = {
  name: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default TagGroupToggle;
