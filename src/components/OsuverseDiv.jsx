import React from 'react';
import './OsuverseDiv.scss';

export default function OsuverseDiv({ children, style, className = '' }) {
  return (
    <div className={`osuverse-div ${className}`} style={style}>
      {children}
    </div>
  );
}
