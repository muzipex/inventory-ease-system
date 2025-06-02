
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
}

const themes: Record<string, Theme> = {
  default: {
    name: 'Default Blue',
    colors: {
      primary: 'rgb(59, 130, 246)',
      secondary: 'rgb(147, 197, 253)',
      accent: 'rgb(168, 85, 247)',
      background: 'rgb(248, 250, 252)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(15, 23, 42)',
      textSecondary: 'rgb(71, 85, 105)',
      border: 'rgb(226, 232, 240)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(168, 85, 247))',
      button: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 197, 253))',
      card: 'linear-gradient(135deg, rgb(248, 250, 252), rgb(241, 245, 249))',
    },
  },
  emerald: {
    name: 'Emerald Green',
    colors: {
      primary: 'rgb(16, 185, 129)',
      secondary: 'rgb(110, 231, 183)',
      accent: 'rgb(6, 182, 212)',
      background: 'rgb(240, 253, 244)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(20, 83, 45)',
      textSecondary: 'rgb(75, 85, 99)',
      border: 'rgb(209, 250, 229)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(16, 185, 129), rgb(6, 182, 212))',
      button: 'linear-gradient(135deg, rgb(16, 185, 129), rgb(110, 231, 183))',
      card: 'linear-gradient(135deg, rgb(240, 253, 244), rgb(236, 253, 245))',
    },
  },
  sunset: {
    name: 'Sunset Orange',
    colors: {
      primary: 'rgb(251, 146, 60)',
      secondary: 'rgb(254, 215, 170)',
      accent: 'rgb(244, 63, 94)',
      background: 'rgb(255, 251, 235)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(124, 45, 18)',
      textSecondary: 'rgb(120, 113, 108)',
      border: 'rgb(254, 240, 138)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(251, 146, 60), rgb(244, 63, 94))',
      button: 'linear-gradient(135deg, rgb(251, 146, 60), rgb(254, 215, 170))',
      card: 'linear-gradient(135deg, rgb(255, 251, 235), rgb(254, 243, 199))',
    },
  },
  purple: {
    name: 'Royal Purple',
    colors: {
      primary: 'rgb(147, 51, 234)',
      secondary: 'rgb(196, 181, 253)',
      accent: 'rgb(236, 72, 153)',
      background: 'rgb(250, 245, 255)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(88, 28, 135)',
      textSecondary: 'rgb(107, 114, 128)',
      border: 'rgb(233, 213, 255)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(147, 51, 234), rgb(236, 72, 153))',
      button: 'linear-gradient(135deg, rgb(147, 51, 234), rgb(196, 181, 253))',
      card: 'linear-gradient(135deg, rgb(250, 245, 255), rgb(245, 243, 255))',
    },
  },
  ocean: {
    name: 'Ocean Blue',
    colors: {
      primary: 'rgb(14, 165, 233)',
      secondary: 'rgb(125, 211, 252)',
      accent: 'rgb(34, 211, 238)',
      background: 'rgb(240, 249, 255)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(12, 74, 110)',
      textSecondary: 'rgb(71, 85, 105)',
      border: 'rgb(186, 230, 253)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(14, 165, 233), rgb(34, 211, 238))',
      button: 'linear-gradient(135deg, rgb(14, 165, 233), rgb(125, 211, 252))',
      card: 'linear-gradient(135deg, rgb(240, 249, 255), rgb(224, 242, 254))',
    },
  },
  forest: {
    name: 'Forest Green',
    colors: {
      primary: 'rgb(34, 197, 94)',
      secondary: 'rgb(134, 239, 172)',
      accent: 'rgb(132, 204, 22)',
      background: 'rgb(247, 254, 231)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(20, 83, 45)',
      textSecondary: 'rgb(75, 85, 99)',
      border: 'rgb(220, 252, 231)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(132, 204, 22))',
      button: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(134, 239, 172))',
      card: 'linear-gradient(135deg, rgb(247, 254, 231), rgb(240, 253, 244))',
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
  const [themeName, setThemeName] = useState<string>('default');

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
