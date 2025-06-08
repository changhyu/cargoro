'use client';

import Link from 'next/link';

/**
 * 404 Not Found 페이지
 * 페이지를 찾을 수 없을 때 표시되는 커스텀 오류 페이지
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="max-w-lg space-y-6">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-3xl font-medium text-gray-700">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-500">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
        <div className="pt-4">
          <Link
            href="/"
            className="rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
