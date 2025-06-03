import React from 'react';
import './MainOsuverseDiv.scss';

export default function MainOsuverseDiv({ children, style, className = '' }) {
  return (
    <div className={`main-osuverse-div ${className} grid-pattern`} style={style}>
      {children}
    </div>
  );
}
