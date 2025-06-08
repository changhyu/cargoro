'use client';

import React from 'react';
import { PaymentSuccess } from '@cargoro/payment';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();

  const handleSuccess = (_paymentKey: string, _orderId: string) => {
    // 결제 성공 후 추가 처리
    // TODO: 결제 성공 데이터 기록

    // 3초 후 주문 내역 페이지로 이동
    setTimeout(() => {
      router.push('/orders');
    }, 3000);
  };

  return <PaymentSuccess onSuccess={handleSuccess} />;
}
