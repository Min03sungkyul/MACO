import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR, Outfit } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { StoreProvider } from '@/lib/store';
import { Toast } from '@/components/ui';
import './globals.css';

const noto = Noto_Sans_KR({ weight: ['400', '500', '700', '800'], subsets: ['latin'], variable: '--font-noto', display: 'swap' });
const outfit = Outfit({ weight: ['500', '600', '700'], subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

export const metadata: Metadata = {
  title: '마코 MACO',
  description: '사장님 곁의 마케팅 코치. 하루 15분, 우리 가게에 맞는 홍보 루틴.',
  appleWebApp: { capable: true, title: '마코', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${noto.variable} ${outfit.variable}`}>
      <body>
        <SessionProvider>
          <StoreProvider>
            <div className="app">
              {children}
              <Toast />
            </div>
          </StoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
