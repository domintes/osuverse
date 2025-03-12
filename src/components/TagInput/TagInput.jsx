import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import './TagInput.scss';

export default function TagInput({ onTagsChange, initialTags = [], placeholder = "Enter tag and press Enter" }) {
    const { register, handleSubmit, reset, watch } = useForm();
    const [tags, setTags] = useState(initialTags);
    const inputRef = useRef(null);
    const tagInputValue = watch("tagName", "");

    // Synchronizacja z zewnętrznymi tagami
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
            // Wizualne wskazanie, że tag już istnieje
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
        } else if (e.key === "Backspace" && !tagInputValue && tags.length > 0) {
            // Usuwanie ostatniego tagu przy pustym inpucie
            const lastTag = tags[tags.length - 1];
            removeTag(lastTag);
        }
    };

    return (
        <div className="tag-input-container">
            <ul className="tag-list" onClick={() => inputRef.current?.focus()}>
                {tags.map((tag, index) => (
                    <li key={index} className="tag" data-tag={tag}>
                        <span className="tag-text">{tag}</span>
                        <button 
                            type="button" 
                            className="remove-tag" 
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(tag);
                            }}
                            title="Remove tag"
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleSubmit(addTag)} className="tag-form">
                <input
                    {...register("tagName")}
                    ref={(e) => {
                        inputRef.current = e;
                        register("tagName").ref(e);
                    }}
                    type="text"
                    className="tag-input"
                    placeholder={placeholder}
                    autoComplete="off"
                    onKeyDown={handleKeyDown}
                />
                <button type="submit" className="add-tag-btn" title="Add tag">
                    + Add tag
                </button>
            </form>
        </div>
    );
}
