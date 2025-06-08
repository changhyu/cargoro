'use client';

import React, { ReactNode } from 'react';

export default function ClientAnalyticsProvider({ children }: { children: ReactNode }) {
  // 임시로 분석 기능 비활성화
  return <>{children}</>;
}
