/* eslint-disable */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// 문제 진단을 위한 컴포넌트
export default function DiagnosePage() {
  const router = useRouter();
  const [diagnostics, setDiagnostics] = useState({
    nextVersion: 'unknown',
    reactVersion: React.version,
    nodeEnv: process.env.NODE_ENV || 'unknown',
    buildId: 'unknown',
    moduleLoadingSuccess: false,
    errors: [] as string[],
  });

  const [countdown, setCountdown] = useState(10);

  // 진단 실행
  useEffect(() => {
    const runDiagnostics = async () => {
      const errors: string[] = [];

      try {
        // Next.js 정보 확인
        if (typeof window !== 'undefined' && window.__NEXT_DATA__) {
          setDiagnostics(prev => ({
            ...prev,
            buildId: window.__NEXT_DATA__.buildId || 'unknown',
          }));
        }

        // 모듈 로딩 테스트
        try {
          // 각 모듈 로딩 테스트
          const modules = [
            ['next/dynamic', 'Next Dynamic'],
            ['react-dom', 'React DOM'],
            ['@cargoro/ui', 'UI Components'],
          ];

          for (const [modulePath, moduleName] of modules) {
            try {
              // 직접 체크하는 방식으로 변경
              if (moduleName === 'Next Dynamic') {
                const dynamic = require('next/dynamic');
                console.log(`✅ Module loaded: ${moduleName}`);
              } else if (moduleName === 'React DOM') {
                const reactDom = require('react-dom');
                console.log(`✅ Module loaded: ${moduleName}`);
              } else if (moduleName === 'UI Components') {
                const ui = require('@cargoro/ui');
                console.log(`✅ Module loaded: ${moduleName}`);
              }
            } catch (err: unknown) {
              console.error(`❌ Failed to load module: ${moduleName}`, err);
              errors.push(
                `모듈 로딩 실패: ${moduleName} - ${err instanceof Error ? err.message : String(err)}`
              );
            }
          }

          setDiagnostics(prev => ({
            ...prev,
            moduleLoadingSuccess: errors.length === 0,
            errors: [...prev.errors, ...errors],
          }));
        } catch (err: unknown) {
          console.error('Module loading tests failed:', err);
          errors.push(`모듈 테스트 실패: ${err instanceof Error ? err.message : String(err)}`);
        }
      } catch (err: unknown) {
        console.error('Diagnostics failed:', err);
        errors.push(`진단 실패: ${err instanceof Error ? err.message : String(err)}`);
      }

      setDiagnostics(prev => ({
        ...prev,
        errors: [...prev.errors, ...errors],
      }));
    };

    runDiagnostics();

    // 카운트다운 및 리다이렉트
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // 진단 완료 후 메인 페이지로 리다이렉트
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md overflow-hidden rounded-xl bg-white p-6 shadow-md md:max-w-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">시스템 진단 중...</h2>
          <p className="mt-2 text-sm text-gray-500">
            페이지 로딩 중 오류가 발생하여 시스템 진단을 실행합니다
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 font-medium text-blue-700">환경 정보</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">React 버전:</div>
              <div className="font-medium">{diagnostics.reactVersion}</div>

              <div className="text-gray-600">Node 환경:</div>
              <div className="font-medium">{diagnostics.nodeEnv}</div>

              <div className="text-gray-600">빌드 ID:</div>
              <div className="font-medium">{diagnostics.buildId}</div>

              <div className="text-gray-600">모듈 로딩:</div>
              <div
                className={`font-medium ${diagnostics.moduleLoadingSuccess ? 'text-green-600' : 'text-red-600'}`}
              >
                {diagnostics.moduleLoadingSuccess ? '성공' : '실패'}
              </div>
            </div>
          </div>

          {diagnostics.errors.length > 0 && (
            <div className="rounded-lg bg-red-50 p-4">
              <h3 className="mb-2 font-medium text-red-700">발견된 오류</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
                {diagnostics.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="mb-2 text-sm text-gray-600">{countdown}초 후 대시보드로 이동합니다...</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              지금 바로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
