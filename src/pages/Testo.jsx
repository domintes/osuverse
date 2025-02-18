import './beatmapSearch.scss';
import BeatmapSearch from '../components/BeatmapSearch';
import UserSearch from '../components/UserSearch';

export default function SearchPage() {
    return (
        <div className="osuverse-search-container">
            <BeatmapSearch />
            <UserSearch />
        </div>
    );
}
