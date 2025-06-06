'use client';

import { useState } from 'react';
import UserCollectionsPanel from '@/components/UserCollectionsPanel';
import MainOsuverseDiv from '@/components/MainOsuverseDiv';
import { Edit, Tag } from 'lucide-react';
import './collections.scss';

export default function Collections() {
  const [editMode, setEditMode] = useState(false);

  return (
    <MainOsuverseDiv className="collections-container">
      <div className="collections-header">
        <h1 style={{ fontSize: 32, color: '#ea81fb', textShadow: '0 0 16px #2f0f3a' }}>Collections</h1>
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
      <UserCollectionsPanel editMode={editMode} />
    </MainOsuverseDiv>
  );
}