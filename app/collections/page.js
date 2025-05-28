'use client';

import UserCollectionsPanel from '@/components/UserCollectionsPanel';
import OsuverseDiv from '@/components/OsuverseDiv';

export default function Collections() {
  return (
    <OsuverseDiv className="collections-container">
      <h1 style={{ fontSize: 32, color: '#7ee0ff', textShadow: '0 0 16px #1a2a4d' }}>Collections</h1>
      <UserCollectionsPanel />
    </OsuverseDiv>
  );
}