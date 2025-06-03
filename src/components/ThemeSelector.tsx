
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeSelector = () => {
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();

  const getThemePreview = (name: string) => {
    const themeColors = {
      azure: 'bg-gradient-to-r from-blue-500 to-green-400',
      carbon: 'bg-gradient-to-r from-gray-800 to-cyan-400',
      matrix: 'bg-gradient-to-r from-green-400 to-cyan-400',
      cyber: 'bg-gradient-to-r from-purple-600 to-pink-500',
      office: 'bg-gradient-to-r from-blue-600 to-green-500',
      teams: 'bg-gradient-to-r from-indigo-500 to-purple-400',
    };
    return themeColors[name as keyof typeof themeColors] || themeColors.azure;
  };

  const getThemeDisplayName = (name: string) => {
    const displayNames = {
      azure: 'Azure Professional',
      carbon: 'Carbon Black',
      matrix: 'Matrix Green',
      cyber: 'Cyber Purple',
      office: 'Office Modern',
      teams: 'Teams Professional',
    };
    return displayNames[name as keyof typeof displayNames] || name;
  };

  const getThemeDescription = (name: string) => {
    const descriptions = {
      azure: 'Clean and modern Microsoft-inspired design',
      carbon: 'Dark professional with cyan accents',
      matrix: 'Futuristic green terminal aesthetic',
      cyber: 'High-tech purple and pink gradients',
      office: 'Classic Office suite styling',
      teams: 'Microsoft Teams-inspired professional look',
    };
    return descriptions[name as keyof typeof descriptions] || '';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2 glass-effect">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline font-medium">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 theme-card border-0">
        <div className="p-4">
          <div className="text-sm font-semibold mb-4 theme-text-secondary">
            Choose Professional Theme
          </div>
          <div className="space-y-3">
            {availableThemes.map((theme) => (
              <DropdownMenuItem
                key={theme}
                onClick={() => setTheme(theme)}
                className="flex items-center justify-between p-4 cursor-pointer rounded-lg hover:bg-gray-50/50 transition-all duration-200 border border-transparent hover:border-gray-200/50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-lg ${getThemePreview(theme)} shadow-lg`} />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {getThemeDisplayName(theme)}
                    </span>
                    <span className="text-xs theme-text-secondary">
                      {getThemeDescription(theme)}
                    </span>
                  </div>
                </div>
                {themeName === theme && (
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
