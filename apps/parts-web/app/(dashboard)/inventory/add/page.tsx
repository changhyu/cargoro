'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui/card';

/**
 * 새 부품 추가 페이지 (간소화 버전)
 */
export default function AddPartPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>새 부품 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">부품 추가 폼을 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
