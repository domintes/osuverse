'use client';

import MainOsuverseDiv from '@/components/MainOsuverseDiv';

export default function About() {
  return (
    <MainOsuverseDiv className="about-container">
  <h1 style={{ fontSize: 32, color: 'var(--accent)', textShadow: '0 0 16px color-mix(in oklab, var(--bg1) 60%, transparent)' }}>About Us</h1>
  <p style={{ color: 'color-mix(in oklab, var(--accent) 25%, white)', fontSize: 18, marginTop: 16 }}>Welcome to the About page of Osuverse!</p>
    </MainOsuverseDiv>
  );
}