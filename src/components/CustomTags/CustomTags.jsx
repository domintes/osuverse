import { useEffect, useState, useCallback } from 'react';
import useStore from '../../store';
import './customTags.css';

export default function CustomTags({ items = [] }) {
    const [selectedTags, setSelectedTags] = useState([]);
    const [uniqueTags, setUniqueTags] = useState([]);
    const filterByTags = useStore(state => state.filterByTags);

    // Use useCallback to memoize the tag filtering logic
    const getItemsWithTag = useCallback((tag) => {
        return items.filter(item =>
            item &&
            Array.isArray(item.tags) &&
            item.tags.includes(tag) &&
            selectedTags.every(selectedTag => item.tags.includes(selectedTag))
        ).length;
    }, [items, selectedTags]);

    useEffect(() => {
        // Safely generate unique tags list, ensuring items have tags
        const allTags = Array.from(new Set(
            items
                .filter(item => item && Array.isArray(item.tags))
                .flatMap(item => item.tags)
        ));
        setUniqueTags(allTags);
    }, [items]);

    useEffect(() => {
        filterByTags(selectedTags);
    }, [selectedTags, filterByTags]);

    const toggleTag = (tagName) => {
        setSelectedTags((prevSelectedTags) =>
            prevSelectedTags.includes(tagName)
                ? prevSelectedTags.filter((tag) => tag !== tagName)
                : [...prevSelectedTags, tagName]
        );
    };

    return (
        <div className='customtags-container'>
            <h2>Custom Tags</h2>
            <div className="tags-list">
                {uniqueTags.map((tag, index) => {
                    const filteredCount = getItemsWithTag(tag);

                    return (
                        <button
                            key={index}
                            className={`tag-button ${selectedTags.includes(tag) ? 'tag-button-active' : 'tag-button-inactive'} ${filteredCount === 0 ? 'tag-button-disabled' : ''}`}
                            onClick={() => toggleTag(tag)}
                            disabled={filteredCount === 0}
                        >
                            #{tag} ({filteredCount})
                        </button>
                    );
                })}
            </div>
        </div>
    );
}