// filepath: apps/superadmin-web/e2e/basic.spec.ts
import { test, expect } from '@playwright/test';

test('기본 페이지 로드 테스트', async ({ page }) => {
  await page.goto('/');

  // 페이지가 로드되는지 확인
  await expect(page).toHaveURL('/');
});
