'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authService } from '../services/auth.service';
import { extractErrorMessage } from '@/lib/api/errors';
import type { RegisterResponse } from '../types/auth.types';

export interface RegisterFormProps {
  onSuccess?: (data: RegisterResponse) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<RegisterResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await authService.register({
        user: username,
        pass: password,
      });

      setSuccessData(response);
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successData) {
    return (
      <div>
        <Alert variant="success">
          Đã tạo thành công tài khoản <strong>{successData.user}</strong>!
        </Alert>

        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14.5px' }}>
            Bạn có thể dùng tài khoản này để đăng nhập trực tiếp vào game hoặc quản lý trên web.
          </p>
          <Link href="/login" className="btn btn-primary">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Alert variant="error">{errorMessage}</Alert>

      <Input
        label="Tên tài khoản"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Nhập tên tài khoản (viết thường, số)"
        autoComplete="username"
        required
        disabled={isSubmitting}
      />

      <Input
        label="Mật khẩu"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
        autoComplete="new-password"
        required
        disabled={isSubmitting}
      />

      <div style={{ marginTop: '20px' }}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          loadingText="Đang tạo tài khoản..."
        >
          Tạo tài khoản
        </Button>
      </div>

      <div className="text-center mt-4">
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ fontWeight: 600 }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </form>
  );
}
