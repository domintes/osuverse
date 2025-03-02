import BeatmapSearch from '../components/BeatmapSearch';
import AddBeatmapModal from '../components/AddBeatmapModal';
import useStore from '../store';
import TagInput from "../components/TagInput/TagInput";
import { useState } from 'react';

export default function AddBeatmap() {
    const beatmaps = useStore(state => state.beatmaps);
    const removeBeatmap = useStore(state => state.removeBeatmap);
    const [userTags, setUserTags] = useState([]);
    const handleRemoveBeatmap = (beatmapId) => {
        removeBeatmap(beatmapId);
    };

    console.log('beatmaps', beatmaps);

    return (
        <div className='AddBeatmap-container'>
            <TagInput onTagsChange={setUserTags} />
            <p>Dodane tagi: {userTags.join(", ")}</p>
            <BeatmapSearch />
            <AddBeatmapModal onClose={() => { }} onRemoveBeatmap={handleRemoveBeatmap} />
        </div>
    );
}
