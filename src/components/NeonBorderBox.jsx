import React, { useRef, useEffect } from 'react';
import './NeonBorderBox.scss';

export default function NeonBorderBox({ 
  color = 'pink', 
  error = false, 
  info = false, 
  success = false, 
  warning = false,
  title = '',
  message = '',
  children, 
  style, 
  className = '',
  onClose = null,
  onRetry = null
}) {
  const boxRef = useRef(null);
  const textRef = useRef(null);

  // Neon color logic
  let borderColor = color;
  if (error) borderColor = '#ff1744';
  else if (success) borderColor = '#00e676';
  else if (info) borderColor = '#1e88e5';
  else if (warning) borderColor = '#ffb300';

  // Animate text movement on mouse
  useEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;
    const handleMove = (e) => {
      const rect = box.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      text.style.transform = `translate(${(x - 0.5) * 16}px, ${(y - 0.5) * 16}px)`;
    };
    box.addEventListener('mousemove', handleMove);
    box.addEventListener('mouseleave', () => { text.style.transform = 'translate(0,0)'; });
    return () => {
      box.removeEventListener('mousemove', handleMove);
      box.removeEventListener('mouseleave', () => { text.style.transform = 'translate(0,0)'; });
    };
  }, []);
  return (
    <div
      ref={boxRef}
      className={`neon-border-box${error ? ' neon-error' : ''}${success ? ' neon-success' : ''}${info ? ' neon-info' : ''}${warning ? ' neon-warning' : ''} ${className}`}
      style={{ ...style, '--neon-color': borderColor }}
    >
      <div className="neon-border-grid" />
      <div className="neon-border-content" ref={textRef}>
        {title && <h3 className="neon-border-title">{title}</h3>}
        {message && <div className="neon-border-message">{message}</div>}
        {children}
        
        {(onRetry || onClose) && (
          <div className="neon-border-actions">
            {onRetry && (
              <button className="neon-border-action neon-border-retry" onClick={onRetry}>
                Spróbuj ponownie
              </button>
            )}
            {onClose && (
              <button className="neon-border-action neon-border-close" onClick={onClose}>
                Zamknij
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
