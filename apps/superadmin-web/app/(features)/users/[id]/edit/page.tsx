'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';

/**
 * 사용자 편집 페이지 (간소화 버전)
 */
export default function UserEditPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>사용자 편집</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">사용자 편집 폼을 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
