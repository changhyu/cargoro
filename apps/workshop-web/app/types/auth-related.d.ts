/**
 * @clerk/nextjs 패키지 타입 확장 및 오버라이드
 * Next.js 14와 함께 사용할 때 발생하는 타입 호환성 문제를 해결하기 위한 선언 파일
 */

import { ReactNode } from 'react';

declare module '@clerk/nextjs' {
  /**
   * ClerkProvider의 타입을 오버라이드하여 Promise<JSX.Element> 대신 ReactNode를 반환하도록 합니다.
   */
  export interface ClerkProviderProps {
    children: ReactNode;
    appearance?: {
      elements?: Record<string, string>;
      [key: string]: unknown;
    };
    signInUrl?: string;
    signUpUrl?: string;
    afterSignInUrl?: string;
    afterSignUpUrl?: string;
    [key: string]: unknown;
  }

  export const ClerkProvider: React.FC<ClerkProviderProps>;
}
