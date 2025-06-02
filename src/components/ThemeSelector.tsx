
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
      default: 'bg-gradient-to-r from-blue-500 to-purple-600',
      emerald: 'bg-gradient-to-r from-emerald-500 to-cyan-500',
      sunset: 'bg-gradient-to-r from-orange-400 to-pink-500',
      purple: 'bg-gradient-to-r from-purple-600 to-pink-500',
      ocean: 'bg-gradient-to-r from-sky-500 to-cyan-400',
      forest: 'bg-gradient-to-r from-green-500 to-lime-500',
    };
    return themeColors[name as keyof typeof themeColors] || themeColors.default;
  };

  const getThemeDisplayName = (name: string) => {
    const displayNames = {
      default: 'Default Blue',
      emerald: 'Emerald Green',
      sunset: 'Sunset Orange',
      purple: 'Royal Purple',
      ocean: 'Ocean Blue',
      forest: 'Forest Green',
    };
    return displayNames[name as keyof typeof displayNames] || name;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2">
          <div className="text-sm font-medium mb-3">Choose Theme</div>
          <div className="space-y-2">
            {availableThemes.map((theme) => (
              <DropdownMenuItem
                key={theme}
                onClick={() => setTheme(theme)}
                className="flex items-center justify-between p-3 cursor-pointer rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full ${getThemePreview(theme)}`} />
                  <span className="text-sm font-medium">
                    {getThemeDisplayName(theme)}
                  </span>
                </div>
                {themeName === theme && (
                  <Check className="h-4 w-4 text-green-600" />
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
