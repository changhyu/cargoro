declare module 'next-navigation' {
  /**
   * Next.js 라우터 훅
   * @returns 라우터 객체
   */
  export function useRouter(): {
    /**
     * 특정 URL로 이동
     * @param url 이동할 URL
     */
    push: (url: string) => void;

    /**
     * 이전 페이지로 이동
     */
    back: () => void;

    /**
     * 브라우저의 URL을 변경하지만 페이지를 다시 로드하지 않음
     * @param url 변경할 URL
     */
    replace: (url: string) => void;

    /**
     * 페이지 새로고침
     */
    refresh: () => void;

    /**
     * 현재 경로 접두사
     */
    prefetch: (url: string) => Promise<void>;
  };

  /**
   * 현재 경로의 파라미터를 반환하는 훅
   */
  export function useParams<T = Record<string, string | string[]>>(): T;

  /**
   * 현재 URL의 검색 파라미터를 반환하는 훅
   */
  export function useSearchParams(): URLSearchParams;

  /**
   * 현재 페이지의 경로명을 반환하는 훅
   */
  export function usePathname(): string;

  /**
   * 리다이렉트 함수
   */
  export function redirect(url: string): never;

  /**
   * 페이지를 찾을 수 없음을 나타내는 함수
   */
  export function notFound(): never;
}
