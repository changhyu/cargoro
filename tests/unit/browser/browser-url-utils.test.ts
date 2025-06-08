import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { browserUtils, urlUtils } from '../../../src/utils/browser-url';

describe('browserUtils 테스트', () => {
  beforeEach(() => {
    // document.cookie 초기화
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  });

  describe('setCookie / getCookie / deleteCookie', () => {
    it('쿠키를 설정하고 가져올 수 있어야 함', () => {
      browserUtils.setCookie('testCookie', 'testValue', 1);
      expect(browserUtils.getCookie('testCookie')).toBe('testValue');
    });

    it('존재하지 않는 쿠키는 null을 반환해야 함', () => {
      expect(browserUtils.getCookie('nonExistent')).toBeNull();
    });

    it('쿠키를 삭제할 수 있어야 함', () => {
      browserUtils.setCookie('tempCookie', 'tempValue', 1);
      expect(browserUtils.getCookie('tempCookie')).toBe('tempValue');

      browserUtils.deleteCookie('tempCookie');
      expect(browserUtils.getCookie('tempCookie')).toBeNull();
    });

    it('여러 쿠키를 구분해서 가져와야 함', () => {
      browserUtils.setCookie('cookie1', 'value1', 1);
      browserUtils.setCookie('cookie2', 'value2', 1);

      expect(browserUtils.getCookie('cookie1')).toBe('value1');
      expect(browserUtils.getCookie('cookie2')).toBe('value2');
    });
  });

  describe('copyToClipboard', () => {
    it('클립보드 API가 있을 때 사용해야 함', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
      });

      const result = await browserUtils.copyToClipboard('test text');

      expect(writeTextMock).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
    });

    it('클립보드 API가 실패하면 false를 반환해야 함', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error());
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const result = await browserUtils.copyToClipboard('test text');
      expect(result).toBe(false);
    });

    it('클립보드 API가 없을 때 fallback을 사용해야 함', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });

      const execCommandMock = vi.fn().mockReturnValue(true);
      document.execCommand = execCommandMock;

      const result = await browserUtils.copyToClipboard('test text');

      expect(execCommandMock).toHaveBeenCalledWith('copy');
      expect(result).toBe(true);
    });
  });

  describe('getScrollPosition', () => {
    it('스크롤 위치를 반환해야 함', () => {
      window.pageXOffset = 100;
      window.pageYOffset = 200;

      const position = browserUtils.getScrollPosition();

      expect(position).toEqual({ x: 100, y: 200 });
    });
  });

  describe('getBrowserInfo', () => {
    it('브라우저 정보를 파싱해야 함', () => {
      const info = browserUtils.getBrowserInfo();

      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('version');
      expect(typeof info.name).toBe('string');
      expect(typeof info.version).toBe('string');
    });
  });

  describe('getDeviceType', () => {
    const originalUserAgent = navigator.userAgent;

    afterEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        writable: true,
      });
    });

    it('모바일 디바이스를 감지해야 함', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
      });

      expect(browserUtils.getDeviceType()).toBe('mobile');
    });

    it('태블릿을 감지해야 함', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        writable: true,
      });

      expect(browserUtils.getDeviceType()).toBe('tablet');
    });

    it('데스크톱을 감지해야 함', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        writable: true,
      });

      expect(browserUtils.getDeviceType()).toBe('desktop');
    });
  });

  describe('isOnline', () => {
    it('온라인 상태를 반환해야 함', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });

      expect(browserUtils.isOnline()).toBe(true);
    });
  });

  describe('isPageVisible', () => {
    it('페이지 가시성을 반환해야 함', () => {
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: true,
      });

      expect(browserUtils.isPageVisible()).toBe(true);

      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true,
      });

      expect(browserUtils.isPageVisible()).toBe(false);
    });
  });
});

describe('urlUtils 테스트', () => {
  describe('setUrlParam', () => {
    it('URL 파라미터를 추가해야 함', () => {
      const result = urlUtils.setUrlParam('https://example.com', 'key', 'value');
      expect(result).toBe('https://example.com/?key=value');
    });

    it('기존 파라미터를 업데이트해야 함', () => {
      const result = urlUtils.setUrlParam('https://example.com?key=old', 'key', 'new');
      expect(result).toBe('https://example.com/?key=new');
    });

    it('다른 파라미터는 유지해야 함', () => {
      const result = urlUtils.setUrlParam('https://example.com?a=1&b=2', 'c', '3');
      expect(result).toBe('https://example.com/?a=1&b=2&c=3');
    });
  });

  describe('removeUrlParam', () => {
    it('URL 파라미터를 제거해야 함', () => {
      const result = urlUtils.removeUrlParam('https://example.com?key=value', 'key');
      expect(result).toBe('https://example.com/');
    });

    it('다른 파라미터는 유지해야 함', () => {
      const result = urlUtils.removeUrlParam('https://example.com?a=1&b=2&c=3', 'b');
      expect(result).toBe('https://example.com/?a=1&c=3');
    });
  });

  describe('getUrlParam', () => {
    it('URL 파라미터를 가져와야 함', () => {
      expect(urlUtils.getUrlParam('https://example.com?key=value', 'key')).toBe('value');
      expect(urlUtils.getUrlParam('https://example.com?a=1&b=2', 'b')).toBe('2');
    });

    it('존재하지 않는 파라미터는 null을 반환해야 함', () => {
      expect(urlUtils.getUrlParam('https://example.com', 'key')).toBeNull();
    });
  });

  describe('getAllUrlParams', () => {
    it('모든 URL 파라미터를 가져와야 함', () => {
      const params = urlUtils.getAllUrlParams('https://example.com?a=1&b=2&c=3');
      expect(params).toEqual({ a: '1', b: '2', c: '3' });
    });

    it('파라미터가 없으면 빈 객체를 반환해야 함', () => {
      const params = urlUtils.getAllUrlParams('https://example.com');
      expect(params).toEqual({});
    });
  });

  describe('toAbsoluteUrl', () => {
    it('상대 URL을 절대 URL로 변환해야 함', () => {
      const result = urlUtils.toAbsoluteUrl('/path/to/page', 'https://example.com');
      expect(result).toBe('https://example.com/path/to/page');
    });

    it('이미 절대 URL이면 그대로 반환해야 함', () => {
      const result = urlUtils.toAbsoluteUrl('https://other.com/page', 'https://example.com');
      expect(result).toBe('https://other.com/page');
    });
  });

  describe('isValidUrl', () => {
    it('유효한 URL을 판별해야 함', () => {
      expect(urlUtils.isValidUrl('https://example.com')).toBe(true);
      expect(urlUtils.isValidUrl('http://localhost:3000')).toBe(true);
      expect(urlUtils.isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('유효하지 않은 URL을 판별해야 함', () => {
      expect(urlUtils.isValidUrl('not a url')).toBe(false);
      expect(urlUtils.isValidUrl('example.com')).toBe(false);
      expect(urlUtils.isValidUrl('')).toBe(false);
    });
  });

  describe('getDomain', () => {
    it('URL에서 도메인을 추출해야 함', () => {
      expect(urlUtils.getDomain('https://example.com/path')).toBe('example.com');
      expect(urlUtils.getDomain('https://sub.example.com:8080/path')).toBe('sub.example.com');
    });

    it('잘못된 URL은 빈 문자열을 반환해야 함', () => {
      expect(urlUtils.getDomain('not a url')).toBe('');
    });
  });

  describe('getPath', () => {
    it('URL에서 경로를 추출해야 함', () => {
      expect(urlUtils.getPath('https://example.com/path/to/page')).toBe('/path/to/page');
      expect(urlUtils.getPath('https://example.com/')).toBe('/');
    });

    it('잘못된 URL은 빈 문자열을 반환해야 함', () => {
      expect(urlUtils.getPath('not a url')).toBe('');
    });
  });
});
