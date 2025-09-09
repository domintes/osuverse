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
    const columnCount = Math.floor(window.innerWidth / 30); // Reduced density
    const maxColumns = 50; // Limit maximum columns
    const finalColumnCount = Math.min(columnCount, maxColumns);
    
    // Clear previous columns
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Create columns
    const columns = [];
    for (let i = 0; i < finalColumnCount; i++) {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      column.style.left = `${i * 30 + Math.random() * 15}px`; // Adjusted spacing
      
      // Vary speed more significantly to create more dynamic effect
      const duration = Math.random() * 6 + 5; // 5-11 seconds, slower
      const delay = Math.random() * 4; // 0-4 seconds delay
      
      column.style.animationDuration = `${duration}s`;
      column.style.animationDelay = `${delay}s`;
      
      // Generate random characters - fewer characters for better performance
      const viewportHeight = window.innerHeight;
      // Calculate character count based on viewport height, reduced
      const charCount = Math.floor((viewportHeight / 25) * (0.3 + Math.random() * 0.3)); // Reduced count
      
      for (let j = 0; j < charCount; j++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        column.innerHTML += char + '<br>';
      }
      
      container.appendChild(column);
      columns.push(column);
    }
    
    // Handle resize with throttling
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (container) {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
          
          const newColumnCount = Math.floor(window.innerWidth / 30);
          const newFinalCount = Math.min(newColumnCount, maxColumns);
          
          for (let i = 0; i < newFinalCount; i++) {
            const column = document.createElement('div');
            column.className = 'matrix-column';
            column.style.left = `${i * 30 + Math.random() * 15}px`;
            const duration = Math.random() * 6 + 5;
            const delay = Math.random() * 4;
            
            column.style.animationDuration = `${duration}s`;
            column.style.animationDelay = `${delay}s`;
            
            const viewportHeight = window.innerHeight;
            const charCount = Math.floor((viewportHeight / 25) * (0.3 + Math.random() * 0.3));
            
            for (let j = 0; j < charCount; j++) {
              const char = characters.charAt(Math.floor(Math.random() * characters.length));
              column.innerHTML += char + '<br>';
            }
            
            container.appendChild(column);
          }
        }
      }, 200); // Throttle resize events
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [mounted]); // Dodałem mounted jako zależność
  
  return <div className="matrix-background" ref={containerRef} suppressHydrationWarning></div>;
};

export default MatrixBackground;
