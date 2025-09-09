"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [simpleMode, setSimpleMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('osuverse-simple-mode');
    if (saved) {
      setSimpleMode(JSON.parse(saved));
    }
  }, []);

  const toggleSimpleMode = () => {
    const newMode = !simpleMode;
    setSimpleMode(newMode);
    localStorage.setItem('osuverse-simple-mode', JSON.stringify(newMode));
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
