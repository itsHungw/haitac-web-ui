import React from 'react';

export interface AlertProps {
  variant?: 'error' | 'success';
  children: React.ReactNode;
  className?: string;
}

export function Alert({ variant = 'error', children, className = '' }: AlertProps) {
  if (!children) return null;

  const variantClass = variant === 'success' ? 'alert-success' : 'alert-error';

  return (
    <div role="alert" className={`alert ${variantClass} ${className}`.trim()}>
      <div>{children}</div>
    </div>
  );
}
