'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  FormEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { authService } from '@/features/auth/services/auth.service';
import { ApiError, extractErrorMessage } from '@/lib/api/errors';
import { adminService } from '../services/admin.service';
import type { AdminOverview } from '../types/admin.types';

type IconName = 'dashboard' | 'users' | 'audit' | 'economy' | 'gift' | 'broadcast' | 'fashion' | 'search' | 'logout';

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    audit: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
    economy: <><circle cx="12" cy="12" r="9" /><path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5H14a2.5 2.5 0 0 1 0 5H7M12 5v14" /></>,
    gift: <><rect x="3" y="8" width="18" height="13" /><path d="M12 8v13M2 8h20V4H2zM12 4c0-3-5-3-5 0 0 2 5 4 5 4M12 4c0-3 5-3 5 0 0 2-5 4-5 4" /></>,
    broadcast: <><path d="M3 11v2M7 8v8M11 5v14M15 8v8M19 11v2" /></>,
    fashion: <><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3M21 3v18" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

interface AdminContextValue {
  overview: AdminOverview | null;
  isLoading: boolean;
  refreshOverview: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdminWorkspace() {
  const value = useContext(AdminContext);
  if (!value) throw new Error('useAdminWorkspace phải nằm trong AdminShell');
  return value;
}

interface AdminNavItem {
  href: string;
  label: string;
  icon: IconName;
  disabled?: boolean;
}

const NAVIGATION: Array<{ label: string; items: AdminNavItem[] }> = [
  {
    label: 'Điều hành',
    items: [
      { href: '/admin', label: 'Tổng quan', icon: 'dashboard' as const },
      { href: '/admin/users', label: 'Người chơi', icon: 'users' as const },
      { href: '/admin/fashion', label: 'Cải trang & Sự kiện', icon: 'fashion' as const },
      { href: '/admin/economy', label: 'Kinh tế game', icon: 'economy' as const },
      { href: '/admin/gift-codes', label: 'Gift code', icon: 'gift' as const },
      { href: '/admin/live-operations', label: 'Live ops', icon: 'broadcast' as const },
      { href: '/admin/audit', label: 'Nhật ký quản trị', icon: 'audit' as const },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  const refreshOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setOverview(await adminService.getOverview());
      setAccessDenied(false);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        router.replace('/login');
        return;
      }
      if (caught instanceof ApiError && caught.status === 403) {
        setAccessDenied(true);
        return;
      }
      if (caught instanceof ApiError && caught.status === 404) {
        setError('API quản trị chưa được triển khai trên máy chủ đang kết nối.');
        return;
      }
      setError(extractErrorMessage(caught, 'Không thể kết nối trung tâm quản trị.'));
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void refreshOverview();
  }, [refreshOverview]);

  function handleGlobalSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = globalQuery.trim();
    router.push(query ? `/admin/users?q=${encodeURIComponent(query)}` : '/admin/users');
  }

  async function handleLogout() {
    await authService.logout().catch(() => undefined);
    router.replace('/');
    router.refresh();
  }

  if (accessDenied) {
    return (
      <main className="admin-access-page">
        <div className="admin-access-card">
          <Image src="/images/logo.png" width={58} height={58} alt="" className="pixelated" />
          <span>QUYỀN TRUY CẬP</span>
          <h1>Khu vực dành cho quản trị viên</h1>
          <p>Tài khoản hiện tại không có quyền mở workspace này.</p>
          <Link href="/">Quay về trang game</Link>
        </div>
      </main>
    );
  }

  return (
    <AdminContext.Provider value={{ overview, isLoading, refreshOverview }}>
      <div className="admin-app">
        <header className="admin-header">
          <Link className="admin-wordmark" href="/admin">
            <Image src="/images/logo.png" width={45} height={45} alt="" className="pixelated" />
            <span><strong>hải trình</strong><small>GAME CONTROL</small></span>
          </Link>

          <form className="admin-global-search" onSubmit={handleGlobalSearch}>
            <Icon name="search" />
            <label className="sr-only" htmlFor="admin-global-query">Tìm nhanh tài khoản</label>
            <input
              id="admin-global-query"
              value={globalQuery}
              onChange={(event) => setGlobalQuery(event.target.value)}
              placeholder="Tìm tài khoản hoặc email..."
              maxLength={60}
            />
            <kbd>Enter</kbd>
          </form>

          <div className="admin-account-menu">
            <span className="admin-account-dot" />
            <div><small>QUẢN TRỊ VIÊN</small><strong>{overview?.viewer ?? 'Đang xác minh'}</strong></div>
            <button type="button" onClick={handleLogout} aria-label="Đăng xuất"><Icon name="logout" /></button>
          </div>
        </header>

        <aside className="admin-sidebar">
          {NAVIGATION.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <p>{group.label}</p>
              <nav aria-label={group.label}>
                {group.items.map((item) => {
                  const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                  return item.disabled ? (
                    <span className="admin-nav-item is-disabled" key={item.label}>
                      <Icon name={item.icon} /><b>{item.label}</b><small>Sau</small>
                    </span>
                  ) : (
                    <Link className={`admin-nav-item ${active ? 'is-active' : ''}`} href={item.href} key={item.label}>
                      <Icon name={item.icon} /><b>{item.label}</b>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
          <div className="admin-sidebar-note">
            <span>Chế độ an toàn</span>
            <p>Mọi thay đổi tài khoản đều yêu cầu lý do và được ghi audit.</p>
          </div>
          <Link className="admin-back-link" href="/">← Về trang game</Link>
        </aside>

        <main className="admin-content">
          {error ? (
            <section className="admin-api-error" role="alert">
              <span>Không thể tải dữ liệu</span>
              <h1>Workspace chưa kết nối API</h1>
              <p>{error}</p>
              <button type="button" onClick={() => void refreshOverview()}>Thử kết nối lại</button>
            </section>
          ) : children}
        </main>
      </div>
    </AdminContext.Provider>
  );
}
