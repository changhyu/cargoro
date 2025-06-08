'use client';

import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui/card';

/**
 * 부품 목록 및 관리 페이지 (간소화 버전)
 */
export default function PartsPage() {
  return (
    <div className="space-y-6 py-6">
      <h1 className="text-3xl font-bold">부품 관리</h1>

      <Card>
        <CardHeader>
          <CardTitle>부품 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">부품 목록을 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
