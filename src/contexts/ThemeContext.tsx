
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  gradients: {
    header: string;
    button: string;
    card: string;
  };
  effects: {
    shadow: string;
    glow: string;
  };
}

const themes: Record<string, Theme> = {
  azure: {
    name: 'Azure Professional',
    colors: {
      primary: 'rgb(0, 120, 255)',
      secondary: 'rgb(120, 180, 255)',
      accent: 'rgb(80, 200, 120)',
      background: 'rgb(248, 250, 252)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(30, 30, 30)',
      textSecondary: 'rgb(100, 116, 139)',
      border: 'rgb(220, 228, 240)',
      success: 'rgb(16, 185, 129)',
      warning: 'rgb(245, 158, 11)',
      error: 'rgb(239, 68, 68)',
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(0, 120, 255) 0%, rgb(80, 200, 120) 100%)',
      button: 'linear-gradient(135deg, rgb(0, 120, 255) 0%, rgb(120, 180, 255) 100%)',
      card: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
    },
    effects: {
      shadow: '0 10px 40px rgba(0, 120, 255, 0.1)',
      glow: '0 0 20px rgba(0, 120, 255, 0.2)',
    },
  },
  carbon: {
    name: 'Carbon Black',
    colors: {
      primary: 'rgb(120, 220, 255)',
      secondary: 'rgb(180, 240, 255)',
      accent: 'rgb(255, 180, 120)',
      background: 'rgb(18, 18, 18)',
      surface: 'rgb(30, 30, 30)',
      text: 'rgb(245, 245, 245)',
      textSecondary: 'rgb(160, 160, 160)',
      border: 'rgb(60, 60, 60)',
      success: 'rgb(80, 220, 140)',
      warning: 'rgb(255, 200, 60)',
      error: 'rgb(255, 120, 120)',
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(30, 30, 30) 0%, rgb(50, 50, 50) 100%)',
      button: 'linear-gradient(135deg, rgb(120, 220, 255) 0%, rgb(180, 240, 255) 100%)',
      card: 'linear-gradient(145deg, rgba(30, 30, 30, 0.9) 0%, rgba(40, 40, 40, 0.8) 100%)',
    },
    effects: {
      shadow: '0 10px 40px rgba(120, 220, 255, 0.15)',
      glow: '0 0 20px rgba(120, 220, 255, 0.3)',
    },
  },
  matrix: {
    name: 'Matrix Green',
    colors: {
      primary: 'rgb(0, 255, 65)',
      secondary: 'rgb(120, 255, 160)',
      accent: 'rgb(0, 200, 255)',
      background: 'rgb(8, 16, 8)',
      surface: 'rgb(16, 32, 16)',
      text: 'rgb(0, 255, 65)',
      textSecondary: 'rgb(120, 200, 120)',
      border: 'rgb(40, 80, 40)',
      success: 'rgb(0, 255, 65)',
      warning: 'rgb(255, 255, 0)',
      error: 'rgb(255, 80, 80)',
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(8, 16, 8) 0%, rgb(16, 32, 16) 100%)',
      button: 'linear-gradient(135deg, rgb(0, 255, 65) 0%, rgb(120, 255, 160) 100%)',
      card: 'linear-gradient(145deg, rgba(16, 32, 16, 0.9) 0%, rgba(24, 48, 24, 0.8) 100%)',
    },
    effects: {
      shadow: '0 10px 40px rgba(0, 255, 65, 0.2)',
      glow: '0 0 20px rgba(0, 255, 65, 0.4)',
    },
  },
  cyber: {
    name: 'Cyber Purple',
    colors: {
      primary: 'rgb(138, 43, 226)',
      secondary: 'rgb(186, 104, 255)',
      accent: 'rgb(255, 20, 147)',
      background: 'rgb(16, 8, 24)',
      surface: 'rgb(32, 16, 48)',
      text: 'rgb(255, 240, 255)',
      textSecondary: 'rgb(200, 180, 220)',
      border: 'rgb(80, 40, 120)',
      success: 'rgb(120, 255, 180)',
      warning: 'rgb(255, 200, 60)',
      error: 'rgb(255, 80, 140)',
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(16, 8, 24) 0%, rgb(32, 16, 48) 100%)',
      button: 'linear-gradient(135deg, rgb(138, 43, 226) 0%, rgb(186, 104, 255) 100%)',
      card: 'linear-gradient(145deg, rgba(32, 16, 48, 0.9) 0%, rgba(48, 24, 72, 0.8) 100%)',
    },
    effects: {
      shadow: '0 10px 40px rgba(138, 43, 226, 0.2)',
      glow: '0 0 20px rgba(138, 43, 226, 0.4)',
    },
  },
  office: {
    name: 'Office Modern',
    colors: {
      primary: 'rgb(0, 102, 204)',
      secondary: 'rgb(100, 160, 255)',
      accent: 'rgb(16, 137, 62)',
      background: 'rgb(250, 251, 252)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(32, 32, 32)',
      textSecondary: 'rgb(96, 96, 96)',
      border: 'rgb(225, 230, 235)',
      success: 'rgb(16, 137, 62)',
      warning: 'rgb(255, 140, 0)',
      error: 'rgb(213, 43, 30)',
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(0, 102, 204) 0%, rgb(16, 137, 62) 100%)',
      button: 'linear-gradient(135deg, rgb(0, 102, 204) 0%, rgb(100, 160, 255) 100%)',
      card: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 251, 252, 0.9) 100%)',
    },
    effects: {
      shadow: '0 8px 32px rgba(0, 102, 204, 0.12)',
      glow: '0 0 16px rgba(0, 102, 204, 0.2)',
    },
  },
  teams: {
    name: 'Teams Professional',
    colors: {
      primary: 'rgb(98, 100, 167)',
      secondary: 'rgb(154, 156, 255)',
      accent: 'rgb(237, 144, 255)',
      background: 'rgb(248, 248, 250)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(36, 36, 36)',
      textSecondary: 'rgb(100, 100, 100)',
      border: 'rgb(218, 218, 230)',
      success: 'rgb(54, 179, 126)',
      warning: 'rgb(255, 180, 50)',
      error: 'rgb(196, 49, 75)',
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(98, 100, 167) 0%, rgb(237, 144, 255) 100%)',
      button: 'linear-gradient(135deg, rgb(98, 100, 167) 0%, rgb(154, 156, 255) 100%)',
      card: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 248, 250, 0.9) 100%)',
    },
    effects: {
      shadow: '0 8px 32px rgba(98, 100, 167, 0.15)',
      glow: '0 0 16px rgba(98, 100, 167, 0.25)',
    },
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<string>('azure');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app-theme', themeName);
    
    // Apply theme to CSS custom properties
    const theme = themes[themeName];
    const root = document.documentElement;
    
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--theme-border', theme.colors.border);
    root.style.setProperty('--theme-success', theme.colors.success);
    root.style.setProperty('--theme-warning', theme.colors.warning);
    root.style.setProperty('--theme-error', theme.colors.error);
    root.style.setProperty('--theme-gradient-header', theme.gradients.header);
    root.style.setProperty('--theme-gradient-button', theme.gradients.button);
    root.style.setProperty('--theme-gradient-card', theme.gradients.card);
    root.style.setProperty('--theme-shadow', theme.effects.shadow);
    root.style.setProperty('--theme-glow', theme.effects.glow);
  }, [themeName]);

  const setTheme = (newThemeName: string) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
    }
  };

  const value = {
    currentTheme: themes[themeName],
    themeName,
    setTheme,
    availableThemes: Object.keys(themes),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
