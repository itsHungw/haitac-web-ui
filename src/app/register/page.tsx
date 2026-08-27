import type { Metadata } from 'next';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Đăng ký - Hải Tặc Tí Hon',
  description: 'Tạo tài khoản mới cho Hải Tặc Tí Hon',
};

export default function RegisterPage() {
  return (
    <main className="app-container">
      <AuthCard
        title="Đăng ký tài khoản"
        subtitle="Tạo tài khoản mới để tham gia hành trình"
      >
        <RegisterForm />
      </AuthCard>
    </main>
  );
}
