'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';

interface DebugInfo {
  clerkLoaded: boolean;
  userId: string | null;
  sessionId: string | null;
  orgId: string | null;
}

interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: Record<string, unknown> | null;
}

interface NextData {
  buildId?: string;
  page?: string;
  locale?: string;
  [key: string]: unknown;
}

interface WindowWithNextData {
  __NEXT_DATA__?: NextData;
}

const formatValue = (value: Record<string, unknown> | string | null): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
};

const getClerkState = (): Record<string, unknown> => {
  if (typeof window === 'undefined') return {};
  return ((window as unknown as Record<string, unknown>).Clerk as Record<string, unknown>) || {};
};

const getAuthHeaders = (): Record<string, string> => {
  return {
    Authorization: 'Bearer token',
    'Content-Type': 'application/json',
  };
};

export default function DebugPage() {
  const [nextInfo, setNextInfo] = useState<NextData | null>(null);
  const [nodeEnv, setNodeEnv] = useState<string>('unknown');
  const [error, setError] = useState<string | null>(null);
  const [moduleInfo, setModuleInfo] = useState<{ react: string; nextVersion: string }>({
    react: 'unknown',
    nextVersion: 'unknown',
  });

  useEffect(() => {
    try {
      // Next.js 정보 수집
      if (
        typeof window !== 'undefined' &&
        (window as unknown as WindowWithNextData).__NEXT_DATA__
      ) {
        setNextInfo((window as unknown as WindowWithNextData).__NEXT_DATA__ || null);
      }

      // 환경 정보 수집
      setNodeEnv(process.env.NODE_ENV || 'unknown');

      // 모듈 정보 수집
      const moduleDetails = {
        react: React.version,
        nextVersion: process.env.NEXT_RUNTIME || 'unknown',
      };
      setModuleInfo(moduleDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">시스템 디버그 정보</h1>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <span>오류 발생: {error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>환경 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Node 환경:</span>
                <span>{nodeEnv}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">React 버전:</span>
                <span>{moduleInfo.react || 'unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Next.js 런타임:</span>
                <span>{moduleInfo.nextVersion || 'unknown'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next.js 정보</CardTitle>
          </CardHeader>
          <CardContent>
            {nextInfo ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">빌드 ID:</span>
                  <span>{String(nextInfo.buildId || 'unknown')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">페이지:</span>
                  <span>{String(nextInfo.page || 'unknown')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">로케일:</span>
                  <span>{String(nextInfo.locale || 'default')}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Next.js 정보를 불러올 수 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>문제 해결 방안</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="mb-2 font-medium text-blue-700">clientModules 오류 해결</h3>
              <p className="mb-2 text-sm text-blue-600">
                TypeError: Cannot read properties of undefined (reading 'clientModules') 오류는
                일반적으로 다음과 같은 원인으로 발생합니다:
              </p>
              <ol className="list-inside list-decimal space-y-1 pl-4 text-sm text-blue-600">
                <li>서버 컴포넌트에서 클라이언트 라이브러리 사용</li>
                <li>dynamic import 설정 오류</li>
                <li>Next.js 설정 충돌</li>
                <li>패키지 버전 불일치</li>
              </ol>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                개발 서버 재시작
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                의존성 재설치
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                캐시 정리
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>디버그 단계</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-inside list-decimal space-y-2">
            <li className="text-green-600">✓ 기본 디버그 페이지 로드 확인</li>
            <li>Next.js 14.2.0 버전 호환성 확인</li>
            <li>클라이언트/서버 컴포넌트 경계 검사</li>
            <li>임포트 경로 및 모듈 로딩 확인</li>
            <li>Next.js 설정 최적화</li>
          </ol>

          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-700">
              <strong>개발 팀 참고사항:</strong> 지도 페이지에서 leaflet과 mapbox 관련 컴포넌트가
              서버 사이드 렌더링 도중 오류를 발생시키고 있습니다. 'use client' 지시문을 추가하더라도
              일부 임포트된 라이브러리에서 문제가 발생합니다. 클라이언트 컴포넌트를 완전히 분리하고
              dynamic import를 사용하는 방식으로 리팩토링이 필요합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
