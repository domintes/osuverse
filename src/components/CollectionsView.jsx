import useStore from '../store';
import CustomTags from './CustomTags/CustomTags';
import './collectionsView.scss';

export default function CollectionsView() {
    const { collections, removeBeatmapFromCollection, removeCollection } = useStore();

    return (
        <div className="collections-view">
            <CustomTags items={Object.values(collections).flat()} />
            
            {Object.entries(collections).map(([collectionName, beatmaps]) => (
                <div key={collectionName} className="collection-section">
                    <div className="collection-header">
                        <h2 className="collection-title">{collectionName}</h2>
                        <button 
                            className="remove-collection-button"
                            onClick={() => removeCollection(collectionName)}
                        >
                            ×
                        </button>
                    </div>
                    <div className="beatmaps-list">
                        {beatmaps.map((beatmap) => (
                            <div 
                                key={`${collectionName}-${beatmap.id}`} 
                                className="beatmap-entry" 
                                style={{ backgroundImage: `url(${beatmap.beatmapset.covers.cover})` }}
                            >
                                <div className="beatmap-data">
                                    <span className="beatmap-name">
                                        {beatmap.beatmapset.artist} - {beatmap.title} 
                                        [<a href={`https://osu.ppy.sh/users/${beatmap.beatmapset.user_id}`} target="_blank" rel="noopener noreferrer">
                                            {beatmap.beatmapset.creator}
                                        </a>]
                                    </span>
                                    <span className="beatmap-difficulty">
                                        <a href={`https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}#osu/${beatmap.id}`} target="_blank" rel="noopener noreferrer">
                                            {beatmap.version} ({beatmap.difficulty_rating.toFixed(2)} ★)
                                        </a>
                                    </span>
                                    <button 
                                        className="remove-button"
                                        onClick={() => removeBeatmapFromCollection(collectionName, beatmap.id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
