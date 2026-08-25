import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Card>
      <div className="text-center" style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(6, 182, 212, 0.2))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              fontSize: '24px',
              marginBottom: '12px',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            🏴‍☠️
          </div>
        </Link>
        <h1 className="title-main">{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}
