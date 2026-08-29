'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LogIn, LogOut, UserPlus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { User } from '@/features/auth/types/auth.types';

interface HeaderProps {
  user: User | null;
  isLoading?: boolean;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
}

interface NavItem {
  label: string;
  href: string;
  image: string;
  external?: boolean;
}

const NAV_LINKS: NavItem[] = [
  { label: 'Trang chủ', href: '/', image: '/images/bang_trang_chu.png' },
  { label: 'Tải game', href: '/tai-game', image: '/images/bang_tai_game.png' },
  { label: 'Diễn đàn', href: '/dien-dan', image: '/images/bang_dien_dan.png' },
  { label: 'Hướng dẫn', href: '/huong-dan', image: '/images/bang_huong_dan.png' },
];

export function Header({ user, isLoading, onOpenLogin, onOpenRegister, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const closeMenu = () => setMobileMenuOpen(false);
  const isCurrent = (href: string) => href === '/' ? pathname === '/' : pathname === href;

  return (
    <>
      <div className="health-notice">
        <span className="health-notice__age">12+</span>
        <span>Dành cho người chơi trên 12 tuổi. Chơi quá 180 phút một ngày sẽ hại sức khỏe.</span>
      </div>

      <header className="site-header">
        <div className="page-width site-header__inner">
          <Link className="brand-crest" href="/" aria-label="Hải Tặc Tí Hon — trang chủ">
            <Image src="/images/logo.png" alt="" width={53} height={53} priority className="pixelated" />
            <span>HẢI TẶC<br />TÍ HON</span>
          </Link>

          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {NAV_LINKS.map((link) => {
              const current = isCurrent(link.href);
              const content = (
                <div className="nav-item-icon-wrap" title={link.label}>
                  <Image
                    src={link.image}
                    alt=""
                    width={100}
                    height={100}
                    className="pixelated nav-item-buoy"
                  />
                  <span className="sr-only">{link.label}</span>
                </div>
              );

              return link.external ? (
                <a
                  className="pixel-nav pixel-nav--image"
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                >
                  {content}
                </a>
              ) : (
                <Link
                  className={`pixel-nav pixel-nav--image ${current ? 'is-active' : ''}`}
                  key={link.href}
                  href={link.href}
                  aria-current={current ? 'page' : undefined}
                  aria-label={link.label}
                >
                  {content}
                </Link>
              );
            })}
          </nav>

          <div className="header-actions desktop-actions">
            {isLoading ? (
              <span className="spinner header-spinner" aria-label="Đang tải tài khoản" />
            ) : user ? (
              <>
                <span className="account-chip">THUYỀN TRƯỞNG <strong>{user.user}</strong></span>
                {user.admin && <Link className="header-admin-link" href="/admin">Quản trị</Link>}
                <button className="header-link-button" type="button" onClick={onLogout}><LogOut aria-hidden="true" /> Thoát</button>
              </>
            ) : (
              <>
                <button className="header-login" type="button" onClick={onOpenLogin}><LogIn aria-hidden="true" /> Đăng nhập</button>
                <button className="header-register" type="button" onClick={onOpenRegister}><UserPlus aria-hidden="true" /> Đăng ký</button>
              </>
            )}
          </div>

          <button
            type="button"
            className="menu-toggle"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">{mobileMenuOpen ? '×' : '≡'}</span>
          </button>
        </div>

        <div id="mobile-navigation" className={`mobile-nav ${mobileMenuOpen ? 'is-open' : ''}`} hidden={!mobileMenuOpen}>
          <nav aria-label="Điều hướng di động">
            {NAV_LINKS.map((link) => {
              const current = isCurrent(link.href);
              const iconElement = (
                <Image
                  src={link.image}
                  alt=""
                  width={100}
                  height={100}
                  className="pixelated mobile-nav__icon"
                />
              );

              return link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                  {iconElement}
                  <span>{link.label}</span>
                </a>
              ) : (
                <Link key={link.href} href={link.href} onClick={closeMenu} aria-current={current ? 'page' : undefined}>
                  {iconElement}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mobile-nav__account">
            {user ? (
              <>
                <span>Xin chào, <strong>{user.user}</strong></span>
                {user.admin && <Link href="/admin" onClick={closeMenu}>Quản trị</Link>}
                <button className="mobile-nav__logout" type="button" onClick={() => { onLogout(); closeMenu(); }}><LogOut aria-hidden="true" /> Đăng xuất</button>
              </>
            ) : (
              <>
                <button className="mobile-nav__login" type="button" onClick={() => { onOpenLogin(); closeMenu(); }}><LogIn aria-hidden="true" /> Đăng nhập</button>
                <button className="mobile-nav__register" type="button" onClick={() => { onOpenRegister(); closeMenu(); }}><UserPlus aria-hidden="true" /> Đăng ký</button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
