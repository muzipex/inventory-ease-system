import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Home, ShoppingCart, BarChart3, Users, Settings, Menu, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface LayoutProps {
  children: React.ReactNode;
}
const Layout = ({
  children
}: LayoutProps) => {
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
  const navigation = [{
    name: 'Dashboard',
    href: '/',
    icon: Home
  }, {
    name: 'Products',
    href: '/products',
    icon: Package
  }, {
    name: 'Sales',
    href: '/sales',
    icon: ShoppingCart
  }, {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3
  }, {
    name: 'Customers',
    href: '/customers',
    icon: Users
  }, {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  }];
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border-b border-blue-100 dark:border-gray-700 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 bg-slate-300">
            {/* Compact Logo */}
            <div className="flex items-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 dark:opacity-40"></div>
                <div className="relative py-2 border border-blue-200 dark:border-gray-600 transition-colors duration-300 px-[12px] bg-transparent rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300">
                      <span className="text-lg font-black tracking-tight px-0">NGABIRANO BLOCKS</span>
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 tracking-wide uppercase border-l border-gray-300 dark:border-gray-600 pl-2 px-0">
                  </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map(item => <Link key={item.name} to={item.href} className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${location.pathname === item.href ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-md'}`}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>)}
            </nav>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* Dark Mode Toggle */}
              <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="p-2 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200" aria-label="Toggle dark mode">
                {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-blue-700" />}
              </Button>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="hover:bg-blue-50 dark:hover:bg-gray-700">
                  <Menu className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && <div className="md:hidden border-t border-blue-100 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm transition-colors duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map(item => <Link key={item.name} to={item.href} className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition-all duration-200 ${location.pathname === item.href ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50 hover:text-blue-700 dark:hover:text-blue-300'}`} onClick={() => setMobileMenuOpen(false)}>
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>)}
            </div>
          </div>}
      </header>

      {/* Main content */}
      <main className="py-6 bg-indigo-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-[#dfd9ee] rounded-none">
          {children}
        </div>
      </main>
    </div>;
};
export default Layout;