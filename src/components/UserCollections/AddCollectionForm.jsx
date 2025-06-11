'use client';

import React from 'react';
import { PlusCircle } from 'lucide-react';

/**
 * Komponent formularza do dodawania nowej kolekcji
 */
const AddCollectionForm = ({
  newCollectionName,
  onNewCollectionNameChange,
  onKeyPress,
  onAddCollection,
  validationState
}) => {
  return (
    <div className="add-collection-form">
      <div className="new-collection-input">
        <input
          type="text"
          placeholder="New collection..."
          value={newCollectionName}
          onChange={(e) => onNewCollectionNameChange(e.target.value)}
          onKeyDown={onKeyPress}
        />
        <button
          className="add-collection-button"
          onClick={onAddCollection}
          title="Add new collection"
        >
          <PlusCircle size={16} />
        </button>
      </div>
      
      {!validationState.isValid && (
        <div className="error-message">
          {validationState.message}
        </div>
      )}
    </div>
  );
};

export default AddCollectionForm;
