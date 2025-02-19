import './beatmapSearch.scss';
import BeatmapSearch from '../components/BeatmapSearch';
import UserSearch from '../components/UserSearch';
import { useState } from 'react';
import AddBeatmapModal from '../components/AddBeatmapModal';

export default function SearchPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="osuverse-search-container">
            <button onClick={handleOpenModal}>Dodaj Beatmapę</button>
            <BeatmapSearch />
            <UserSearch />
            {isModalOpen && <AddBeatmapModal onClose={handleCloseModal} />}
        </div>
    );
}
