import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import '../../styles/cyberpunk.css';

export default function TagInput({ onTagsChange, initialTags = [], placeholder = "Enter tag and press Enter" }) {
    const { register, handleSubmit, reset, watch } = useForm();
    const [tags, setTags] = useState(initialTags);
    const inputRef = useRef(null);
    const tagInputValue = watch("tagName", "");

    useEffect(() => {
        const tagsAreDifferent = JSON.stringify(initialTags) !== JSON.stringify(tags);
        if (tagsAreDifferent && initialTags.length > 0) {
            setTags(initialTags);
        }
    }, [initialTags, tags]);

    const addTag = (data) => {
        const tagName = data.tagName.trim();
        if (!tagName) return;
        if (tags.includes(tagName)) {
            const existingTag = document.querySelector(`.tag[data-tag="${tagName}"]`);
            if (existingTag) {
                existingTag.classList.add('tag-exists');
                setTimeout(() => existingTag.classList.remove('tag-exists'), 1000);
            }
            return;
        }

        const newTags = [...tags, tagName];
        setTags(newTags);
        onTagsChange(newTags);
        reset();
    };

    const removeTag = (tagToRemove) => {
        const updatedTags = tags.filter(tag => tag !== tagToRemove);
        setTags(updatedTags);
        onTagsChange(updatedTags);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(addTag)();
        }
    };

    const handleTagListClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div className="tag-input-container cyber-panel">
            <ul className="tag-list" onClick={handleTagListClick}>
                {tags.map((tag, index) => (
                    <li 
                        key={index} 
                        className={`tag cyber-tag ${tags.includes(tag) ? 'tag-exists' : ''}`} 
                        data-tag={tag}
                    >
                        <span className="tag-text">{tag}</span>
                        <button 
                            className="remove-tag-button" 
                            onClick={() => removeTag(tag)} 
                            aria-label="Remove tag"
                        >
                            ×
                        </button>
                    </li>
                ))}
            </ul>
            <form className="tag-form" onSubmit={handleSubmit(addTag)}>
                <input
                    {...register("tagName")}
                    ref={inputRef}
                    className="tag-input cyber-input"
                    placeholder={placeholder}
                    onKeyDown={handleKeyDown}
                />
                <button 
                    type="submit" 
                    className="add-tag-button cyber-button" 
                    disabled={!tagInputValue}
                >
                    Add Tag
                </button>
            </form>
        </div>
    );
}
