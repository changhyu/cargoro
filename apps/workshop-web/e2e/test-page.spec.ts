import { test, expect } from '@playwright/test';

test('테스트 페이지가 정상적으로 로드되는지 확인', async ({ page }) => {
  // 테스트 페이지로 명확하게 URL 지정하여 이동
  await page.goto('/test');

  // 페이지 제목 확인
  const title = page.getByRole('heading', { name: 'CarGoro 테스트 페이지' });
  await expect(title).toBeVisible();
});

test('카운터가 정상적으로 동작하는지 확인', async ({ page }) => {
  // 테스트 페이지로 이동
  await page.goto('/test');

  // 초기 카운터 값 확인
  const counterValue = page.getByTestId('count-value');
  await expect(counterValue).toContainText('카운터: 0');

  // 증가 버튼 클릭
  const incrementButton = page.getByTestId('increment-button');
  await incrementButton.click();

  // 증가 후 카운터 값 확인
  await expect(counterValue).toContainText('카운터: 1');

  // 감소 버튼 클릭
  const decrementButton = page.getByTestId('decrement-button');
  await decrementButton.click();

  // 감소 후 카운터 값 확인
  await expect(counterValue).toContainText('카운터: 0');
});
