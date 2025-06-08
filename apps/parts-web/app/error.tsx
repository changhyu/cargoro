'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 개발 환경에서만 오류 로깅
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-800">오류 발생</h1>
        <h2 className="mb-3 text-2xl font-medium text-gray-600">예상치 못한 오류가 발생했습니다</h2>
        <p className="text-gray-500">잠시 후 다시 시도해주세요.</p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          다시 시도
        </button>
        <a href="/" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}
