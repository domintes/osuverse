import React from 'react';

const BlackHoleParticles = React.lazy(() => import('./BlackHoleParticles'));
const MatrixBackground = React.lazy(() => import('./MatrixBackground'));

export default function OsuverseBackground() {
  return (
    <>
      <React.Suspense fallback={null}>
        <BlackHoleParticles />
      </React.Suspense>
      <React.Suspense fallback={null}>
        <MatrixBackground />
      </React.Suspense>
    </>
  );
}
