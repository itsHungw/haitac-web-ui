import type { Metadata } from 'next';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Đăng nhập - Hải Tặc Tí Hon',
  description: 'Đăng nhập vào tài khoản Hải Tặc Tí Hon',
};

export default function LoginPage() {
  return (
    <main className="app-container">
      <AuthCard
        title="Đăng nhập"
        subtitle="Nhập thông tin tài khoản để tiếp tục"
      >
        <LoginForm />
      </AuthCard>
    </main>
  );
}
