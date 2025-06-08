'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';

/**
 * 사용자 목록 페이지 (간소화 버전)
 */
export default function UsersPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">사용자 목록을 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
