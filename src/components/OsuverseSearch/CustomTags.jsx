import { useEffect, useState, useCallback } from 'react';
import useStore from '../../store';

// Design constants matching our void/space theme
const COLORS = {
    void: '#0a0a0f',
    voidLight: '#131020',
    border: '#2a2a3a',
    text: '#ffffff',
    textSecondary: '#9999aa',
    success: '#72ff72',
    successDark: '#4bbd4b',
    disabled: '#222222'
};

const SPACING = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem'
};

const Container = styled.div`
    padding: ${SPACING.md};
    background: rgba(10, 10, 15, 0.3);
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    margin-bottom: ${SPACING.lg};
`;

const Title = styled.h2`
    font-family: 'Exo 2', sans-serif;
    color: ${COLORS.text};
    font-size: 1.5rem;
    margin: 0 0 ${SPACING.md};
`;

const TagsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${SPACING.sm};
    padding: ${SPACING.sm};
`;

const TagButton = styled.button`
    color: ${props => props.$active ? COLORS.success : COLORS.textSecondary};
    border-radius: 25px;
    padding: 8px 12px;
    font-size: 15px;
    font-weight: 500;
    font-family: 'Share Tech Mono', monospace;
    background-color: ${COLORS.voidLight};
    border: 1px solid ${props => props.$active ? COLORS.successDark : COLORS.border};
    outline: none;
    cursor: ${props => props.$disabled ? 'default' : 'pointer'};
    transition: all 0.2s ease;

    ${props => !props.$disabled && `
        &:hover {
            background-color: #363642;
            border-color: ${COLORS.success};
            color: ${COLORS.success};
            transform: translateY(-1px);
        }
    `}

    ${props => props.$disabled && `
        border-color: ${COLORS.disabled} !important;
        color: ${COLORS.disabled} !important;
        
        &:hover {
            color: ${COLORS.disabled} !important;
            border-color: ${COLORS.disabled} !important;
            background-color: ${COLORS.voidLight} !important;
            transform: none;
        }
    `}

    &:focus,
    &:focus-visible {
        outline: none;
    }
`;

export default function CustomTags({ items = [] }) {
    const [selectedTags, setSelectedTags] = useState([]);
    const [uniqueTags, setUniqueTags] = useState([]);
    const filterByTags = useStore(state => state.filterByTags);

    const getItemsWithTag = useCallback((tag) => {
        return items.filter(item =>
            item &&
            Array.isArray(item.tags) &&
            item.tags.includes(tag) &&
            selectedTags.every(selectedTag => item.tags.includes(selectedTag))
        ).length;
    }, [items, selectedTags]);

    useEffect(() => {
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
        <Container>
            <Title>Custom Tags</Title>
            <TagsList>
                {uniqueTags.map((tag, index) => {
                    const filteredCount = getItemsWithTag(tag);
                    const isActive = selectedTags.includes(tag);
                    const isDisabled = filteredCount === 0;

                    return (
                        <TagButton
                            key={index}
                            $active={isActive}
                            $disabled={isDisabled}
                            onClick={() => toggleTag(tag)}
                            disabled={isDisabled}
                        >
                            #{tag} ({filteredCount})
                        </TagButton>
                    );
                })}
            </TagsList>
        </Container>
    );
}