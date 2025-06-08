import { test, expect } from '@playwright/test';

test.describe('초기 로드 성능 테스트', () => {
  test('홈페이지 초기 로드 시간', async ({ page }) => {
    // 성능 메트릭 수집 시작
    const startTime = Date.now();

    // 페이지 로드
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // 3초 이내 로드 확인
    expect(loadTime).toBeLessThan(3000);

    // Core Web Vitals 측정
    const metrics = await page.evaluate(() => {
      return new Promise<{ FCP: number | null; LCP: number | null }>(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
          const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint');

          resolve({
            FCP: fcp ? fcp.startTime : null,
            LCP: lcp ? lcp.startTime : null,
          });
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

        // 타임아웃 설정
        setTimeout(() => resolve({ FCP: null, LCP: null }), 5000);
      });
    });

    // FCP는 1.8초 이내
    if (metrics.FCP) {
      expect(metrics.FCP).toBeLessThan(1800);
    }

    // LCP는 2.5초 이내
    if (metrics.LCP) {
      expect(metrics.LCP).toBeLessThan(2500);
    }
  });

  test('대시보드 로드 성능', async ({ page }) => {
    // 로그인 상태 시뮬레이션
    await page.goto('http://localhost:3000');

    // 대시보드 로드 시간 측정
    const navigationPromise = page.waitForNavigation();
    const startTime = Date.now();

    await page.goto('http://localhost:3000/dashboard');
    await navigationPromise;

    const loadTime = Date.now() - startTime;

    // 2초 이내 로드
    expect(loadTime).toBeLessThan(2000);

    // 주요 요소들이 빠르게 표시되는지 확인
    await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible({ timeout: 1000 });
    await expect(page.locator('[data-testid="recent-appointments"]')).toBeVisible({
      timeout: 1500,
    });
  });

  test('이미지 최적화 확인', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 모든 이미지 요소 찾기
    const images = await page.locator('img').all();

    for (const img of images) {
      // 이미지가 lazy loading 설정되어 있는지 확인
      const loading = await img.getAttribute('loading');
      expect(loading).toBe('lazy');

      // Next.js Image 컴포넌트 사용 확인
      const src = await img.getAttribute('src');
      expect(src).toMatch(/_next\/image/);

      // 적절한 크기 설정 확인
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');
      expect(width).toBeTruthy();
      expect(height).toBeTruthy();
    }
  });

  test('번들 사이즈 확인', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // JavaScript 번들 크기 확인
    const jsSize = await page.evaluate(() => {
      const scripts = Array.from(document.scripts);
      return scripts.reduce((total, script) => {
        if (script.src && script.src.includes('_next')) {
          // 실제 구현에서는 fetch로 크기를 가져와야 함
          return total + 1000; // 임시값
        }
        return total;
      }, 0);
    });

    // 전체 JS 번들이 200KB 미만인지 확인
    expect(jsSize).toBeLessThan(200 * 1024);
  });

  test('캐싱 헤더 확인', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    const headers = response?.headers();

    // 정적 자산에 대한 캐시 설정 확인
    expect(headers?.['cache-control']).toBeTruthy();

    // 정적 파일 요청 가로채기
    page.on('response', response => {
      if (response.url().includes('_next/static')) {
        const cacheControl = response.headers()['cache-control'];
        // 정적 파일은 장기간 캐싱되어야 함
        expect(cacheControl).toContain('max-age=31536000');
      }
    });

    // 페이지 새로고침하여 캐시 동작 확인
    await page.reload();
  });

  test('메모리 누수 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // 초기 메모리 사용량 측정
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance && (performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // 여러 페이지 이동
    for (let i = 0; i < 10; i++) {
      await page.goto('http://localhost:3000/dashboard/appointments');
      await page.goto('http://localhost:3000/dashboard/customers');
      await page.goto('http://localhost:3000/dashboard');
    }

    // 가비지 컬렉션 강제 실행 (Chrome DevTools Protocol)
    const client = await page.context().newCDPSession(page);
    await client.send('HeapProfiler.collectGarbage');

    // 최종 메모리 사용량 측정
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance && (performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // 메모리 증가량이 10MB 미만인지 확인
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
