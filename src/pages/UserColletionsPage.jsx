import CustomTags from '../components/CustomTags/CustomTags';
import useStore from '../store';

export default function UserColletionsPage() {
    const removeBeatmap = useStore(state => state.removeBeatmap);
    const beatmaps = useStore(state => state.beatmaps);
    const filteredBeatmaps = useStore(state => state.filteredBeatmaps);
    
    const handleRemoveMap = (beatmapId) => {
        removeBeatmap(beatmapId);
    };

    // Use filtered beatmaps if available, otherwise use all beatmaps
    const displayedBeatmaps = filteredBeatmaps.length > 0 ? filteredBeatmaps : beatmaps;

    return (
        <div className='UserColletionsPage-container'>
            <h1>Your Collection</h1>
            <CustomTags items={beatmaps} />
            <div className="beatmap-collection">
                {displayedBeatmaps.map((beatmap, index) => (
                    <div key={index} className="beatmap-item" style={{ backgroundImage: `url(${beatmap.beatmapset.covers.cover})` }}>
                        <div className="beatmap-info">
                            <button onClick={() => handleRemoveMap(beatmap.id)}>Remove map</button>
                            <h3>{beatmap.beatmapset.artist} - {beatmap.title} [{beatmap.version}]</h3>
                            <p>Difficulty: {beatmap.difficulty_rating}★</p>
                            <p>Mapper: <a href={`https://osu.ppy.sh/users/${beatmap.beatmapset.creator_id}`} target="_blank" rel="noopener noreferrer">{beatmap.beatmapset.creator}</a></p>
                            <div className="beatmap-tags">
                                {beatmap.tags.map((tag, i) => (
                                    <span key={i} className="tag">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
