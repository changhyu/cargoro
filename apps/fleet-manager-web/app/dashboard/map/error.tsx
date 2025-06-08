'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function MapErrorHandler({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  // 특정 오류 메시지 확인
  const isClientModulesError = error.message && error.message.includes('clientModules');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="mb-2 text-xl font-bold text-gray-800">지도 로딩 중 오류 발생</h1>
          <p className="mb-4 text-gray-600">
            지도 컴포넌트를 로드하는 중 예기치 않은 오류가 발생했습니다.
          </p>

          <div className="mb-4 w-full overflow-x-auto rounded border border-red-200 bg-red-50 p-3 font-mono text-sm text-red-800">
            {isClientModulesError
              ? "TypeError: Cannot read properties of undefined (reading 'clientModules')"
              : error.message}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="mb-2 font-medium text-yellow-800">문제 해결 방법</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700">
              <li>브라우저 캐시를 정리하고 새로고침해 보세요.</li>
              <li>다른 브라우저로 접속해 보세요.</li>
              <li>애플리케이션 개발자에게 이 오류를 보고해 주세요.</li>
            </ul>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => reset()}
              className="rounded bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
            >
              다시 시도
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              대시보드로 돌아가기
            </button>

            {isClientModulesError && (
              <button
                onClick={() => router.push('/diagnose-redirect')}
                className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
              >
                시스템 진단 실행
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
