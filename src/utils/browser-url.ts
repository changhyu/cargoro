// 브라우저 유틸리티
export const browserUtils = {
  // 쿠키 설정
  setCookie: (name: string, value: string, days: number): void => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  },

  // 쿠키 가져오기
  getCookie: (name: string): string | null => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  // 쿠키 삭제
  deleteCookie: (name: string): void => {
    browserUtils.setCookie(name, '', -1);
  },

  // 클립보드에 복사
  copyToClipboard: async (text: string): Promise<boolean> => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    }

    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  },

  // 전체 화면 토글
  toggleFullscreen: async (element?: HTMLElement): Promise<void> => {
    const elem = element || document.documentElement;

    if (!document.fullscreenElement) {
      await elem.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  },

  // 스크롤 위치 가져오기
  getScrollPosition: (): { x: number; y: number } => {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop,
    };
  },

  // 스크롤 애니메이션
  smoothScrollTo: (targetY: number, duration: number = 500): void => {
    const startY = window.pageYOffset;
    const difference = targetY - startY;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;

      window.scrollTo(0, startY + difference * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  },

  // 브라우저 정보 가져오기
  getBrowserInfo: (): { name: string; version: string } => {
    const ua = navigator.userAgent;
    let match = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    let temp;

    if (/trident/i.test(match[1])) {
      temp = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { name: 'IE', version: temp[1] || '' };
    }

    if (match[1] === 'Chrome') {
      temp = ua.match(/\bOPR|Edge\/(\d+)/);
      if (temp != null) {
        return { name: 'Opera', version: temp[1] };
      }
    }

    match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];

    if ((temp = ua.match(/version\/(\d+)/i)) != null) {
      match.splice(1, 1, temp[1]);
    }

    return {
      name: match[0],
      version: match[1],
    };
  },

  // 디바이스 타입 감지
  getDeviceType: (): 'mobile' | 'tablet' | 'desktop' => {
    const ua = navigator.userAgent;

    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }

    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        ua
      )
    ) {
      return 'mobile';
    }

    return 'desktop';
  },

  // 네트워크 상태 확인
  isOnline: (): boolean => {
    return navigator.onLine;
  },

  // 페이지 가시성 확인
  isPageVisible: (): boolean => {
    return !document.hidden;
  },
};

// URL 유틸리티
export const urlUtils = {
  // URL 파라미터 추가/업데이트
  setUrlParam: (url: string, key: string, value: string): string => {
    const urlObj = new URL(url);
    urlObj.searchParams.set(key, value);
    return urlObj.toString();
  },

  // URL 파라미터 제거
  removeUrlParam: (url: string, key: string): string => {
    const urlObj = new URL(url);
    urlObj.searchParams.delete(key);
    return urlObj.toString();
  },

  // URL 파라미터 가져오기
  getUrlParam: (url: string, key: string): string | null => {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(key);
  },

  // 모든 URL 파라미터 가져오기
  getAllUrlParams: (url: string): Record<string, string> => {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  },

  // 상대 URL을 절대 URL로 변환
  toAbsoluteUrl: (relativeUrl: string, baseUrl?: string): string => {
    const base = baseUrl || window.location.href;
    return new URL(relativeUrl, base).href;
  },

  // URL 유효성 검사
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // URL에서 도메인 추출
  getDomain: (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  },

  // URL 경로 추출
  getPath: (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return '';
    }
  },
};
