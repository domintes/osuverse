import { useState, useMemo } from 'react';
import useBeatmapStore from '../../stores/beatmapStore';
import TagInput from '../TagInput/TagInput';
import { styled } from '@linaria/react';

// Design constants
const COLORS = {
    void: '#0a0a0f',
    border: '#2a2a3a',
    text: '#ffffff',
    textSecondary: '#9999aa',
    primary: '#6666ff',
    secondary: '#4444cc',
    success: '#44cc44',
    danger: '#cc4444',
};

const SPACING = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
};

const FONTS = {
    heading: "'Exo 2', sans-serif",
    glitch: "'Share Tech Mono', monospace",
};

const CollectionDetailsContainer = styled.div`
    height: 100%;
    padding: ${SPACING.lg};
    background: linear-gradient(135deg, ${COLORS.void} 0%, #1a1a2a 100%);
    border: 2px solid ${COLORS.border};
    display: flex;
    flex-direction: column;
    gap: ${SPACING.lg};
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(10, 10, 15, 0.5);
    }

    &::-webkit-scrollbar-thumb {
        background: ${COLORS.secondary};
        border-radius: 4px;
    }
`;

const DetailsHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${SPACING.md};
    padding-bottom: ${SPACING.lg};
    border-bottom: 2px solid rgba(42, 42, 58, 0.3);
`;

const Title = styled.h2`
    font-family: ${FONTS.heading};
    color: ${COLORS.text};
    font-size: 2rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${SPACING.sm};

    &:hover .edit-btn {
        opacity: 1;
    }
`;

const EditButton = styled.button`
    opacity: 0;
    color: ${COLORS.textSecondary};
    font-size: 1.25rem;
    transition: all 0.2s ease;
    background: none;
    border: none;
    cursor: pointer;
    padding: ${SPACING.xs};

    &:hover {
        color: ${COLORS.primary};
        transform: translateY(-1px);
    }
`;

const NameEditContainer = styled.div`
    display: flex;
    gap: ${SPACING.sm};
    align-items: center;
`;

const NameInput = styled.input`
    flex: 1;
    background: rgba(10, 10, 15, 0.3);
    border: 2px solid ${COLORS.border};
    padding: ${SPACING.sm};
    color: ${COLORS.text};
    font-family: ${FONTS.heading};
    font-size: 2rem;

    &:focus {
        border-color: ${COLORS.primary};
        outline: none;
    }
`;

const EditActions = styled.div`
    display: flex;
    gap: ${SPACING.xs};
`;

const ActionButton = styled.button`
    padding: ${SPACING.sm};
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    color: ${props => props.$type === 'confirm' ? COLORS.success : COLORS.danger};

    &:hover {
        background: ${props => props.$type === 'confirm' 
            ? `rgba(68, 204, 68, 0.1)` 
            : `rgba(204, 68, 68, 0.1)`};
        transform: translateY(-1px);
    }
`;

const HeaderStats = styled.div`
    display: flex;
    gap: ${SPACING.xl};
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${SPACING.xs};
`;

const StatValue = styled.span`
    font-family: ${FONTS.glitch};
    color: ${COLORS.primary};
    font-size: 1.5rem;
`;

const StatLabel = styled.span`
    color: ${COLORS.textSecondary};
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const DetailsContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${SPACING.xl};
`;

const SectionTitle = styled.h3`
    font-family: ${FONTS.heading};
    color: ${COLORS.text};
    font-size: 1.25rem;
    margin: 0 0 ${SPACING.md};
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${SPACING.md};
`;

const GridStatItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${SPACING.xs};
    padding: ${SPACING.md};
    background: rgba(10, 10, 15, 0.3);
    border-radius: 4px;
    border: 1px solid rgba(42, 42, 58, 0.5);
`;

const TagsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${SPACING.md};
`;

const TagSuggestions = styled.div`
    margin-top: ${SPACING.md};
`;

const SuggestionsTitle = styled.h4`
    font-family: ${FONTS.heading};
    color: ${COLORS.textSecondary};
    font-size: 1rem;
    margin: 0 0 ${SPACING.sm};
`;

const SuggestionsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${SPACING.sm};
`;

const MergeTagButton = styled.button`
    padding: ${SPACING.xs} ${SPACING.sm};
    background: rgba(68, 68, 204, 0.1);
    border: 1px solid rgba(42, 42, 58, 0.5);
    border-radius: 4px;
    color: ${COLORS.textSecondary};
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(68, 68, 204, 0.2);
        color: ${COLORS.text};
        transform: translateY(-2px);
    }
`;

export default function CollectionDetails({ collection }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(collection?.name || '');
    const { updateCollection, mergeTags } = useBeatmapStore();

    const stats = useMemo(() => {
        if (!collection) return null;

        const beatmaps = Array.from(collection.beatmaps.values());
        const allTags = new Set();
        const mappers = new Set();
        let totalLength = 0;
        let minStars = Infinity;
        let maxStars = -Infinity;

        beatmaps.forEach(beatmap => {
            beatmap.tags.forEach(tag => allTags.add(tag));
            mappers.add(beatmap.creator);
            totalLength += beatmap.total_length;
            const stars = beatmap.difficulty_rating;
            minStars = Math.min(minStars, stars);
            maxStars = Math.max(maxStars, stars);
        });

        return {
            beatmapCount: beatmaps.length,
            tagCount: allTags.size,
            mapperCount: mappers.size,
            totalLength,
            minStars: minStars === Infinity ? 0 : minStars,
            maxStars: maxStars === -Infinity ? 0 : maxStars,
            tags: Array.from(allTags)
        };
    }, [collection]);

    const formatLength = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? 
            `${hours}h ${minutes}m` : 
            `${minutes}m`;
    };

    const handleNameEdit = () => {
        if (!isEditing || !editedName.trim()) return;
        updateCollection(collection.id, { name: editedName.trim() });
        setIsEditing(false);
    };

    const handleTagsChange = (tags) => {
        if (!collection) return;
        collection.beatmaps.forEach(beatmap => {
            beatmap.tags = new Set(tags);
        });
        updateCollection(collection.id, { updatedAt: Date.now() });
    };

    if (!collection || !stats) return null;

    return (
        <CollectionDetailsContainer>
            <DetailsHeader>
                {isEditing ? (
                    <NameEditContainer>
                        <NameInput
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleNameEdit();
                                if (e.key === 'Escape') {
                                    setIsEditing(false);
                                    setEditedName(collection.name);
                                }
                            }}
                            autoFocus
                        />
                        <EditActions>
                            <ActionButton $type="confirm" onClick={handleNameEdit}>✓</ActionButton>
                            <ActionButton $type="cancel" onClick={() => {
                                setIsEditing(false);
                                setEditedName(collection.name);
                            }}>✕</ActionButton>
                        </EditActions>
                    </NameEditContainer>
                ) : (
                    <Title>
                        {collection.name}
                        <EditButton 
                            className="edit-btn"
                            onClick={() => setIsEditing(true)}
                            title="Edit collection name"
                        >
                            ✎
                        </EditButton>
                    </Title>
                )}
                <HeaderStats>
                    <StatItem>
                        <StatValue>{stats.beatmapCount}</StatValue>
                        <StatLabel>Beatmaps</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatValue>{stats.tagCount}</StatValue>
                        <StatLabel>Tags</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatValue>{stats.mapperCount}</StatValue>
                        <StatLabel>Mappers</StatLabel>
                    </StatItem>
                </HeaderStats>
            </DetailsHeader>

            <DetailsContent>
                <div>
                    <SectionTitle>Collection Stats</SectionTitle>
                    <StatsGrid>
                        <GridStatItem>
                            <StatLabel>Total Length</StatLabel>
                            <StatValue>{formatLength(stats.totalLength)}</StatValue>
                        </GridStatItem>
                        <GridStatItem>
                            <StatLabel>Difficulty Range</StatLabel>
                            <StatValue>
                                {stats.minStars.toFixed(1)}★ - {stats.maxStars.toFixed(1)}★
                            </StatValue>
                        </GridStatItem>
                        <GridStatItem>
                            <StatLabel>Created</StatLabel>
                            <StatValue>
                                {new Date(collection.createdAt).toLocaleDateString()}
                            </StatValue>
                        </GridStatItem>
                        <GridStatItem>
                            <StatLabel>Last Updated</StatLabel>
                            <StatValue>
                                {new Date(collection.updatedAt).toLocaleDateString()}
                            </StatValue>
                        </GridStatItem>
                    </StatsGrid>
                </div>

                <TagsSection>
                    <SectionTitle>Collection Tags</SectionTitle>
                    <TagInput
                        initialTags={stats.tags}
                        onTagsChange={handleTagsChange}
                        placeholder="Add tags to collection..."
                    />
                    <TagSuggestions>
                        <SuggestionsTitle>Similar Tags</SuggestionsTitle>
                        <SuggestionsList>
                            {stats.tags.map(tag => (
                                <MergeTagButton
                                    key={tag}
                                    onClick={() => {
                                        const similarTags = stats.tags.filter(t =>
                                            t !== tag && (
                                                t.includes(tag) ||
                                                tag.includes(t) ||
                                                t.split('-').some(part => tag.includes(part))
                                            )
                                        );
                                        if (similarTags.length > 0) {
                                            mergeTags(similarTags[0], tag);
                                        }
                                    }}
                                    title="Click to merge similar tags"
                                >
                                    {tag}
                                </MergeTagButton>
                            ))}
                        </SuggestionsList>
                    </TagSuggestions>
                </TagsSection>
            </DetailsContent>
        </CollectionDetailsContainer>
    );
}
