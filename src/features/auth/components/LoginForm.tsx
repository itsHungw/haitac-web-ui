'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authService } from '../services/auth.service';
import { extractErrorMessage } from '@/lib/api/errors';
import type { LoginResponse } from '../types/auth.types';

export interface LoginFormProps {
  onSuccess?: (data: LoginResponse) => void;
  onRegisterClick?: () => void;
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await authService.login({
        user: username,
        pass: password,
      });

      if (onSuccess) {
        onSuccess(response);
      } else {
        router.push(response.admin ? '/admin' : '/');
        router.refresh();
      }
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Alert variant="error">{errorMessage}</Alert>

      <Input
        label="Tên tài khoản hoặc Email"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value.toLowerCase())}
        placeholder="Nhập tài khoản hoặc email"
        autoComplete="username"
        inputMode="email"
        maxLength={60}
        required
        disabled={isSubmitting}
      />

      <Input
        label="Mật khẩu"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Nhập mật khẩu"
        autoComplete="current-password"
        maxLength={60}
        required
        disabled={isSubmitting}
      />

      <div style={{ marginTop: '20px' }}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          loadingText="Đang đăng nhập..."
        >
          Đăng nhập
        </Button>
      </div>

      <div className="text-center mt-4">
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Chưa có tài khoản?{' '}
          {onRegisterClick ? (
            <button type="button" className="inline-link" onClick={onRegisterClick}>Đăng ký ngay</button>
          ) : (
            <Link href="/register" style={{ fontWeight: 600 }}>Đăng ký ngay</Link>
          )}
        </p>
      </div>
    </form>
  );
}
