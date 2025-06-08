import { expect, test } from '@playwright/test';

/**
 * 정비소 앱 부품 및 재고 관리 흐름 E2E 테스트
 * 이 테스트는 정비소 앱의 부품 및 재고 관리 관련 사용자 흐름을 검증합니다.
 *
 * 테스트 시나리오:
 * 1. 로그인
 * 2. 부품 목록 확인 및 검색
 * 3. 부품 상세 정보 및 재고 확인
 * 4. 부품 발주 프로세스
 * 5. 정비 작업에 부품 사용
 * 6. 재고 알림 설정
 */
test.describe('정비소 부품 및 재고 관리 워크플로우', () => {
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

  test('부품 목록 확인 및 검색', async ({ page }) => {
    // 부품 관리 페이지로 이동
    await page.click('[data-testid="parts-nav"]');
    await expect(page).toHaveURL(/.*parts/);

    // 부품 목록이 표시되는지 확인
    await expect(page.locator('[data-testid="parts-list"]')).toBeVisible();

    // 부품 검색
    await page.fill('[data-testid="parts-search-input"]', '오일 필터');
    await page.click('[data-testid="search-parts-button"]');

    // 검색 결과 확인
    await expect(page.locator('[data-testid="parts-search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="parts-search-results"]')).toContainText('오일 필터');

    // 고급 검색 사용
    await page.click('[data-testid="advanced-search-toggle"]');

    // 카테고리 필터 적용
    await page.selectOption('[data-testid="category-filter"]', '엔진');
    await page.click('[data-testid="apply-filters-button"]');

    // 검색 결과가 카테고리에 맞게 필터링되었는지 확인
    await expect(page.locator('[data-testid="parts-search-results"]')).toBeVisible();

    // 재고 있는 부품만 표시
    await page.click('[data-testid="in-stock-only-checkbox"]');
    await page.click('[data-testid="apply-filters-button"]');

    // 재고 있는 부품만 표시되는지 확인
    await expect(page.locator('[data-testid="parts-search-results"]')).toBeVisible();
  });

  test('부품 상세 정보 및 재고 확인', async ({ page }) => {
    // 부품 관리 페이지로 이동
    await page.click('[data-testid="parts-nav"]');

    // 첫 번째 부품 선택
    await page.click('[data-testid="part-item-0"]');

    // 부품 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*parts\/[a-zA-Z0-9-]+$/);

    // 부품 정보가 표시되는지 확인
    await expect(page.locator('[data-testid="part-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-category"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-price"]')).toBeVisible();

    // 재고 정보가 표시되는지 확인
    await expect(page.locator('[data-testid="inventory-level"]')).toBeVisible();
    await expect(page.locator('[data-testid="reorder-point"]')).toBeVisible();
    await expect(page.locator('[data-testid="stock-location"]')).toBeVisible();

    // 재고 이력 탭으로 이동
    await page.click('[data-testid="inventory-history-tab"]');

    // 재고 이력이 표시되는지 확인
    await expect(page.locator('[data-testid="inventory-history"]')).toBeVisible();

    // 공급업체 정보 탭으로 이동
    await page.click('[data-testid="suppliers-tab"]');

    // 공급업체 정보가 표시되는지 확인
    await expect(page.locator('[data-testid="suppliers-list"]')).toBeVisible();
  });

  test('부품 발주 프로세스', async ({ page }) => {
    // 부품 관리 페이지로 이동
    await page.click('[data-testid="parts-nav"]');

    // 부품 검색
    await page.fill('[data-testid="parts-search-input"]', '브레이크 패드');
    await page.click('[data-testid="search-parts-button"]');

    // 검색 결과에서 첫 번째 부품 선택
    await page.click('[data-testid="part-search-result-0"]');

    // 부품 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*parts\/[a-zA-Z0-9-]+$/);

    // 발주 버튼 클릭
    await page.click('[data-testid="order-part-button"]');

    // 발주 모달이 표시되는지 확인
    await expect(page.locator('[data-testid="order-modal"]')).toBeVisible();

    // 발주 수량 입력
    await page.fill('[data-testid="order-quantity-input"]', '10');

    // 공급업체 선택
    await page.selectOption('[data-testid="supplier-select"]', '0'); // 첫 번째 공급업체 선택

    // 발주 생성
    await page.click('[data-testid="create-order-button"]');

    // 발주 확인 메시지가 표시되는지 확인
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();

    // 발주 내역 페이지로 이동
    await page.click('[data-testid="view-orders-button"]');

    // 발주 목록 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*orders/);

    // 발주 목록에 새 발주가 표시되는지 확인
    await expect(page.locator('[data-testid="orders-list"]')).toContainText('브레이크 패드');
  });

  test('정비 작업에 부품 사용', async ({ page }) => {
    // 정비 작업 페이지로 이동
    await page.click('[data-testid="jobs-nav"]');

    // 진행 중인 작업 탭 선택
    await page.click('[data-testid="in-progress-tab"]');

    // 첫 번째 작업 선택
    await page.click('[data-testid="job-item-0"]');

    // 작업 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*jobs\/[a-zA-Z0-9-]+$/);

    // 부품 추가 버튼 클릭
    await page.click('[data-testid="add-parts-button"]');

    // 부품 검색 모달이 표시되는지 확인
    await expect(page.locator('[data-testid="parts-search-modal"]')).toBeVisible();

    // 부품 검색
    await page.fill('[data-testid="modal-parts-search-input"]', '오일');
    await page.click('[data-testid="modal-search-button"]');

    // 검색 결과에서 첫 번째 부품 선택
    await page.click('[data-testid="select-part-button-0"]');

    // 수량 입력
    await page.fill('[data-testid="part-quantity-input"]', '1');

    // 부품 추가 확인
    await page.click('[data-testid="confirm-add-part-button"]');

    // 작업 상세 페이지로 돌아왔는지 확인
    await expect(page).toHaveURL(/.*jobs\/[a-zA-Z0-9-]+$/);

    // 추가된 부품이 작업에 표시되는지 확인
    await expect(page.locator('[data-testid="job-parts-list"]')).toContainText('오일');

    // 작업 완료 버튼 클릭
    await page.click('[data-testid="complete-job-button"]');

    // 완료 확인 모달
    await page.click('[data-testid="confirm-completion-button"]');

    // 작업이 완료되었는지 확인
    await expect(page.locator('[data-testid="job-status"]')).toContainText('완료');

    // 부품 재고가 감소했는지 확인하기 위해 부품 페이지로 이동
    await page.click('[data-testid="parts-nav"]');

    // 부품 검색
    await page.fill('[data-testid="parts-search-input"]', '오일');
    await page.click('[data-testid="search-parts-button"]');

    // 검색 결과에서 첫 번째 부품 선택
    await page.click('[data-testid="part-search-result-0"]');

    // 부품 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*parts\/[a-zA-Z0-9-]+$/);

    // 재고 이력에 사용 내역이 표시되는지 확인
    await page.click('[data-testid="inventory-history-tab"]');
    await expect(page.locator('[data-testid="inventory-history"]')).toContainText('사용');
  });

  test('재고 알림 설정', async ({ page }) => {
    // 부품 관리 페이지로 이동
    await page.click('[data-testid="parts-nav"]');

    // 설정 탭으로 이동
    await page.click('[data-testid="inventory-settings-tab"]');

    // 재고 알림 설정이 표시되는지 확인
    await expect(page.locator('[data-testid="inventory-alerts-settings"]')).toBeVisible();

    // 자동 발주 기준점 설정
    await page.fill('[data-testid="global-reorder-point-input"]', '5');

    // 저장
    await page.click('[data-testid="save-settings-button"]');

    // 저장 확인 메시지 확인
    await expect(page.locator('[data-testid="settings-saved-message"]')).toBeVisible();

    // 개별 부품 알림 설정
    await page.click('[data-testid="inventory-tab"]'); // 재고 탭으로 돌아가기
    await page.fill('[data-testid="parts-search-input"]', '브레이크 패드');
    await page.click('[data-testid="search-parts-button"]');
    await page.click('[data-testid="part-search-result-0"]');

    // 부품 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*parts\/[a-zA-Z0-9-]+$/);

    // 재고 설정 버튼 클릭
    await page.click('[data-testid="edit-inventory-settings-button"]');

    // 해당 부품의 발주 기준점 설정
    await page.fill('[data-testid="part-reorder-point-input"]', '10');

    // 저장
    await page.click('[data-testid="save-part-settings-button"]');

    // 설정이 적용되었는지 확인
    await expect(page.locator('[data-testid="reorder-point"]')).toContainText('10');

    // 재고 부족 부품 리포트 확인
    await page.click('[data-testid="parts-nav"]'); // 부품 메인 페이지로 돌아가기
    await page.click('[data-testid="low-stock-report-button"]');

    // 재고 부족 리포트가 표시되는지 확인
    await expect(page.locator('[data-testid="low-stock-report"]')).toBeVisible();
  });
});
