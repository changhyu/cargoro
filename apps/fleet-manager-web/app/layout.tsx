import { Inter } from 'next/font/google';

import { ClientProviders } from './providers';
import './globals.css';

// 모든 페이지를 동적으로 렌더링
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '카고로 렌터카/리스 관리 시스템',
  description: '차량 렌탈 및 리스 계약 통합 관리 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
