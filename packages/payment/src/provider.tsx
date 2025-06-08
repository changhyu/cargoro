'use client';

import React from 'react';
import { PaymentConfig } from './types';
import { initializePayment } from './hooks';

interface PaymentProviderProps {
  children: React.ReactNode;
  config: PaymentConfig;
}

export function PaymentProvider({ children, config }: PaymentProviderProps) {
  React.useEffect(() => {
    initializePayment(config);
  }, [config]);

  return <>{children}</>;
}
