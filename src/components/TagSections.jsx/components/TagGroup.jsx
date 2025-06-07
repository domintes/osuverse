import React from 'react';
import PropTypes from 'prop-types';
import TagButton from './TagButton';

/**
 * Komponent grupy tagów
 */
const TagGroup = ({ name, tags, selectedTags, onTagToggle }) => {
  // Jeśli nie ma tagów, nie renderuj grupy
  if (!tags || Object.keys(tags).length === 0) {
    return null;
  }
    
  return (
    <div className="tag-group">
      <h3 className="tag-group-title">{name}</h3>
      <div className="tags-list">
        {Object.entries(tags).map(([tag, count]) => (
          <TagButton
            key={tag}
            tag={tag}
            count={count}
            type={name}
            isActive={selectedTags.includes(tag)}
            onClick={onTagToggle}
          />
        ))}
      </div>
    </div>
  );
};

TagGroup.propTypes = {
  name: PropTypes.string.isRequired,
  tags: PropTypes.object.isRequired,
  selectedTags: PropTypes.array.isRequired,
  onTagToggle: PropTypes.func.isRequired
};

export default TagGroup;
