'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@cargoro/ui';
import { AlertTriangle, Info, Check, Clock } from 'lucide-react';

export default function DiagnoseRedirect() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // 카운트다운 완료 후 진단 페이지로 이동
          window.location.href = '/diagnose';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center">
          <AlertTriangle className="mr-3 h-8 w-8 text-amber-500" />
          <h1 className="text-xl font-bold text-gray-800">시스템 오류 감지</h1>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">다음 오류로 인해 지도 페이지를 로드할 수 없습니다:</p>

          <div className="overflow-x-auto rounded border border-red-200 bg-red-50 p-3 font-mono text-sm text-red-800">
            TypeError: Cannot read properties of undefined (reading 'clientModules')
          </div>

          <div className="flex items-center rounded bg-blue-50 p-3 text-blue-700">
            <Info className="mr-2 h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              이 문제를 진단하기 위해 진단 페이지로 이동합니다. {countdown}초 후 자동으로
              이동합니다.
            </p>
          </div>

          <div className="space-y-2 rounded border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-sm">오류 정보 수집</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-sm">시스템 상태 확인</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-blue-500" />
              <span className="text-sm">진단 페이지로 리디렉션</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => (window.location.href = '/diagnose')}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            지금 진단 시작
          </Button>
        </div>
      </div>
    </div>
  );
}
