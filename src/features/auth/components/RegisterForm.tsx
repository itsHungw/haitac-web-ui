'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CaptchaBox } from '@/components/ui/CaptchaBox';
import { authService } from '../services/auth.service';
import { extractErrorMessage } from '@/lib/api/errors';
import type { RegisterResponse } from '../types/auth.types';

export interface RegisterFormProps {
  onSuccess?: (data: RegisterResponse) => void;
  onLoginClick?: () => void;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<RegisterResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live password mismatch check
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side verification
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp với mật khẩu đã nhập.');
      return;
    }

    if (!captchaToken) {
      setErrorMessage('Vui lòng hoàn tất bước xác minh chống bot.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.register({
        user: username.trim().toLowerCase(),
        pass: password,
        turnstileToken: captchaToken,
      });

      setSuccessData(response);
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      // Token Turnstile chi dung duoc mot lan, ke ca request dang ky bi loi.
      setCaptchaToken(null);
      setCaptchaResetKey((current) => current + 1);
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
          {onLoginClick ? (
            <button type="button" className="btn btn-primary" onClick={onLoginClick}>
              Đăng nhập ngay
            </button>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Đăng nhập ngay
            </Link>
          )}
        </div>
      </div>
    );
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
        minLength={1}
        maxLength={60}
        pattern="[a-zA-Z0-9@._-]+"
        helperText="Tên tài khoản hoặc địa chỉ email."
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
        minLength={8}
        maxLength={60}
        pattern="[a-zA-Z0-9@._-]+"
        helperText="Ít nhất 8 ký tự, có thể chứa số và ký hiệu cơ bản."
        required
        disabled={isSubmitting}
      />

      <Input
        label="Xác nhận lại mật khẩu"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Nhập lại mật khẩu vừa đặt"
        autoComplete="new-password"
        minLength={8}
        maxLength={60}
        pattern="[a-zA-Z0-9@._-]+"
        error={passwordsMismatch ? 'Mật khẩu xác nhận không khớp.' : undefined}
        helperText={passwordsMatch ? '✓ Mật khẩu xác nhận trùng khớp.' : undefined}
        required
        disabled={isSubmitting}
      />

      <CaptchaBox
        onTokenChange={setCaptchaToken}
        action="register"
        resetKey={captchaResetKey}
        disabled={isSubmitting}
      />

      <div style={{ marginTop: '20px' }}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          loadingText="Đang tạo tài khoản..."
          disabled={isSubmitting || passwordsMismatch || !captchaToken}
        >
          Tạo tài khoản
        </Button>
      </div>

      <div className="text-center mt-4">
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Đã có tài khoản?{' '}
          {onLoginClick ? (
            <button type="button" className="inline-link" onClick={onLoginClick}>
              Đăng nhập
            </button>
          ) : (
            <Link href="/login" style={{ fontWeight: 600 }}>
              Đăng nhập
            </Link>
          )}
        </p>
      </div>
    </form>
  );
}
