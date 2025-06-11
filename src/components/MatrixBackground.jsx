"use client";
import React, { useEffect, useRef, useState } from 'react';
import '../components/MatrixBackground.scss';

const MatrixBackground = () => {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  
  // Uruchom to tylko po stronie klienta
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789!?#+*';
    const container = containerRef.current;
    const columnCount = Math.floor(window.innerWidth / 20);
    
    // Clear previous columns
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Create columns
    const columns = [];
    for (let i = 0; i < columnCount; i++) {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      column.style.left = `${i * 20 + Math.random() * 10}px`;
      
      // Vary speed more significantly to create more dynamic effect
      const duration = Math.random() * 4 + 3; // 3-7 seconds
      const delay = Math.random() * 3; // 0-3 seconds delay
      
      column.style.animationDuration = `${duration}s`;
      column.style.animationDelay = `${delay}s`;
      
      // Generate random characters - more characters for longer columns
      const viewportHeight = window.innerHeight;
      // Calculate character count based on viewport height
      const charCount = Math.floor((viewportHeight / 20) * (0.5 + Math.random() * 0.5));
      
      for (let j = 0; j < charCount; j++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        column.innerHTML += char + '<br>';
      }
      
      container.appendChild(column);
      columns.push(column);
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
          const duration = Math.random() * 4 + 3; // 3-7 seconds
          const delay = Math.random() * 3; // 0-3 seconds delay
          
          column.style.animationDuration = `${duration}s`;
          column.style.animationDelay = `${delay}s`;
          
          // Generate random characters - more characters for longer columns
          const viewportHeight = window.innerHeight;
          // Calculate character count based on viewport height
          const charCount = Math.floor((viewportHeight / 20) * (0.5 + Math.random() * 0.5));
          
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
  }, [mounted]); // Dodałem mounted jako zależność
  
  return <div className="matrix-background" ref={containerRef} suppressHydrationWarning></div>;
};

export default MatrixBackground;
