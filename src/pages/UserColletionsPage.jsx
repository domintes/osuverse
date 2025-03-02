import CustomTags from '../components/CustomTags/CustomTags';

import { testData } from '../test_data/maps';
import useStore from '../store';

export default function UserColletionsPage() {
    const removeBeatmap = useStore(state => state.removeBeatmap);
    const handleRemoveMap = (beatmapId) => {
        removeBeatmap(beatmapId);
    };

    const beatmaps = useStore(state => state.beatmaps);
    return (
        
<div className='UserColletionsPage-container'>
            UserColletionsPage
            <CustomTags items={testData} />
            <div className="beatmap-collection">
                {beatmaps.map((beatmap, index) => (
                    <div key={index} className="beatmap-item" style={{ backgroundImage: `url(${beatmap.beatmapset.covers.cover})` }}>
                        <div className="beatmap-info">
                            <button onClick={() => handleRemoveMap(beatmap.id)}>Remove map</button>
                            <h3>{beatmap.beatmapset.artist} - {beatmap.title} [{beatmap.version}]</h3>
                            <p>Difficulty: {beatmap.difficulty_rating}★</p>
                            <p>Mapper: <a href={`https://osu.ppy.sh/users/${beatmap.beatmapset.creator_id}`} target="_blank" rel="noopener noreferrer">{beatmap.beatmapset.creator}</a></p>
                        </div>
                    </div>
                ))}
            </div>
</div>
    );
}
