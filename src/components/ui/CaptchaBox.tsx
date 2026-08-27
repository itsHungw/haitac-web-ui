'use client';

import Script from 'next/script';
import React, { useEffect, useRef, useState } from 'react';

interface TurnstileOptions {
  sitekey: string;
  action: string;
  appearance: 'always';
  language: string;
  size: 'flexible' | 'compact';
  theme: 'light';
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
}

interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileOptions): string;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface CaptchaBoxProps {
  onTokenChange: (token: string | null) => void;
  action?: string;
  disabled?: boolean;
  resetKey?: number;
}

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const DEVELOPMENT_SITE_KEY = '1x00000000000000000000AA';

export function CaptchaBox({
  onTokenChange,
  action = 'register',
  disabled = false,
  resetKey = 0,
}: CaptchaBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [scriptReady, setScriptReady] = useState(false);

  const configuredSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const siteKey = configuredSiteKey
    ?? (process.env.NODE_ENV !== 'production' ? DEVELOPMENT_SITE_KEY : '');

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!scriptReady || !siteKey || !containerRef.current || !window.turnstile) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      appearance: 'always',
      language: 'vi',
      size: window.matchMedia('(max-width: 420px)').matches ? 'compact' : 'flexible',
      theme: 'light',
      callback: (token) => {
        onTokenChangeRef.current(token);
      },
      'expired-callback': () => {
        onTokenChangeRef.current(null);
      },
      'error-callback': () => {
        onTokenChangeRef.current(null);
      },
    });

    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      onTokenChangeRef.current(null);
    };
  }, [action, scriptReady, siteKey]);

  useEffect(() => {
    if (resetKey === 0 || !widgetIdRef.current) {
      return;
    }

    window.turnstile?.reset(widgetIdRef.current);
    onTokenChangeRef.current(null);
  }, [resetKey]);

  return (
    <div className="form-group">
      <Script
        id="cloudflare-turnstile"
        src={TURNSTILE_SCRIPT}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => onTokenChangeRef.current(null)}
      />

      {siteKey ? (
        <div
          ref={containerRef}
          className={`turnstile-widget ${disabled ? 'turnstile-widget--disabled' : ''}`}
          aria-busy={!scriptReady}
        />
      ) : (
        <p className="turnstile-config-error" role="alert">
          Chưa cấu hình khóa Turnstile cho môi trường production.
        </p>
      )}
    </div>
  );
}
