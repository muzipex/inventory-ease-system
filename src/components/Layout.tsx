
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Home, ShoppingCart, BarChart3, Users, Settings, Menu, Sun, Moon, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeSelector from './ThemeSelector';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || !savedTheme && prefersDark;
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Sales', href: '/sales', icon: ShoppingCart },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <div 
      className="min-h-screen transition-all duration-500 grid-pattern"
      style={{
        background: `var(--theme-background)`,
      }}
    >
      {/* Header */}
      <header 
        className="theme-header backdrop-blur-xl shadow-2xl border-b transition-all duration-500 sticky top-0 z-50"
        style={{
          background: `var(--theme-gradient-header)`,
          borderColor: `var(--theme-border)`,
          boxShadow: `var(--theme-shadow)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-white/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative py-2 border glass-effect transition-all duration-500 px-4 bg-white/5 backdrop-blur-xl rounded-xl hover:bg-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="text-white">
                      <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                        NGABIRANO BLOCKS
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`theme-nav-pill flex items-center px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    location.pathname === item.href
                      ? 'active bg-white/25 text-white shadow-lg transform scale-105'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  }`}
                  style={{
                    fontWeight: location.pathname === item.href ? '600' : '500',
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Theme Selector */}
              <ThemeSelector />
              
              {/* Dark Mode Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleDarkMode} 
                className="p-2.5 glass-effect hover:bg-white/15 text-white transition-all duration-300 rounded-lg" 
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                  className="glass-effect hover:bg-white/15 text-white p-2.5 rounded-lg transition-all duration-300"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 glass-effect backdrop-blur-xl transition-all duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-3 text-base font-semibold rounded-lg transition-all duration-300 ${
                    location.pathname === item.href
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
