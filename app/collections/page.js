'use client';

import UserCollectionsPanel from '@/components/UserCollectionsPanel';
import MainOsuverseDiv from '@/components/MainOsuverseDiv';

export default function Collections() {
  return (
    <MainOsuverseDiv className="collections-container">
      <h1 style={{ fontSize: 32, color: '#ea81fb', textShadow: '0 0 16px #2f0f3a' }}>Collections</h1>
      <UserCollectionsPanel />
    </MainOsuverseDiv>
  );
}