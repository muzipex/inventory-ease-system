import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Home, ShoppingCart, BarChart3, Users, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
interface LayoutProps {
  children: React.ReactNode;
}
const Layout = ({
  children
}: LayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-blue-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25"></div>
                <div className="relative bg-white rounded-lg p-4 border border-blue-200">
                  <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-blue-800 font-bold text-2xl leading-tight tracking-tight">
                    <span className="block text-3xl font-black">NGABIRANO BLOCKS</span>
                    <span className="block text-lg font-semibold tracking-wider opacity-90">BLOCKS</span>
                  </h1>
                  <div className="mt-1">
                    <span className="text-xs font-medium text-gray-600 tracking-wide uppercase">
                      Inventory System
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map(item => <Link key={item.name} to={item.href} className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${location.pathname === item.href ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 hover:shadow-md'}`}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>)}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="hover:bg-blue-50">
                <Menu className="h-6 w-6 text-blue-700" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && <div className="md:hidden border-t border-blue-100 bg-white/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map(item => <Link key={item.name} to={item.href} className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition-all duration-200 ${location.pathname === item.href ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'}`} onClick={() => setMobileMenuOpen(false)}>
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>)}
            </div>
          </div>}
      </header>

      {/* Main content */}
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>;
};
export default Layout;