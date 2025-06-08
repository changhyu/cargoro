'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';

/**
 * 사용자 권한 페이지 (간소화 버전)
 */
export default function UserPermissionsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>사용자 권한 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">사용자 ID: {id}</p>
          <p className="text-gray-500">권한 관리 기능을 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
