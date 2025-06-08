import { AppProps } from 'next/app';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../app/globals.css';

// 폰트 설정
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
});

// 글로벌 QueryClient 인스턴스
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} {...pageProps}>
      <QueryClientProvider client={queryClient}>
        <main className={`${inter.variable} ${notoSansKr.variable}`}>
          <Component {...pageProps} />
        </main>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
