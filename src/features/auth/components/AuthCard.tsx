import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

export interface AuthCardProps { title: string; subtitle?: string; children: ReactNode }

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Card className="auth-card">
      <div className="auth-card__heading">
        <Link href="/" className="auth-card__brand" aria-label="Về trang chủ">
          <Image src="/images/logo.png" alt="Hải Tặc Tí Hon" width={56} height={56} className="pixelated" />
          <span className="auth-card__brand-title">HẢI TẶC<br />TÍ HON</span>
        </Link>
        <span className="eyebrow eyebrow--dark">CỔNG THUYỀN TRƯỞNG</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}
