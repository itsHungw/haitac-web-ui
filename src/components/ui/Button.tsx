import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success';
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      isLoading = false,
      loadingText,
      fullWidth = true,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const variantClass = `btn-${variant}`;
    const fullWidthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`btn ${variantClass} ${fullWidthClass} ${className}`.trim()}
        {...props}
      >
        {isLoading && <span className="spinner" aria-hidden="true" />}
        <span>{isLoading && loadingText ? loadingText : children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
