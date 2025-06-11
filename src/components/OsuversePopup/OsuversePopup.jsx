import React from 'react';
import { useAtom } from 'jotai';
import { osuverseModalAtom } from '../../store/osuverseModalAtom';
import OsuverseModal from '../OsuverseModal/OsuverseModal';
import { HelpCircle } from 'lucide-react';
import './osuversePopup.scss';

// Popup component for displaying usage instructions
const OsuversePopup = ({ modalId = 'beatmapHelpPopup', buttonClassName = '' }) => {
  const [modals, setModals] = useAtom(osuverseModalAtom);

  const handleOpenPopup = () => {
    setModals(prev => ({
      ...prev,
      [modalId]: { ...prev[modalId], open: true }
    }));
  };

  return (
    <>
      <button 
        onClick={handleOpenPopup}
        className={`osuverse-popup-button ${buttonClassName}`}
        aria-label="Show usage instructions"
      >
        <HelpCircle size={24} />
      </button>
      
      <OsuverseModal modalId={modalId}>
        <div className="osuverse-popup-content">
          <h2 className="osuverse-popup-title">How to Use Beatmap Search</h2>
          
          <div className="osuverse-popup-section">
            <h3>Searching for Beatmaps</h3>
            <ul>
              <li>Use the search field to find beatmaps by title, artist, or mapper</li>
              <li>You can filter results using the status and mode dropdowns</li>
              <li>Adjust the layout and items per page to customize the view</li>
            </ul>
          </div>
          
          <div className="osuverse-popup-section">
            <h3>Using Search Results</h3>
            <ul>
              <li>Click on a beatmap or the arrow button to expand and see all difficulty levels</li>
              <li>Use the "Add All" button to add the entire beatmap set to your collection</li>
              <li>Click on individual "Add" buttons to add specific difficulty levels</li>
            </ul>
          </div>
          
          <div className="osuverse-popup-section">
            <h3>Tagging System</h3>
            <ul>
              <li>When adding a beatmap, you can assign tags for easy organization</li>
              <li>Use priority/value tags to categorize beatmaps by importance or characteristics</li>
              <li>Tags help you find specific beatmaps in your collection later</li>
            </ul>
          </div>
        </div>
      </OsuverseModal>
    </>
  );
};

export default OsuversePopup;
