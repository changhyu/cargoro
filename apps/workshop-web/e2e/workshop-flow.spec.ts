import { expect, test } from '@playwright/test';

/**
 * 정비소 앱 주요 사용자 흐름 E2E 테스트
 * 이 테스트는 정비소 앱의 주요 사용자 흐름을 검증합니다.
 *
 * 테스트 시나리오:
 * 1. 로그인
 * 2. 대시보드 확인
 * 3. 새 정비 작업 등록
 * 4. 부품 검색 및 추가
 * 5. 정비 작업 완료
 */
test.describe('정비소 핵심 워크플로우', () => {
  // 로그인 상태 유지를 위해 각 테스트에서 사용할 상태 저장
  test.beforeEach(async ({ page }) => {
    // 테스트 사용자로 로그인
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test-mechanic@cargoro.test');
    await page.fill('[data-testid="password-input"]', 'test-password');
    await page.click('[data-testid="login-button"]');

    // 대시보드로 리디렉션 확인
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('대시보드에서 작업 현황 확인', async ({ page }) => {
    // 대시보드에서 주요 정보가 표시되는지 확인
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-jobs"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-jobs"]')).toBeVisible();
    await expect(page.locator('[data-testid="completed-jobs"]')).toBeVisible();

    // 오늘의 일정이 표시되는지 확인
    await expect(page.locator('[data-testid="today-schedule"]')).toBeVisible();
  });

  test('새 정비 작업 등록 및 완료', async ({ page }) => {
    // 새 정비 작업 등록 페이지로 이동
    await page.click('[data-testid="new-job-button"]');
    await expect(page).toHaveURL(/.*jobs\/new/);

    // 차량 정보 입력
    await page.fill('[data-testid="license-plate-input"]', '12가3456');
    await page.click('[data-testid="search-vehicle-button"]');

    // 차량 정보가 조회되었는지 확인
    await expect(page.locator('[data-testid="vehicle-info"]')).toBeVisible();

    // 정비 유형 선택
    await page.selectOption('[data-testid="service-type-select"]', '정기 점검');

    // 정비 설명 입력
    await page.fill('[data-testid="service-description"]', '엔진 오일 교체 및 브레이크 패드 점검');

    // 부품 검색 및 추가
    await page.click('[data-testid="add-parts-button"]');
    await page.fill('[data-testid="parts-search-input"]', '엔진 오일');
    await page.click('[data-testid="search-parts-button"]');

    // 검색 결과에서 첫 번째 부품 추가
    await page.click('[data-testid="select-part-0"]');
    await page.fill('[data-testid="part-quantity-input"]', '1');
    await page.click('[data-testid="add-to-job-button"]');

    // 정비 작업 등록
    await page.click('[data-testid="submit-job-button"]');

    // 작업 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*jobs\/[a-zA-Z0-9-]+$/);

    // 작업 시작
    await page.click('[data-testid="start-job-button"]');
    await expect(page.locator('[data-testid="job-status"]')).toContainText('진행 중');

    // 작업 단계 완료 체크
    await page.click('[data-testid="step-1-complete"]');
    await page.click('[data-testid="step-2-complete"]');

    // 정비 작업 완료
    await page.click('[data-testid="complete-job-button"]');

    // 완료 확인 모달
    await page.click('[data-testid="confirm-completion"]');

    // 작업 상태가 완료로 변경되었는지 확인
    await expect(page.locator('[data-testid="job-status"]')).toContainText('완료');

    // 결제 정보가 표시되는지 확인
    await expect(page.locator('[data-testid="payment-information"]')).toBeVisible();
  });

  test('고객 검색 및 차량 이력 조회', async ({ page }) => {
    // 고객 검색 페이지로 이동
    await page.click('[data-testid="customers-nav"]');

    // 고객 검색
    await page.fill('[data-testid="customer-search-input"]', '홍길동');
    await page.click('[data-testid="search-customer-button"]');

    // 검색 결과에서 첫 번째 고객 선택
    await page.click('[data-testid="customer-0"]');

    // 고객 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*customers\/[a-zA-Z0-9-]+$/);

    // 고객의 차량 목록이 표시되는지 확인
    await expect(page.locator('[data-testid="vehicles-list"]')).toBeVisible();

    // 첫 번째 차량 선택
    await page.click('[data-testid="vehicle-0"]');

    // 차량 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*vehicles\/[a-zA-Z0-9-]+$/);

    // 정비 이력이 표시되는지 확인
    await expect(page.locator('[data-testid="maintenance-history"]')).toBeVisible();
  });

  test('부품 재고 확인 및 발주', async ({ page }) => {
    // 부품 관리 페이지로 이동
    await page.click('[data-testid="parts-nav"]');

    // 부품 검색
    await page.fill('[data-testid="parts-search-input"]', '브레이크 패드');
    await page.click('[data-testid="search-parts-button"]');

    // 검색 결과에서 첫 번째 부품 선택
    await page.click('[data-testid="part-0"]');

    // 부품 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*parts\/[a-zA-Z0-9-]+$/);

    // 재고가 표시되는지 확인
    await expect(page.locator('[data-testid="inventory-level"]')).toBeVisible();

    // 부품 발주
    await page.click('[data-testid="order-part-button"]');
    await page.fill('[data-testid="order-quantity"]', '5');
    await page.click('[data-testid="submit-order"]');

    // 발주 성공 메시지 확인
    await expect(page.locator('[data-testid="order-success-message"]')).toBeVisible();
  });
});
