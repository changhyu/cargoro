// Mock implementation for next/navigation - Server and Client compatible
const mockRouter = {
  push: () => {},
  replace: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
  pathname: '/',
  query: {},
  asPath: '/',
};

// Server-side safe implementations
export const useRouter = typeof window !== 'undefined' ? () => mockRouter : () => mockRouter;

export const usePathname = typeof window !== 'undefined' ? () => '/' : () => '/';

export const useSearchParams =
  typeof window !== 'undefined' ? () => new URLSearchParams() : () => new URLSearchParams();

export const useParams = typeof window !== 'undefined' ? () => ({}) : () => ({});

export const redirect = typeof window !== 'undefined' ? () => {} : () => {};

export const notFound = typeof window !== 'undefined' ? () => {} : () => {};

// CommonJS exports for server compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    useRouter,
    usePathname,
    useSearchParams,
    useParams,
    redirect,
    notFound,
  };
}
