'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';
import { useEffect, useState } from 'react';

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 클라이언트 사이드에서만 ClerkProvider를 렌더링
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      localization={koKR}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}
