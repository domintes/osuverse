import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

// Design constants
const COLORS = {
    void: '#0a0a0f',
    border: '#2a2a3a',
    text: '#ffffff',
    textSecondary: '#9999aa',
    primary: '#6666ff',
    secondary: '#4444cc',
    error: '#cc4444'
};

const SPACING = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem'
};

const FONTS = {
    base: "'Inter', sans-serif",
    glitch: "'Share Tech Mono', monospace"
};

const TRANSITIONS = {
    fast: '0.15s ease',
    normal: '0.2s ease'
};

const shakeAnimation = css`
    @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-2px, 0, 0); }
        40%, 60% { transform: translate3d(2px, 0, 0); }
    }
`;

const Container = styled.div`
    padding: ${SPACING.md};
    margin-bottom: ${SPACING.lg};
    background: rgba(10, 10, 15, 0.3);
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
`;

const TagList = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: ${SPACING.sm};
    margin-bottom: ${SPACING.md};
    min-height: 32px;
    padding: ${SPACING.sm};
    cursor: text;
`;

const Tag = styled.li`
    display: inline-flex;
    align-items: center;
    padding: ${SPACING.xs} ${SPACING.sm};
    background: ${COLORS.secondary};
    font-family: ${FONTS.glitch};
    font-size: 0.875rem;
    color: ${COLORS.text};
    border-radius: 4px;
    border: 1px solid rgba(42, 42, 58, 0.5);
    transition: all ${TRANSITIONS.normal};
    cursor: default;

    &:hover {
        background: #5555dd;
        transform: translateY(-1px);
    }

    &.tag-exists {
        animation: ${shakeAnimation} 0.5s cubic-bezier(.36,.07,.19,.97) both;
        background: rgba(204, 68, 68, 0.2);
        border-color: ${COLORS.error};
    }
`;

const TagText = styled.span`
    margin-right: ${SPACING.xs};
`;

const RemoveTagButton = styled.button`
    color: ${COLORS.textSecondary};
    font-size: 0.75rem;
    padding: 2px;
    border-radius: 50%;
    transition: all ${TRANSITIONS.fast};
    opacity: 0.6;
    background: none;
    border: none;
    cursor: pointer;

    ${Tag}:hover & {
        opacity: 1;
    }

    &:hover {
        color: ${COLORS.error};
        background: rgba(204, 68, 68, 0.1);
        opacity: 1;
    }
`;

const Form = styled.form`
    display: flex;
    gap: ${SPACING.sm};
`;

const Input = styled.input`
    flex: 1;
    background: rgba(10, 10, 15, 0.5);
    border: 1px solid ${COLORS.border};
    color: ${COLORS.text};
    padding: ${SPACING.sm} ${SPACING.md};
    border-radius: 6px;
    font-family: ${FONTS.glitch};
    transition: all ${TRANSITIONS.fast};

    &:focus {
        outline: none;
        border-color: ${COLORS.primary};
        box-shadow: 0 0 0 2px rgba(102, 102, 255, 0.2);
    }

    &::placeholder {
        color: ${COLORS.textSecondary};
        font-style: italic;
        opacity: 0.6;
    }
`;

const AddTagButton = styled.button`
    padding: ${SPACING.sm} ${SPACING.md};
    background: ${COLORS.primary};
    color: ${COLORS.text};
    font-family: ${FONTS.base};
    font-weight: 500;
    border-radius: 6px;
    border: 1px solid rgba(42, 42, 58, 0.5);
    transition: all ${TRANSITIONS.normal};
    white-space: nowrap;
    cursor: pointer;

    &:hover {
        background: #7777ff;
        transform: translateY(-1px);
    }

    &:active {
        background: #5555ff;
    }
`;

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
        } else if (e.key === "Backspace" && !tagInputValue && tags.length > 0) {
            const lastTag = tags[tags.length - 1];
            removeTag(lastTag);
        }
    };

    return (
        <Container>
            <TagList onClick={() => inputRef.current?.focus()}>
                {tags.map((tag, index) => (
                    <Tag key={index} data-tag={tag}>
                        <TagText>{tag}</TagText>
                        <RemoveTagButton 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(tag);
                            }}
                            title="Remove tag"
                        >
                            ✕
                        </RemoveTagButton>
                    </Tag>
                ))}
            </TagList>

            <Form onSubmit={handleSubmit(addTag)}>
                <Input
                    {...register("tagName")}
                    ref={(e) => {
                        inputRef.current = e;
                        register("tagName").ref(e);
                    }}
                    type="text"
                    placeholder={placeholder}
                    autoComplete="off"
                    onKeyDown={handleKeyDown}
                />
                <AddTagButton type="submit" title="Add tag">
                    + Add tag
                </AddTagButton>
            </Form>
        </Container>
    );
}
