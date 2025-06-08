import { ClerkProvider } from '@cargoro/auth/web';
import { getAuthConfig } from '@cargoro/auth/config/auth-config';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider {...getAuthConfig('workshop-web')}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
