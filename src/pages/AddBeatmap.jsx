
import AddBeatmapModal from '../components/AddBeatmapModal';
import useStore from '../store';

export default function AddBeatmap() {
    const beatmaps = useStore(state => state.beatmaps);
    const removeBeatmap = useStore(state => state.removeBeatmap);
    const handleRemoveBeatmap = (beatmapId) => {
        removeBeatmap(beatmapId);
    };

    console.log('beatmaps', beatmaps);

    return (
        <div className='AddBeatmap-container'>
            <AddBeatmapModal onClose={() => { }} onRemoveBeatmap={handleRemoveBeatmap} />
        </div>
    );
}
