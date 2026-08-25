import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Hải Tặc Tí Hon - Cổng Web',
  description: 'Đăng ký và đăng nhập tài khoản Hải Tặc Tí Hon',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0f1d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <main className="app-container">{children}</main>
      </body>
    </html>
  );
}
