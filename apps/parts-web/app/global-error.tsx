'use client';

import { Inter, Noto_Sans_KR } from 'next/font/google';

// 폰트 설정
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
});

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKr.variable} scroll-smooth`}>
      <body className="min-h-screen font-sans antialiased">
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-6xl font-bold text-gray-800">심각한 오류</h1>
            <h2 className="mb-3 text-2xl font-medium text-gray-600">
              애플리케이션에 치명적인 오류가 발생했습니다
            </h2>
            <p className="text-gray-500">관리자에게 문의하시거나 다시 시도해 주세요.</p>
          </div>
          <button
            onClick={reset}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
