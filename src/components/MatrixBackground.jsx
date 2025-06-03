"use client";
import React, { useEffect, useRef } from 'react';
import '../components/MatrixBackground.scss';

const MatrixBackground = () => {
  const containerRef = useRef(null);
  const columnsRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789!?#+*';
    const container = containerRef.current;
    const columnCount = Math.floor(window.innerWidth / 20);
    
    // Clear previous columns
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    columnsRef.current = [];
    
    // Create columns
    for (let i = 0; i < columnCount; i++) {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      column.style.left = `${i * 20 + Math.random() * 10}px`;
      
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 2;
      
      column.style.animationDuration = `${duration}s`;
      column.style.animationDelay = `${delay}s`;
      
      // Generate random characters
      const charCount = Math.floor(Math.random() * 15) + 5;
      for (let j = 0; j < charCount; j++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        column.innerHTML += char + '<br>';
      }
      
      container.appendChild(column);
      columnsRef.current.push(column);
    }
    
    // Handle resize
    const handleResize = () => {
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        
        const newColumnCount = Math.floor(window.innerWidth / 20);
        
        for (let i = 0; i < newColumnCount; i++) {
          const column = document.createElement('div');
          column.className = 'matrix-column';
          column.style.left = `${i * 20 + Math.random() * 10}px`;
          
          const duration = Math.random() * 3 + 2;
          const delay = Math.random() * 2;
          
          column.style.animationDuration = `${duration}s`;
          column.style.animationDelay = `${delay}s`;
          
          const charCount = Math.floor(Math.random() * 15) + 5;
          for (let j = 0; j < charCount; j++) {
            const char = characters.charAt(Math.floor(Math.random() * characters.length));
            column.innerHTML += char + '<br>';
          }
          
          container.appendChild(column);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <div className="matrix-background" ref={containerRef}></div>;
};

export default MatrixBackground;
