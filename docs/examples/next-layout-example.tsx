/**
 * Next.js 앱 레이아웃 예제
 *
 * 이 예제는 Next.js 앱에서 Clerk 인증 제공자를 설정하는 방법을 보여줍니다.
 * 이 파일을 앱의 app/layout.tsx 파일로 저장하세요.
 */

import React from 'react';
import { Toaster } from '@cargoro/ui';
import { WebClerkProvider } from '@cargoro/auth';
import { Inter } from 'next/font/google';

// 폰트 설정
const inter = Inter({ subsets: ['latin'] });

// 메타데이터 설정
export const metadata = {
  title: '카고로 앱',
  description: '카고로 앱 설명',
};

/**
 * 앱 루트 레이아웃
 *
 * 모든 페이지를 감싸는 레이아웃입니다.
 * Clerk 인증 제공자를 설정합니다.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <WebClerkProvider
          appearance={{
            elements: {
              // Clerk UI 요소 스타일링
              formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
              card: 'bg-background border border-border shadow-sm',
              formFieldLabel: 'text-foreground',
              formFieldInput:
                'border border-input bg-background focus:ring-2 focus:ring-primary/50',
              // 추가 스타일 설정...
            },
          }}
          // 다크 모드 활성화 (옵션)
          darkMode={false}
        >
          {children}
          <Toaster />
        </WebClerkProvider>
      </body>
    </html>
  );
}
