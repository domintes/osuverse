'use client';

import React, { useEffect, useState, useRef } from 'react';
import Tagify from '@yaireo/tagify';
import '@yaireo/tagify/dist/tagify.css';
import './enhancedTagInput.scss';

/**
 * Zaawansowany komponent wejściowy do zarządzania tagami oparty na bibliotece Tagify
 * Oferuje autouzupełnianie, edycję inline, wizualizacje i wiele więcej
 */
const EnhancedTagInput = ({ 
  value = [], 
  onChange, 
  suggestions = [],
  placeholder = 'Dodaj tagi...',
  maxTags = 10,
  transformTag,
  validator,
  enforceWhitelist = false,
  whitelist = [],
  className = '',
  mode = 'mix'  // 'mix' lub 'select'
}) => {
  const inputRef = useRef(null);
  const tagifyRef = useRef(null);
  const [tagifyWhitelist, setTagifyWhitelist] = useState(whitelist || suggestions);

  // Inicjalizacja Tagify
  useEffect(() => {
    if (inputRef.current) {
      tagifyRef.current = new Tagify(inputRef.current, {
        mode,
        enforceWhitelist,
        whitelist: tagifyWhitelist,
        maxTags,
        transformTag,
        placeholder,
        dropdown: {
          enabled: 1,
          maxItems: 10,
          closeOnSelect: false
        },
        callbacks: {
          add: onTagAdd,
          remove: onTagRemove,
          invalid: onInvalidTag
        }
      });

      // Czyszczenie przy odmontowaniu komponentu
      return () => {
        if (tagifyRef.current) {
          tagifyRef.current.destroy();
        }
      };
    }
  }, []);

  // Aktualizacja listy sugestii, gdy się zmienia
  useEffect(() => {
    if (tagifyRef.current) {
      const whitelist = [...(suggestions || []), ...(whitelist || [])];
      setTagifyWhitelist(whitelist);
      tagifyRef.current.settings.whitelist = whitelist;
    }
  }, [suggestions, whitelist]);

  // Aktualizacja wartości, gdy zmienia się prop value
  useEffect(() => {
    if (tagifyRef.current && value) {
      tagifyRef.current.loadOriginalValues(value);
    }
  }, [value]);

  // Funkcje zwrotne
  const onTagAdd = (e) => {
    if (onChange) {
      onChange(e.detail.tagify.value);
    }
  };

  const onTagRemove = (e) => {
    if (onChange) {
      onChange(e.detail.tagify.value);
    }
  };

  const onInvalidTag = (e) => {
    console.log('Invalid tag:', e.detail.message);
  };

  return (
    <div className={`enhanced-tag-input ${className}`}>
      <input 
        ref={inputRef} 
        defaultValue={Array.isArray(value) ? value.map(t => t.value || t).join(', ') : value}
      />
    </div>
  );
};

export default EnhancedTagInput;
