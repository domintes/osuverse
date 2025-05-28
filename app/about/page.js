'use client';

import OsuverseDiv from '@/components/OsuverseDiv';

export default function About() {
  return (
    <OsuverseDiv className="about-container">
      <h1 style={{ fontSize: 32, color: '#7ee0ff', textShadow: '0 0 16px #1a2a4d' }}>About Us</h1>
      <p style={{ color: '#c3e6ff', fontSize: 18, marginTop: 16 }}>Welcome to the About page of Osuverse!</p>
    </OsuverseDiv>
  );
}