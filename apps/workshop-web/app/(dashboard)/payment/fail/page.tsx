'use client';

import React from 'react';
import { PaymentFail } from '@cargoro/payment';
import { useRouter } from 'next/navigation';

export default function PaymentFailPage() {
  const router = useRouter();

  const handleRetry = () => {
    // 결제 페이지로 돌아가기
    router.push('/payment');
  };

  return <PaymentFail onRetry={handleRetry} />;
}
