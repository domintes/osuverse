import './beatmapSearch.scss';
import UserSearch from '../components/UserSearch';
import { useState } from 'react';
import AddBeatmapModal from '../components/AddBeatmapModal';
import BeatmapSearch from '../components/BeatmapSearch';
import TagInput from "../components/TagInput/TagInput";

export default function SearchPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userTags, setUserTags] = useState([]);
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="osuverse-search-container">
            <TagInput onTagsChange={setUserTags} />
            <p>Dodane tagi: {userTags.join(", ")}</p>
            <BeatmapSearch />
            <UserSearch />
            {isModalOpen && <AddBeatmapModal onClose={handleCloseModal} />}
        </div>
    );
}
