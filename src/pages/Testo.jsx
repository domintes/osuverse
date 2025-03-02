import './beatmapSearch.scss';
import UserSearch from '../components/UserSearch';
import { useState } from 'react';
import AddBeatmapModal from '../components/AddBeatmapModal';


export default function SearchPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="osuverse-search-container">
            <UserSearch />
            {isModalOpen && <AddBeatmapModal onClose={handleCloseModal} />}
        </div>
    );
}
