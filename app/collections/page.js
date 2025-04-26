'use client';

import UserCollectionsPanel from '@/components/UserCollectionsPanel';

export default function Collections() {
  return (
    <div className="collections-container">
      <h1>Collections</h1>
      <UserCollectionsPanel />
    </div>
  );
}