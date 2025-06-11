import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import './tagInput.scss';


export default function TagInput({ initialTags = [], onTagsChange }) {
    const { register, handleSubmit, reset } = useForm();
    const [tags, setTags] = useState([]);

    // Efekt, który załaduje początkowe tagi jeśli są dostarczone
    useEffect(() => {
        if (initialTags && initialTags.length > 0) {
            // Przekształć tagi do jednolitego formatu (string)
            const processedTags = initialTags.map(tag => {
                if (typeof tag === 'string') return tag;
                if (tag && typeof tag === 'object' && tag.tag) return tag.tag;
                return null;
            }).filter(Boolean); // Filtruj nullowe wartości
            
            setTags(processedTags);
        }
    }, [initialTags]);

    const addTag = (data) => {
        if (!data.tagName.trim()) return; // Nie dodawaj pustych tagów
        
        // Sprawdź czy tag już istnieje (uwzględnij zarówno format string jak i obiektowy)
        const tagExists = tags.some(tag => {
            if (typeof tag === 'string') return tag === data.tagName.trim();
            if (tag && typeof tag === 'object' && tag.tag) return tag.tag === data.tagName.trim();
            return false;
        });
        
        if (tagExists) return; // Nie dodawaj duplikatów

        const newTag = data.tagName.trim();
        const newTags = [...tags, newTag];
        setTags(newTags);
        onTagsChange(newTags); // Przekazanie tagów do komponentu nadrzędnego
        reset(); // Reset inputa
    };

    const removeTag = (tagToRemove) => {
        const updatedTags = tags.filter(tag => {
            if (typeof tag === 'string') return tag !== tagToRemove;
            if (tag && typeof tag === 'object' && tag.tag) return tag.tag !== tagToRemove;
            return true;
        });
        
        setTags(updatedTags);
        onTagsChange(updatedTags);
    };

    return (
        <div className="tag-input-container">
            <ul className="tag-list">                {tags.map((tag, index) => {
                    // Obsługa tagów w różnych formatach (string lub obiekt)
                    const displayTag = typeof tag === 'string' ? tag : (tag && tag.tag ? tag.tag : '');
                    
                    return (
                        <li key={index} className="tag">
                            {displayTag} 
                            <button 
                                type="button" 
                                className="remove-tag" 
                                onClick={() => removeTag(displayTag)}
                            >
                                ✕
                            </button>
                        </li>
                    );
                })}
            </ul>

            <form onSubmit={handleSubmit(addTag)} className="tag-form">
                <input
                    {...register("tagName")}
                    type="text"
                    className="tag-input"
                    placeholder="Wpisz tag i naciśnij Enter"
                    autoComplete="off"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault(); // Zapobiega wysłaniu formularza domyślnie
                            handleSubmit(addTag)();
                        }
                    }}
                />
                <button type="submit" className="add-tag-btn">+ Add tag</button>
            </form>
        </div>
    );
}
