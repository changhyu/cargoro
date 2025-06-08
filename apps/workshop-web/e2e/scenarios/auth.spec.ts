import { test, expect } from '@playwright/test';

test.describe('인증 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto('http://localhost:3000');
  });

  test('로그인 플로우', async ({ page }) => {
    // 로그인 버튼 클릭
    await page.click('text=로그인');

    // Clerk 로그인 폼이 나타날 때까지 대기
    await page.waitForSelector('[data-testid="sign-in-form"]', { timeout: 10000 });

    // 이메일 입력
    await page.fill('input[name="identifier"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // 비밀번호 입력
    await page.fill('input[name="password"]', 'testPassword123!');
    await page.click('button[type="submit"]');

    // 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL(/.*dashboard/);

    // 사용자 정보 표시 확인
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('로그아웃 플로우', async ({ page }) => {
    // 먼저 로그인 상태 만들기 (실제 구현에서는 테스트용 토큰 사용)
    await page.goto('http://localhost:3000/dashboard');

    // 사용자 메뉴 클릭
    await page.click('[data-testid="user-menu"]');

    // 로그아웃 버튼 클릭
    await page.click('text=로그아웃');

    // 홈페이지로 리다이렉트 확인
    await expect(page).toHaveURL('http://localhost:3000/');

    // 로그인 버튼이 다시 표시되는지 확인
    await expect(page.locator('text=로그인')).toBeVisible();
  });

  test('비인증 사용자 접근 제한', async ({ page }) => {
    // 보호된 경로로 직접 접근 시도
    await page.goto('http://localhost:3000/dashboard');

    // 로그인 페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('회원가입 플로우', async ({ page }) => {
    // 회원가입 버튼 클릭
    await page.click('text=회원가입');

    // 회원가입 폼 대기
    await page.waitForSelector('[data-testid="sign-up-form"]');

    // 정보 입력
    await page.fill('input[name="emailAddress"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'NewPassword123!');
    await page.fill('input[name="firstName"]', '길동');
    await page.fill('input[name="lastName"]', '홍');

    // 약관 동의
    await page.check('input[type="checkbox"]');

    // 가입 버튼 클릭
    await page.click('button[type="submit"]');

    // 이메일 인증 안내 확인
    await expect(page.locator('text=이메일을 확인해주세요')).toBeVisible();
  });

  test('비밀번호 재설정', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.click('text=로그인');

    // 비밀번호 찾기 링크 클릭
    await page.click('text=비밀번호를 잊으셨나요?');

    // 이메일 입력
    await page.fill('input[name="emailAddress"]', 'test@example.com');

    // 재설정 이메일 전송
    await page.click('button[type="submit"]');

    // 성공 메시지 확인
    await expect(page.locator('text=비밀번호 재설정 이메일을 전송했습니다')).toBeVisible();
  });
});
