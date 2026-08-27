'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, initialTab = 'login', onClose, onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setActiveTab(initialTab), [initialTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled])')
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="auth-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div className="auth-modal__header">
          <div className="auth-modal__brand">
            <Image src="/images/logo.png" alt="Hải Tặc Tí Hon" width={42} height={42} className="pixelated" />
            <span className="auth-modal__brand-title">HẢI TẶC<br />TÍ HON</span>
          </div>
          <span id="auth-modal-title" className="auth-modal__badge">CỔNG THUYỀN TRƯỞNG</span>
          <button ref={closeButtonRef} type="button" className="auth-modal__close" onClick={onClose} aria-label="Đóng cửa sổ">×</button>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Tài khoản">
          <button type="button" role="tab" aria-selected={activeTab === 'login'} className={activeTab === 'login' ? 'is-active' : ''} onClick={() => setActiveTab('login')}>Đăng nhập</button>
          <button type="button" role="tab" aria-selected={activeTab === 'register'} className={activeTab === 'register' ? 'is-active' : ''} onClick={() => setActiveTab('register')}>Đăng ký</button>
        </div>

        <div className="auth-modal__body">
          {activeTab === 'login' ? (
            <LoginForm onRegisterClick={() => setActiveTab('register')} onSuccess={() => { onSuccess?.(); onClose(); }} />
          ) : (
            <RegisterForm onLoginClick={() => setActiveTab('login')} onSuccess={() => onSuccess?.()} />
          )}
        </div>
      </div>
    </div>
  );
}
