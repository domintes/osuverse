import BeatmapSearch from '../components/BeatmapSearch';
import AddBeatmapModal from '../components/AddBeatmapModal';
import RemoveBeatmapButton from '../components/RemoveBeatmapButton';
import useStore from '../store';

export default function AddBeatmap() {
    const beatmaps = useStore(state => state.beatmaps);
    const removeBeatmap = useStore(state => state.removeBeatmap);

    const handleRemoveBeatmap = (beatmapId) => {
        removeBeatmap(beatmapId);
    };

    return (
        <div className='AddBeatmap-container'>
            <BeatmapSearch />
            <AddBeatmapModal onClose={() => { }} onRemoveBeatmap={handleRemoveBeatmap} />
            <div className='Beatmap-list'>
                {beatmaps.map((beatmap) => (
                    <div key={beatmap.id} className='Beatmap-item'>
                        <span>{beatmap.title}</span>
                        <RemoveBeatmapButton beatmapId={beatmap.id} />
                    </div>
                ))}
            </div>
        </div>
    );
}
