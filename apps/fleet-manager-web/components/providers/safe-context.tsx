'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface SafeContextType {
  isClient: boolean;
}

const SafeContext = createContext<SafeContextType | null>(null);

export function SafeContextProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return <SafeContext.Provider value={{ isClient }}>{children}</SafeContext.Provider>;
}

export function useSafeContext() {
  const context = useContext(SafeContext);
  return context || { isClient: false };
}
