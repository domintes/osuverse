'use client';

import { useState } from 'react';
import UserCollectionsPanel from '@/components/UserCollectionsPanel';
import MainOsuverseDiv from '@/components/MainOsuverseDiv';
import TagsSection from '@/components/TagSections.jsx/TagSections';
import { Edit, Tag, Database, Zap } from 'lucide-react';
import './collections.scss';
import { useAtom } from "jotai";
import { collectionsAtom } from "@/store/collectionAtom";
import { loadTestCollectionsData } from '@/utils/testCollectionsData';

export default function Collections() {
  const [editMode, setEditMode] = useState(false);
  const [collections, setCollections] = useAtom(collectionsAtom);
  const [disableTransitions, setDisableTransitions] = useState(false);

  // Funkcja do wczytania danych testowych
  const handleLoadTestData = () => {
    loadTestCollectionsData(setCollections);
  };

  return (
    <MainOsuverseDiv className={`collections-container ${disableTransitions ? 'disable-transitions' : ''}`}>
      <div className="collections-header">
        <h1 style={{ fontSize: 32, color: '#ea81fb', textShadow: '0 0 16px #2f0f3a' }}>Collections</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Przełącznik dla animacji */}
          <div className="transition-toggle">
            <span>Animacje</span>
            <input 
              type="checkbox" 
              checked={disableTransitions} 
              onChange={() => setDisableTransitions(!disableTransitions)} 
            />
            <Zap size={16} color={disableTransitions ? '#ea81fb' : '#777777'} />
          </div>
          
          {/* Przycisk do wczytania danych testowych */}
          <button
            onClick={handleLoadTestData}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'rgba(100, 200, 255, 0.2)',
              border: '1px solid #64c8ff',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <Database size={16} /> Load Test Data
          </button>
          
          <button 
            className={`edit-mode-toggle ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode(!editMode)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: editMode ? 'rgba(234, 129, 251, 0.4)' : 'rgba(234, 129, 251, 0.2)',
              border: '1px solid #ea81fb',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {editMode ? (
              <>
                <Tag size={16} /> Display Mode
              </>
            ) : (
              <>
                <Edit size={16} /> Edit Mode
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Komponent sekcji tagów - wyświetlany tylko w trybie wyświetlania */}
      {!editMode && <TagsSection />}
      
      <UserCollectionsPanel editMode={editMode} />
    </MainOsuverseDiv>
  );
}