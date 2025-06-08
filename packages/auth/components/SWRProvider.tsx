'use client';

import { SWRConfig } from 'swr';

export interface SWRProviderProps {
  children: React.ReactNode;
  options?: any; // SWRConfiguration 타입 대신 any 사용
}

/**
 * SWR 제공자 컴포넌트
 *
 * SWR 캐싱 및 요청 관리를 위한 전역 설정을 제공합니다.
 * Clerk 컴포넌트 내부에서 SWR 사용 시 필요합니다.
 */
export function SWRProvider({ children, options }: SWRProviderProps) {
  return <SWRConfig value={options || {}}>{children}</SWRConfig>;
}

export default SWRProvider;
