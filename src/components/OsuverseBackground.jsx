'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamiczne importowanie komponentów tylko po stronie klienta
const BlackHoleParticles = dynamic(() => import('./BlackHoleParticles'), {
  ssr: false,
  loading: () => null
});

const MatrixBackground = dynamic(() => import('./MatrixBackground'), {
  ssr: false,
  loading: () => null
});

export default function OsuverseBackground() {
  return (
    <>
      <BlackHoleParticles />
      <MatrixBackground />
    </>
  );
}
