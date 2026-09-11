import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'dark' | 'light' | 'matrix' | 'midnight';

interface UIContextType {
  isSimpleMode: boolean;
  toggleSimpleMode: () => void;
  setSimpleMode: (simple: boolean) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isRealDiskMode: boolean;
  setIsRealDiskMode: (real: boolean) => void;
}

const UIContext = createContext<UIContextType>({
  isSimpleMode: true,
  toggleSimpleMode: () => {},
  setSimpleMode: () => {},
  theme: 'dark',
  setTheme: () => {},
  isRealDiskMode: false,
  setIsRealDiskMode: () => {}
});

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aegis_ui_simple_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('aegis_ui_theme');
      return (saved as AppTheme) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [isRealDiskMode, setIsRealDiskMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aegis_real_disk_mode');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('aegis_ui_theme', newTheme);
    } catch {}
  };

  const setRealDiskMode = (real: boolean) => {
    setIsRealDiskMode(real);
    try {
      localStorage.setItem('aegis_real_disk_mode', JSON.stringify(real));
    } catch {}
  };

  // Sync theme class to document root and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    const themeClasses = ['theme-dark', 'theme-light', 'theme-matrix', 'theme-midnight', 'dark', 'light'];
    root.classList.remove(...themeClasses);
    body.classList.remove(...themeClasses);
    
    if (theme === 'light') {
      root.classList.add('theme-light', 'light');
      body.classList.add('theme-light', 'light');
    } else {
      root.classList.add('dark', `theme-${theme}`);
      body.classList.add('dark', `theme-${theme}`);
    }
  }, [theme]);

  const toggleSimpleMode = () => {
    setIsSimpleMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('aegis_ui_simple_mode', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const setSimpleMode = (simple: boolean) => {
    setIsSimpleMode(simple);
    try {
      localStorage.setItem('aegis_ui_simple_mode', JSON.stringify(simple));
    } catch {}
  };

  return (
    <UIContext.Provider value={{ 
      isSimpleMode, 
      toggleSimpleMode, 
      setSimpleMode, 
      theme, 
      setTheme,
      isRealDiskMode,
      setIsRealDiskMode: setRealDiskMode
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
