import React from 'react';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import { ClerkProviderWrapper } from './components/clerk-provider-wrapper';
import { Providers } from './providers';
import './globals.css';
import type { Metadata } from 'next';

// Noto Sans KR 로컬 폰트 설정
const notoSansKr = localFont({
  src: '../public/fonts/Noto_Sans_KR/NotoSansKR-VariableFont_wght.ttf',
  variable: '--font-noto-sans-kr',
  display: 'swap',
  weight: '100 900',
});

// 폰트 설정 - 영문용 Inter
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// 메타데이터 설정
export const metadata: Metadata = {
  title: '카고로 정비소 관리 시스템',
  description: '정비소를 위한 종합 관리 시스템',
  icons: {
    icon: '/favicon.ico',
  },
};

/**
 * 워크샵 웹 앱 레이아웃
 */
// 전체 앱을 동적 렌더링으로 설정하여 ClerkProvider 문제 해결
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKr.variable}`}>
      <body suppressHydrationWarning={true} className="min-h-screen font-sans antialiased">
        <ClerkProviderWrapper>
          <Providers>{children}</Providers>
          <Toaster />
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
