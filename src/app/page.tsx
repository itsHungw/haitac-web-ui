'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';

const GAME_URL = 'https://htth.aqueduct.me';

export default function HomePage() {
  const { user, isLoading, logout } = useAuth();

  return (
    <Card>
      <div className="text-center" style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(6, 182, 212, 0.25))',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            fontSize: '28px',
            marginBottom: '14px',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          ⚔️
        </div>
        <h1 className="title-main">Hải Tặc Tí Hon</h1>
        <p className="subtitle" style={{ marginBottom: 0 }}>
          {isLoading
            ? 'Đang kiểm tra trạng thái phiên...'
            : user
            ? 'Chào mừng bạn trở lại đại dương!'
            : 'Đăng ký tài khoản để bắt đầu hành trình'}
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
          <div className="spinner" style={{ width: '28px', height: '28px', color: 'var(--accent-gold)' }} />
        </div>
      ) : user ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
              Tài khoản đang đăng nhập:{' '}
              <strong style={{ color: 'var(--text-primary)', fontSize: '16px' }}>{user.user}</strong>
              {user.admin && <span className="badge-admin">Quản trị</span>}
            </p>
          </div>

          <a
            href={GAME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success"
            style={{ textDecoration: 'none' }}
          >
            🎮 Vào chơi ngay
          </a>

          <Button variant="secondary" onClick={logout}>
            Đăng xuất
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/login" className="btn btn-primary">
            Đăng nhập
          </Link>

          <Link href="/register" className="btn btn-secondary">
            Đăng ký tài khoản mới
          </Link>
        </div>
      )}
    </Card>
  );
}
