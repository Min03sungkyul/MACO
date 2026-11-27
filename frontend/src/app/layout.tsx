import type { Metadata, Viewport } from 'next';
import { AppShell, Providers } from '@/components/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'MACO · 매일 10분 마케팅 트레이닝',
  description: '대신 해 주지 않고, 혼자서도 하는 사장님을 만드는 마케팅 트레이닝',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
