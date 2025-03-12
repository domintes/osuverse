import { useState } from 'react';
import {
    BeatmapSetContainer,
    BeatmapSetMain,
    CoverContainer,
    StatusBadge,
    BeatmapInfo,
    BeatmapHeader,
    Title,
    Artist,
    Mapper,
    BeatmapStats,
    Stat,
    StatLabel,
    StatValue,
    BeatmapActions,
    ActionButton,
    DifficultiesList,
    DifficultyItem,
    DifficultyInfo,
    DifficultyName,
    DifficultyRating,
    DifficultyStats,
    DifficultyActions
} from './BeatmapSet.styled';

export default function BeatmapSet({ beatmapset, onAddToCollection, onRemoveFromCollection, isInCollection }) {
    const [showDifficulties, setShowDifficulties] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Sortowanie difficulty od najłatwiejszego do najtrudniejszego
    const sortedDifficulties = [...beatmapset.beatmaps].sort((a, b) => a.difficulty_rating - b.difficulty_rating);

    // Obliczanie zakresu trudności dla beatmapsetu
    const difficultyRange = {
        min: Math.min(...beatmapset.beatmaps.map(b => b.difficulty_rating)),
        max: Math.max(...beatmapset.beatmaps.map(b => b.difficulty_rating))
    };

    // Funkcja pomocnicza do formatowania czasu
    const formatLength = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Funkcja do generowania klasy statusu
    const getStatusClass = (status) => {
        switch (status) {
            case 'ranked': return 'ranked';
            case 'loved': return 'loved';
            case 'qualified': return 'qualified';
            case 'pending': return 'pending';
            default: return 'unranked';
        }
    };

    // Funkcja do generowania ikony statusu
    const getStatusIcon = (status) => {
        switch (status) {
            case 'ranked': return '👑';
            case 'loved': return '❤️';
            case 'qualified': return '✅';
            case 'pending': return '⏳';
            default: return '📝';
        }
    };

    return (
        <BeatmapSetContainer 
            className={isHovered ? 'hovered' : ''}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <BeatmapSetMain>
                <CoverContainer>
                    <img src={beatmapset.covers.card} alt={beatmapset.title} loading="lazy" />
                    <StatusBadge className={getStatusClass(beatmapset.status)}>
                        {getStatusIcon(beatmapset.status)}
                    </StatusBadge>
                </CoverContainer>
                
                <BeatmapInfo>
                    <BeatmapHeader>
                        <Title>
                            {beatmapset.title}
                            {beatmapset.artist && (
                                <Artist> by {beatmapset.artist}</Artist>
                            )}
                        </Title>
                        <Mapper>
                            mapped by <a href={`https://osu.ppy.sh/users/${beatmapset.user_id}`} target="_blank" rel="noopener noreferrer">
                                {beatmapset.creator}
                            </a>
                        </Mapper>
                    </BeatmapHeader>

                    <BeatmapStats>
                        <Stat>
                            <StatLabel>Difficulty:</StatLabel>
                            <StatValue>
                                {difficultyRange.min === difficultyRange.max
                                    ? `${difficultyRange.min}★`
                                    : `${difficultyRange.min}★ - ${difficultyRange.max}★`}
                            </StatValue>
                        </Stat>
                        <Stat>
                            <StatLabel>Length:</StatLabel>
                            <StatValue>{formatLength(beatmapset.beatmaps[0].total_length)}</StatValue>
                        </Stat>
                        <Stat>
                            <StatLabel>BPM:</StatLabel>
                            <StatValue>{beatmapset.bpm}</StatValue>
                        </Stat>
                    </BeatmapStats>
                </BeatmapInfo>

                <BeatmapActions>
                    {isInCollection ? (
                        <ActionButton 
                            className="remove" 
                            onClick={() => onRemoveFromCollection(beatmapset.id)}
                            title="Remove from collection"
                        >
                            ✕
                        </ActionButton>
                    ) : (
                        <ActionButton 
                            className="add" 
                            onClick={() => onAddToCollection(beatmapset.id)}
                            title="Add to collection"
                        >
                            +
                        </ActionButton>
                    )}
                    <ActionButton 
                        className={`toggle-difficulties ${showDifficulties ? 'active' : ''}`}
                        onClick={() => setShowDifficulties(!showDifficulties)}
                        title="Show difficulties"
                    >
                        ▼
                    </ActionButton>
                </BeatmapActions>
            </BeatmapSetMain>

            {showDifficulties && (
                <DifficultiesList>
                    {sortedDifficulties.map((diff) => (
                        <DifficultyItem key={diff.id}>
                            <DifficultyInfo>
                                <DifficultyName>{diff.version}</DifficultyName>
                                <DifficultyRating>{diff.difficulty_rating}★</DifficultyRating>
                            </DifficultyInfo>
                            <DifficultyStats>
                                <Stat>
                                    <StatLabel>CS:</StatLabel>
                                    <StatValue>{diff.cs}</StatValue>
                                </Stat>
                                <Stat>
                                    <StatLabel>AR:</StatLabel>
                                    <StatValue>{diff.ar}</StatValue>
                                </Stat>
                                <Stat>
                                    <StatLabel>OD:</StatLabel>
                                    <StatValue>{diff.accuracy}</StatValue>
                                </Stat>
                                <Stat>
                                    <StatLabel>HP:</StatLabel>
                                    <StatValue>{diff.drain}</StatValue>
                                </Stat>
                            </DifficultyStats>
                            <DifficultyActions>
                                {isInCollection ? (
                                    <ActionButton 
                                        className="remove small" 
                                        onClick={() => onRemoveFromCollection(beatmapset.id, diff.id)}
                                        title="Remove difficulty"
                                    >
                                        ✕
                                    </ActionButton>
                                ) : (
                                    <ActionButton 
                                        className="add small" 
                                        onClick={() => onAddToCollection(beatmapset.id, diff.id)}
                                        title="Add difficulty"
                                    >
                                        +
                                    </ActionButton>
                                )}
                            </DifficultyActions>
                        </DifficultyItem>
                    ))}
                </DifficultiesList>
            )}
        </BeatmapSetContainer>
    );
}
