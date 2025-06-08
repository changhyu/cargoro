import { test, expect } from '@playwright/test';

// 홈페이지 접속 및 기본 레이아웃 확인
test('홈페이지 접속 및 기본 레이아웃 확인', async ({ page }) => {
  // 홈페이지로 이동
  await page.goto('/');

  // 페이지 제목 확인
  await expect(page).toHaveTitle(/Clerk Next.js Quickstart/);

  // 헤더 영역이 존재하는지 확인
  const header = page.locator('header');
  await expect(header).toBeVisible();

  // 로그인 버튼이 보이는지 확인 (로그아웃 상태일 때)
  const signInButton = page.getByRole('button', { name: /Sign in/i });
  await expect(signInButton).toBeVisible();
});

// 로그인 페이지 이동 확인
test('로그인 페이지 이동 확인', async ({ page }) => {
  // 홈페이지로 이동
  await page.goto('/');

  // 로그인 버튼 클릭
  const signInButton = page.getByRole('button', { name: /Sign in/i });
  await signInButton.click();

  // URL이 로그인 페이지를 포함하는지 확인
  await expect(page).toHaveURL(/sign-in/);
});
