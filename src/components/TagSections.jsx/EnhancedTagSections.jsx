'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { collectionsReducerAtom } from '@/store/collectionsReducerAtom';
import { selectedTagsAtom } from '@/store/selectedTagsAtom';
import { getAllBeatmapsFromCollections } from '@/utils/beatmapUtils';
import { motion } from 'framer-motion';
import EnhancedTagInput from '../TagInput/EnhancedTagInput';
import Fuse from 'fuse.js';
import './tagSections.scss';

/**
 * Zrefaktoryzowany komponent sekcji tagów korzystający z bibliotek:
 * - @yaireo/tagify - dla zaawansowanego zarządzania tagami
 * - fuse.js - dla wyszukiwania rozmytego (fuzzy search)
 * - motion - dla animacji
 */
const EnhancedTagSections = () => {
  const [state] = useAtom(collectionsReducerAtom);
  const [selectedTags, setSelectedTags] = useAtom(selectedTagsAtom);
  const [searchValue, setSearchValue] = useState('');
  
  // Pozyskaj wszystkie tagi z beatmap
  const allTags = useMemo(() => {
    const tagMap = {};
    
    // Zbierz tagi z beatmap
    Object.values(state.beatmaps || {}).forEach(beatmap => {
      (beatmap.tags || []).forEach(tag => {
        if (!tagMap[tag]) tagMap[tag] = 0;
        tagMap[tag]++;
      });
    });
    
    // Przekształć na format dla Tagify
    return Object.entries(tagMap).map(([tag, count]) => ({
      value: tag,
      count: count
    }));
  }, [state.beatmaps]);
  
  // Grupuj tagi według kategorii (prefiks przed ":")
  const tagsByCategory = useMemo(() => {
    const categories = {};
    
    allTags.forEach(tag => {
      const [category, ...rest] = tag.value.split(':');
      const tagName = rest.length > 0 ? rest.join(':') : category;
      
      if (rest.length > 0) {
        // Jest kategorią
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push({
          ...tag,
          displayValue: tagName
        });
      } else {
        // Nie ma kategorii
        if (!categories['uncategorized']) {
          categories['uncategorized'] = [];
        }
        categories['uncategorized'].push(tag);
      }
    });
    
    return categories;
  }, [allTags]);
  
  // Ustaw wyszukiwarkę Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(allTags, {
      keys: ['value'],
      threshold: 0.3,
      ignoreLocation: true
    });
  }, [allTags]);
  
  // Filtruj tagi na podstawie wyszukiwania
  const filteredTags = useMemo(() => {
    if (!searchValue.trim()) return allTags;
    return fuse.search(searchValue).map(result => result.item);
  }, [fuse, searchValue, allTags]);
  
  // Obsługa zmiany tagów
  const handleTagsChange = (newTags) => {
    // Konwertuj format Tagify na zwykłe tagi
    const tags = newTags.map(tag => tag.value || tag);
    setSelectedTags(tags);
  };
  
  return (
    <motion.div 
      className="tag-sections-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="tag-search-section">
        <h3>Filtruj beatmapy według tagów</h3>
        <input
          type="text"
          className="tag-search-input"
          placeholder="Wyszukaj tagi..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      
      <div className="enhanced-tag-selector">
        <EnhancedTagInput
          value={selectedTags}
          onChange={handleTagsChange}
          suggestions={allTags.map(tag => tag.value)}
          placeholder="Wybierz tagi do filtrowania..."
          className="tag-input-container"
        />
        
        {selectedTags.length > 0 && (
          <motion.button
            className="clear-tags-btn"
            onClick={() => setSelectedTags([])}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Wyczyść tagi
          </motion.button>
        )}
      </div>
      
      <div className="tag-categories">
        {Object.entries(tagsByCategory).map(([category, tags]) => (
          <motion.div 
            key={category} 
            className="tag-category"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <h4>{category === 'uncategorized' ? 'Pozostałe tagi' : category}</h4>
            <div className="tag-chips">
              {tags
                .filter(tag => 
                  !searchValue.trim() || 
                  filteredTags.some(ft => ft.value === tag.value)
                )
                .map(tag => (
                  <motion.div
                    key={tag.value}
                    className={`tag-chip ${selectedTags.includes(tag.value) ? 'active' : ''}`}
                    onClick={() => {
                      if (selectedTags.includes(tag.value)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag.value));
                      } else {
                        setSelectedTags([...selectedTags, tag.value]);
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{tag.displayValue || tag.value}</span>
                    <span className="tag-count">{tag.count}</span>
                  </motion.div>
                ))
              }
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default EnhancedTagSections;
