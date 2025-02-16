import { useEffect, useState } from 'react';
import './customTags.css';

export default function CustomTags({ items }) {
    const [selectedTags, setSelectedTags] = useState([]);
    const [uniqueTags, setUniqueTags] = useState([]);

    useEffect(() => {
        // Generowanie unikalnej listy tagów na podstawie przekazanych propsów
        const allTags = Array.from(new Set(items.flatMap(item => item.tags)));
        setUniqueTags(allTags);
    }, [items]);

    // Funkcja do przełączania tagów
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
                    // Zlicz dynamicznie ile elementów ma dany tag z uwzględnieniem wybranych tagów
                    const filteredCount = items.filter(
                        (item) =>
                            item.tags.includes(tag) &&
                            selectedTags.every((selectedTag) => item.tags.includes(selectedTag))
                    ).length;

                    return (
                        <button
                            key={index}
                            className={`tag-button ${selectedTags.includes(tag) ? 'tag-button-active' : 'tag-button-inactive'} ${filteredCount === 0 ? 'tag-button-disabled' : ''}`}
                            onClick={() => toggleTag(tag)}
                            disabled={filteredCount === 0} // Wyłącz przycisk, jeśli licznik wynosi 0
                        >
                            #{tag} ({filteredCount})
                        </button>
                    );
                })}
            </div>

            <div className="collection-category-container">
                <h3>Items with Selected Tags</h3>
                <ul className="maplist-container">
                    {items.filter(
                        (item) => selectedTags.every((tag) => item.tags.includes(tag))
                    ).map((item, i) => (
                        <li key={i} className="single-item">
                            {item.name}
                        </li>
                    ))}
                    {items.filter(
                        (item) => selectedTags.every((tag) => item.tags.includes(tag))
                    ).length === 0 && <li>No items found.</li>}
                </ul>
            </div>
        </div>
    );
}
