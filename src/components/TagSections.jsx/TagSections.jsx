import React from 'react'
import { useAtom } from 'jotai'
import { collectionAtom, selectedTagsAtom } from '../state/atoms'
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
        groups.Stars[range] = (groups.Stars[range] || 0) + 1

        // User Tags
        const userTags = map.userTags || []
        userTags.forEach(tag => {
            groups['User Tags'][tag] = (groups['User Tags'][tag] || 0) + 1
        })
    })

    return groups
}

// Czy tag pasuje do beatmapy
const doesTagMatch = (map, selectedTags) => {
    return selectedTags.every(tag => {
        const lower = tag.toLowerCase()
        return (
            map.artist?.toLowerCase() === lower ||
            map.mapper?.toLowerCase() === lower ||
            (map.userTags || []).map(t => t.toLowerCase()).includes(lower) ||
            (
                lower.includes('star') &&
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
    const [collection] = useAtom(collectionAtom)
    const [selectedTags, setSelectedTags] = useAtom(selectedTagsAtom)

    const filtered = selectedTags.length
        ? collection.filter(map => doesTagMatch(map, selectedTags))
        : collection

    const tagGroups = getTagGroups(filtered)

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    return (
        <div>
            {Object.entries(tagGroups).map(([groupName, tags]) => (
                <div key={groupName}>
                    <h3 style={{ fontFamily: 'Orbitron', fontSize: '17px', marginBottom: '8px', marginTop: '24px' }}>{groupName}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {Object.entries(tags).map(([tag, count]) => {
                            const isActive = selectedTags.includes(tag)
                            return (
                                <button
                                    key={tag}
                                    className={`tag-button ${isActive ? 'tag-button-active' : ''}`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag} ({count})
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default TagsSection
