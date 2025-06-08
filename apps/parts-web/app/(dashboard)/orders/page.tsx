'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui/card';

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">주문 관리</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 주문</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">아직 주문 내역이 없습니다.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>주문 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">통계 데이터가 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
