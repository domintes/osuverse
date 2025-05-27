import React from 'react';
import { useAtom } from 'jotai';
import { osuverseModalAtom } from '../../store/osuverseModalAtom';
import './osuverseModal.scss';

const OsuverseModal = ({ modalId, children }) => {
  const [modals, setModals] = useAtom(osuverseModalAtom);
  const isOpen = modals[modalId]?.open;

  if (!isOpen) return null;

  const handleClose = () => {
    setModals(prev => ({
      ...prev,
      [modalId]: { ...prev[modalId], open: false }
    }));
  };

  return (
    <div className="osuverse-modal-overlay">
      <div className="osuverse-modal-content">
        <button className="osuverse-modal-close" onClick={handleClose}>×</button>
        {children}
      </div>
    </div>
  );
};

export default OsuverseModal;
