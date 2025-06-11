import React from 'react';
import PropTypes from 'prop-types';

/**
 * Komponent przycisku tagu
 */
const TagButton = ({ tag, count, type, isActive, onClick }) => {
  // Formatuj wyświetlanie tagu
  const displayText = type === 'User Tags' 
    ? `#${tag} (${count})` 
    : `${tag} (${count})`;
    
  return (
    <button
      className={`tag-button ${isActive ? 'tag-button-active' : ''}`}
      onClick={() => onClick(tag)}
      aria-pressed={isActive}
    >
      {displayText}
    </button>
  );
};

TagButton.propTypes = {
  tag: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

export default TagButton;
