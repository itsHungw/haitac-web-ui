'use client';

import { useState, type ReactNode } from 'react';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Footer } from './Footer';
import { Header } from './Header';

export function PublicPageShell({ children }: { children: ReactNode }) {
  const { user, isLoading, logout, refreshUser } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  function openAuth(tab: 'login' | 'register') {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }

  return (
    <div className="site-shell">
      <Header
        user={user}
        isLoading={isLoading}
        onOpenLogin={() => openAuth('login')}
        onOpenRegister={() => openAuth('register')}
        onLogout={logout}
      />
      {children}
      <Footer onOpenRegister={() => openAuth('register')} />
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authModalTab}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={refreshUser}
      />
    </div>
  );
}
