'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cargoro/ui';
import {
  PaymentWidget,
  PaymentHistoryList,
  PaymentMethodList,
  SubscriptionManager,
} from '@cargoro/payment';
import { useAuth, useUser } from '@clerk/nextjs';
import { generateOrderId } from '@cargoro/payment';

export default function PaymentDashboard() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('payment');

  // 예시 결제 데이터
  const samplePayment = {
    orderId: generateOrderId('WORKSHOP'),
    orderName: '정비 서비스 - 엔진오일 교환',
    amount: 85000,
    customerId: userId || 'guest',
    customerName: user?.fullName || '고객',
    customerEmail: user?.emailAddresses?.[0]?.emailAddress,
  };

  const handlePaymentSuccess = (_paymentKey: string) => {
    // 결제 성공 후 처리 로직
    // TODO: 결제 성공 시 처리 구현
  };

  const handlePaymentError = (_error: Error) => {
    // 결제 실패 처리 로직
    // TODO: 결제 실패 시 에러 처리 구현
  };

  if (!userId) {
    return (
      <div className="container mx-auto py-6">
        <p>로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">결제 관리</h1>
        <p className="mt-1 text-muted-foreground">결제, 구독, 포인트를 관리하세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payment">결제하기</TabsTrigger>
          <TabsTrigger value="history">결제 내역</TabsTrigger>
          <TabsTrigger value="methods">결제 수단</TabsTrigger>
          <TabsTrigger value="subscription">구독 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
          <PaymentWidget
            {...samplePayment}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <PaymentHistoryList customerId={userId} />
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <PaymentMethodList customerId={userId} />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <SubscriptionManager customerId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
