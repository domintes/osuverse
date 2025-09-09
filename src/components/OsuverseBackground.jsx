'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';

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
  const { simpleMode } = useApp();

  if (simpleMode) {
    return null; // No background effects in simple mode
  }

  return (
    <>
      <BlackHoleParticles />
      <MatrixBackground />
    </>
  );
}
