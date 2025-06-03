'use client';

import MainOsuverseDiv from '@/components/MainOsuverseDiv';

export default function About() {
  return (
    <MainOsuverseDiv className="about-container">
      <h1 style={{ fontSize: 32, color: '#ea81fb', textShadow: '0 0 16px #2f0f3a' }}>About Us</h1>
      <p style={{ color: '#ffcae6', fontSize: 18, marginTop: 16 }}>Welcome to the About page of Osuverse!</p>
    </MainOsuverseDiv>
  );
}