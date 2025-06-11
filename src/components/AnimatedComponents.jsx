'use client';

import { useState, useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform, useAnimate } from 'framer-motion';
import './animatedComponents.scss';

/**
 * Komponent neonowego przycisku z efektami animacji
 */
export const AnimatedNeonButton = ({ 
  children, 
  onClick, 
  color = '#8c54ff', 
  className = '',
  disabled = false,
  ...props 
}) => {
  return (
    <motion.button
      className={`animated-neon-button ${className}`}
      style={{ '--button-color': color }}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${color}` }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

/**
 * Komponent z efektem płynnego pojawiania się
 */
export const FadeIn = ({ 
  children, 
  duration = 0.5, 
  delay = 0, 
  className = '',
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      className={`fade-in ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Komponent z efektem płynnego pojawiania się i przesunięcia
 */
export const SlideIn = ({ 
  children, 
  direction = 'up', // 'up', 'down', 'left', 'right'
  distance = 50,
  duration = 0.5, 
  delay = 0,
  className = '', 
  ...props 
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: distance, opacity: 0 };
      case 'down': return { y: -distance, opacity: 0 };
      case 'left': return { x: distance, opacity: 0 };
      case 'right': return { x: -distance, opacity: 0 };
      default: return { y: distance, opacity: 0 };
    }
  };

  const getFinalPosition = () => {
    switch (direction) {
      case 'up': return { y: 0, opacity: 1 };
      case 'down': return { y: 0, opacity: 1 };
      case 'left': return { x: 0, opacity: 1 };
      case 'right': return { x: 0, opacity: 1 };
      default: return { y: 0, opacity: 1 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={getFinalPosition()}
      exit={getInitialPosition()}
      transition={{ duration, delay }}
      className={`slide-in ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Komponent wczytywania z neonową animacją
 */
export const NeonLoader = ({ 
  size = 50, 
  color = '#8c54ff',
  thickness = 4,
  className = '',
  ...props 
}) => {
  return (
    <div className={`neon-loader-container ${className}`} style={{ '--loader-color': color }}>
      <motion.div 
        className="neon-loader"
        style={{ 
          width: size, 
          height: size,
          borderWidth: thickness,
        }}
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: 'linear',
        }}
        {...props}
      />
    </div>
  );
};

/**
 * Komponent z pulsującym efektem
 */
export const PulseEffect = ({ 
  children, 
  intensity = 1.1, 
  duration = 2,
  className = '', 
  ...props 
}) => {
  return (
    <motion.div
      animate={{ 
        scale: [1, intensity, 1],
      }}
      transition={{ 
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`pulse-effect ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Komponent z efektem pisania tekstu
 */
export const TypewriterText = ({ 
  text = '', 
  speed = 0.05, 
  delay = 0,
  cursor = true,
  className = '',
  onComplete = () => {},
  ...props 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [scope, animate] = useAnimate();
  
  useEffect(() => {
    setDisplayText('');
    
    const typeText = async () => {
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
      
      const chars = [];
      for (let i = 0; i < text.length; i++) {
        chars.push(text.slice(0, i + 1));
        await new Promise(resolve => setTimeout(resolve, speed * 1000));
        setDisplayText(text.slice(0, i + 1));
      }
      
      onComplete();
    };
    
    typeText();
  }, [text, speed, delay, onComplete]);

  return (
    <div className={`typewriter-text ${className}`} ref={scope} {...props}>
      {displayText}
      {cursor && <span className="typewriter-cursor">|</span>}
    </div>
  );
};

/**
 * Komponent z efektem przejścia strony
 */
export const PageTransition = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`page-transition ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Komponent przekształcania elementu przy przewijaniu
 */
export const ParallaxElement = ({ 
  children, 
  speed = 0.5,
  className = '',
  ...props 
}) => {
  const y = useMotionValue(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      y.set(scrollY * speed);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, y]);
  
  return (
    <motion.div
      style={{ y }}
      className={`parallax-element ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
