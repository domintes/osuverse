import React from 'react';

const BlackHoleParticles = React.lazy(() => import('./BlackHoleParticles'));

export default function OsuverseBackground() {
  return (
    <React.Suspense fallback={null}>
      <BlackHoleParticles />
    </React.Suspense>
  );
}
