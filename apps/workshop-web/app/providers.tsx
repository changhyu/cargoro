'use client';

import React from 'react';
import { SWRProvider } from '@cargoro/auth/components/SWRProvider';
// import { RealtimeProvider } from '@cargoro/realtime';
import { PaymentProvider, PaymentConfig } from '@cargoro/payment';
// import { useAuth } from '@clerk/nextjs';

export function Providers({ children }: { children: React.ReactNode }) {
  // const { userId } = useAuth();

  // const realtimeConfig = {
  //   url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8001',
  //   authToken: userId || '',
  //   reconnectAttempts: 5,
  //   reconnectDelay: 1000,
  // };

  const paymentConfig: PaymentConfig = {
    clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq',
    secretKey: process.env.TOSS_SECRET_KEY || '',
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
    failUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/fail`,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
  };

  return (
    <SWRProvider>
      {/* <RealtimeProvider config={realtimeConfig}> */}
      <PaymentProvider config={paymentConfig}>{children}</PaymentProvider>
      {/* </RealtimeProvider> */}
    </SWRProvider>
  );
}
