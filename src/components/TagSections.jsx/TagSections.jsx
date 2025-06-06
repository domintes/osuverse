import React from 'react'
import { useAtom } from 'jotai'
import { collectionsAtom } from '../../store/collectionAtom'
import { selectedTagsAtom } from '../../store/selectedTagsAtom'
import './tagSections.scss';


const getTagGroups = (beatmaps) => {
    const groups = {
        Artists: {},
        Mappers: {},
        Stars: {},
        'User Tags': {}
    }

    beatmaps.forEach(map => {
        // Artist
        const artist = map.artist || 'Unknown'
        groups.Artists[artist] = (groups.Artists[artist] || 0) + 1

        // Mapper
        const mapper = map.mapper || 'Unknown'
        groups.Mappers[mapper] = (groups.Mappers[mapper] || 0) + 1

        // Star Range
        const stars = map.starRating || 0
        let range = ''
        if (stars < 5.71) range = '4.99-5.70*'
        else if (stars < 6.60) range = '5.71-6.59*'
        else range = '6.60-7.69*'
        groups.Stars[range] = (groups.Stars[range] || 0) + 1        // User Tags
        const userTags = map.userTags || []
        if (Array.isArray(userTags)) {
            userTags.forEach(tag => {
                // Sprawdź czy to string czy obiekt z tagiem
                const tagName = typeof tag === 'string' ? tag : (tag && tag.tag ? tag.tag : null);
                if (tagName) {
                    groups['User Tags'][tagName] = (groups['User Tags'][tagName] || 0) + 1;
                }
            });
        }
    })

    return groups
}

// Funkcja pobierająca wszystkie beatmapy z kolekcji i podkolekcji
const getAllBeatmaps = (collections) => {
    const beatmaps = [];
    const beatmapsData = collections.beatmaps || {};
    
    // Pobierz wszystkie beatmapy z obiektu beatmaps
    Object.values(beatmapsData).forEach(beatmap => {
        beatmaps.push({
            id: beatmap.id,
            artist: beatmap.artist_name || 'Unknown',
            mapper: beatmap.creator_name || 'Unknown',
            starRating: beatmap.difficulty_rating || 0,
            // Zachowaj oryginalne tagi (mogą być w formie obiektów {tag, tag_value} lub stringów)
            userTags: beatmap.tags || []
        });
    });
    
    return beatmaps;
}

// Czy tag pasuje do beatmapy
const doesTagMatch = (map, selectedTags) => {
    return selectedTags.every(tag => {
        const lower = tag.toLowerCase()
        
        // Bezpieczne przetwarzanie tagów użytkownika
        const userTags = [];
        if (Array.isArray(map.userTags)) {
            map.userTags.forEach(t => {
                if (typeof t === 'string') {
                    userTags.push(t.toLowerCase());
                } else if (t && typeof t === 'object' && t.tag) {
                    userTags.push(t.tag.toLowerCase());
                }
            });
        }
            
        return (
            map.artist?.toLowerCase() === lower ||
            map.mapper?.toLowerCase() === lower ||
            userTags.includes(lower) ||
            (
                lower.includes('*') &&
                (
                    (lower === '4.99-5.70*' && map.starRating < 5.71) ||
                    (lower === '5.71-6.59*' && map.starRating >= 5.71 && map.starRating < 6.6) ||
                    (lower === '6.60-7.69*' && map.starRating >= 6.6)
                )
            )
        )
    })
}

const TagsSection = () => {
    const [collections] = useAtom(collectionsAtom)
    const [selectedTags, setSelectedTags] = useAtom(selectedTagsAtom)
    // Add state for toggling tag group visibility
    const [visibleGroups, setVisibleGroups] = React.useState({
        'User Tags': true,
        Artists: true,
        Mappers: true,
        Stars: true
    })    // Pobierz wszystkie beatmapy ze wszystkich kolekcji
    const allBeatmaps = getAllBeatmaps(collections)
    
    const filtered = selectedTags.length
        ? allBeatmaps.filter(map => doesTagMatch(map, selectedTags))
        : allBeatmaps

    const tagGroups = getTagGroups(filtered)

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    // Toggle visibility of tag group
    const toggleGroup = (group) => {
        setVisibleGroups(prev => ({ ...prev, [group]: !prev[group] }))
    }

    return (        <div className="tag-sections-container">
            <h2 className="tag-sections-title">Collection Tags Filter</h2>
            <div className="tag-groups-toggle">
                {Object.keys(tagGroups).map(groupName => (
                    <label key={groupName} className="tag-group-toggle">
                        <input
                            type="checkbox"
                            checked={visibleGroups[groupName]}
                            onChange={() => toggleGroup(groupName)}
                        />
                        {groupName}
                    </label>
                ))}
            </div>
            {Object.entries(tagGroups).map(([groupName, tags]) => (
                visibleGroups[groupName] && (
                    <div key={groupName} className="tag-group">
                        <h3 className="tag-group-title">{groupName}</h3>
                        <div className="tags-list">
                            {Object.entries(tags).map(([tag, count]) => {
                                const isActive = selectedTags.includes(tag)
                                return (
                                    <button
                                        key={tag}
                                        className={`tag-button ${isActive ? 'tag-button-active' : ''}`}
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {groupName === 'User Tags' ? `#${tag}` : tag} ({count})
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            ))}
        </div>
    )
}

export default TagsSection
