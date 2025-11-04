'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Megaphone,
  Users,
  UserCog, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Conversas', href: '/conversations', icon: MessageSquare },
  { name: 'Campanhas', href: '/campaigns', icon: Megaphone },
  { name: 'Grupos', href: '/groups', icon: Users },
  { name: 'Equipe', href: '/team', icon: UserCog },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">WhatsApp SaaS</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6">
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp SaaS</h1>
          </div>
          <nav className="mt-8 flex-1 px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-green-50 text-green-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5
                      ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* User section with logout */}
          <div className="flex-shrink-0 px-3 pb-4 border-t border-gray-200 pt-4">
            <div className="flex items-center px-3 py-2 text-sm text-gray-700 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold mr-3">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-gray-900 bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col h-full pt-16 pb-4">
              <nav className="flex-1 px-3 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-green-50 text-green-700' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon
                        className={`
                          mr-3 flex-shrink-0 h-5 w-5
                          ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}
                        `}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Bottom navigation - Mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-40">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center px-3 py-2 text-xs font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'text-green-600' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
