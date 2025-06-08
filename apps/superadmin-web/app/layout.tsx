import React from 'react';
import { Inter } from 'next/font/google';
import { ClientProviders } from './providers';
import './globals.css';

// 모든 페이지를 동적으로 렌더링
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 폰트 설정
const inter = Inter({ subsets: ['latin'] });

// 메타데이터 설정
export const metadata = {
  title: '카고로 관리자 시스템',
  description: '슈퍼 관리자를 위한 통합 솔루션',
};

/**
 * 슈퍼 관리자 웹 앱 레이아웃
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark scroll-smooth">
      <body
        suppressHydrationWarning={true}
        className={`${inter.className} bg-gray-900 text-gray-100`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
