"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [simpleMode, setSimpleMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('osuverse-simple-mode');
    if (saved) {
      setSimpleMode(JSON.parse(saved));
      try {
        if (JSON.parse(saved) && typeof document !== 'undefined') {
          document.body.classList.add('focus-mode');
        }
      } catch {}
    }
  }, []);

  const toggleSimpleMode = () => {
    const newMode = !simpleMode;
    setSimpleMode(newMode);
    localStorage.setItem('osuverse-simple-mode', JSON.stringify(newMode));
    try {
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('focus-mode', newMode);
      }
    } catch {}
  };

  return (
    <AppContext.Provider value={{ simpleMode, toggleSimpleMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
