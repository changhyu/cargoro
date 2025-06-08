import { test, expect } from '@playwright/test';

test('기본 페이지 로드 테스트', async ({ page }) => {
  // 대시보드 페이지로 이동
  await page.goto('/dashboard');

  // 페이지 타이틀 확인
  const title = await page.title();
  expect(title).toContain('CarGoro');

  // 대시보드 페이지 내용 확인
  await expect(page.getByText('정비소 대시보드')).toBeVisible();
  await expect(page.getByText('오늘의 예약')).toBeVisible();
  await expect(page.getByText('진행 중인 정비')).toBeVisible();
  await expect(page.getByText('대기 중인 차량')).toBeVisible();
});
