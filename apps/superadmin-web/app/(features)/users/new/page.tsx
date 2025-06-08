'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';

/**
 * 사용자 생성 페이지 (간소화 버전)
 */
export default function CreateUserPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>새 사용자 생성</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">사용자 생성 기능을 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
