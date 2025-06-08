import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

/**
 * CarGoro Workshop Web E2E 테스트를 위한 Playwright 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // E2E 테스트 디렉토리 지정 - Vitest와 명확히 분리
  testDir: './e2e',

  /* 테스트 실행 시간이 초과되면 테스트 실패로 처리 */
  timeout: 30 * 1000,

  /* 테스트 간 요소가 보일 때까지 기다리는 최대 시간 */
  expect: {
    timeout: 5000,
  },

  /* 테스트 실행자 */
  fullyParallel: true,

  /* 테스트가 실패할 경우 재시도 횟수 */
  retries: process.env.CI ? 2 : 0,

  /* 모든 테스트의 결과를 리포터에 출력 */
  reporter: [
    ['html', { outputFolder: './playwright-report' }],
    ['list'],
    ['json', { outputFile: './test-results/e2e-results.json' }],
  ],

  /* 개발 서버 설정 - 이미 실행 중인 서버 사용하거나 필요시 서버 시작 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },

  /* 테스트 실행할 브라우저 설정 */
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'desktop-firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* 테스트에 적용할 환경 변수 */
  use: {
    // 서버 URL
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    // 테스트 ID 속성 지정
    testIdAttribute: 'data-testid',

    // 브라우저 컨텍스트 설정
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // 권한 설정
    permissions: ['geolocation'],

    // 자동 스크린샷
    screenshot: 'only-on-failure',

    // 추적 설정
    trace: process.env.CI ? 'on' : 'on-first-retry',

    // 비디오 설정
    video: process.env.CI ? 'on-first-retry' : 'off',
  },
});
