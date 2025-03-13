import React, { useState, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import './CustomTags.css';

const CustomTags = ({ tags = [], onAddTag, onRemoveTag, placeholder = 'Dodaj tag...' }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (tag) => {
    if (tag && !tags.includes(tag) && onAddTag) {
      onAddTag(tag);
      setInputValue('');
    }
  };

  const removeTag = (index) => {
    if (onRemoveTag) {
      onRemoveTag(index);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    if (inputValue.trim()) {
      addTag(inputValue.trim());
    }
  };

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <div 
      className={`custom-tags ${isFocused ? 'custom-tags--focused' : ''}`}
      onClick={focusInput}
    >
      <div className="custom-tags__container">
        {tags.map((tag, index) => (
          <div className="custom-tags__tag" key={index}>
            <span className="custom-tags__tag-text">{tag}</span>
            <button
              type="button"
              className="custom-tags__remove-button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
            >
              <FaTimes size={10} />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="custom-tags__input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={handleInputBlur}
          placeholder={tags.length === 0 ? placeholder : ''}
        />
      </div>
    </div>
  );
};

export default CustomTags;