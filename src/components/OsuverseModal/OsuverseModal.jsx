import React from 'react';
import { useAtom } from 'jotai';
import { osuverseModalAtom } from '../../store/osuverseModalAtom';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './osuverseModal.scss';

const OsuverseModal = ({ modalId, children }) => {
  const [modals, setModals] = useAtom(osuverseModalAtom);
  const isOpen = modals[modalId]?.open;

  const handleClose = () => {
    setModals(prev => ({
      ...prev,
      [modalId]: { ...prev[modalId], open: false }
    }));
  };

  return (
    <Dialog.Root open={!!isOpen} onOpenChange={open => !open && handleClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div 
                className="osuverse-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div 
                className="osuverse-modal-content"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <Dialog.Close asChild>
                  <button className="osuverse-modal-close" aria-label="Zamknij modal">
                    <X size={32} />
                  </button>
                </Dialog.Close>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default OsuverseModal;
