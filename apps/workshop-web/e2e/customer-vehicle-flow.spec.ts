import { expect, test } from '@playwright/test';

/**
 * 정비소 앱 고객 및 차량 관리 흐름 E2E 테스트
 * 이 테스트는 정비소 앱의 고객 및 차량 관리 관련 사용자 흐름을 검증합니다.
 *
 * 테스트 시나리오:
 * 1. 로그인
 * 2. 새 고객 등록
 * 3. 고객에 차량 추가
 * 4. 차량 정보 조회 및 수정
 * 5. 차량 정비 이력 조회
 * 6. 고객 및 차량 검색
 */
test.describe('정비소 고객 및 차량 관리 워크플로우', () => {
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

  test('새 고객 등록 및 정보 확인', async ({ page }) => {
    // 고객 관리 페이지로 이동
    await page.click('[data-testid="customers-nav"]');
    await expect(page).toHaveURL(/.*customers/);

    // 새 고객 등록 버튼 클릭
    await page.click('[data-testid="new-customer-button"]');
    await expect(page).toHaveURL(/.*customers\/new/);

    // 고객 정보 입력
    await page.fill('[data-testid="customer-name-input"]', '김테스트');
    await page.fill('[data-testid="customer-phone-input"]', '010-9876-5432');
    await page.fill('[data-testid="customer-email-input"]', 'test.kim@example.com');
    await page.fill('[data-testid="customer-address-input"]', '서울시 강남구 테헤란로 123');

    // 고객 생성 버튼 클릭
    await page.click('[data-testid="create-customer-button"]');

    // 고객 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*customers\/[a-zA-Z0-9-]+$/);

    // 생성된 고객 정보가 올바르게 표시되는지 확인
    await expect(page.locator('[data-testid="customer-name"]')).toContainText('김테스트');
    await expect(page.locator('[data-testid="customer-phone"]')).toContainText('010-9876-5432');
    await expect(page.locator('[data-testid="customer-email"]')).toContainText(
      'test.kim@example.com'
    );
  });

  test('고객에 새 차량 추가', async ({ page }) => {
    // 고객 관리 페이지로 이동
    await page.click('[data-testid="customers-nav"]');

    // 고객 검색
    await page.fill('[data-testid="customer-search-input"]', '김테스트');
    await page.click('[data-testid="search-customer-button"]');

    // 검색 결과에서 첫 번째 고객 선택
    await page.click('[data-testid="customer-item-0"]');

    // 고객 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*customers\/[a-zA-Z0-9-]+$/);

    // 차량 추가 버튼 클릭
    await page.click('[data-testid="add-vehicle-button"]');

    // 차량 정보 입력
    await page.fill('[data-testid="vehicle-license-plate"]', '12가3456');
    await page.fill('[data-testid="vehicle-manufacturer"]', '현대');
    await page.fill('[data-testid="vehicle-model"]', '아반떼');
    await page.fill('[data-testid="vehicle-year"]', '2020');
    await page.fill('[data-testid="vehicle-vin"]', 'KMHXX00X0XX000123');
    await page.selectOption('[data-testid="vehicle-type"]', '승용차');
    await page.selectOption('[data-testid="vehicle-fuel"]', '가솔린');

    // 차량 등록 버튼 클릭
    await page.click('[data-testid="register-vehicle-button"]');

    // 차량 목록에 새 차량이 추가되었는지 확인
    await expect(page.locator('[data-testid="vehicles-list"]')).toContainText('12가3456');
    await expect(page.locator('[data-testid="vehicles-list"]')).toContainText('현대');
    await expect(page.locator('[data-testid="vehicles-list"]')).toContainText('아반떼');
  });

  test('차량 정보 조회 및 수정', async ({ page }) => {
    // 고객 관리 페이지로 이동
    await page.click('[data-testid="customers-nav"]');

    // 고객 검색
    await page.fill('[data-testid="customer-search-input"]', '김테스트');
    await page.click('[data-testid="search-customer-button"]');

    // 검색 결과에서 첫 번째 고객 선택
    await page.click('[data-testid="customer-item-0"]');

    // 차량 목록에서 첫 번째 차량 선택
    await page.click('[data-testid="vehicle-item-0"]');

    // 차량 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*vehicles\/[a-zA-Z0-9-]+$/);

    // 차량 정보가 올바르게 표시되는지 확인
    await expect(page.locator('[data-testid="vehicle-license"]')).toContainText('12가3456');
    await expect(page.locator('[data-testid="vehicle-make-model"]')).toContainText('현대 아반떼');

    // 차량 정보 수정 버튼 클릭
    await page.click('[data-testid="edit-vehicle-button"]');

    // 주행거리 업데이트
    await page.fill('[data-testid="vehicle-mileage"]', '15000');

    // 변경사항 저장
    await page.click('[data-testid="save-vehicle-button"]');

    // 업데이트된 정보가 반영되었는지 확인
    await expect(page.locator('[data-testid="vehicle-mileage"]')).toContainText('15,000 km');
  });

  test('차량 정비 이력 조회', async ({ page }) => {
    // 차량 검색 페이지로 이동
    await page.click('[data-testid="vehicles-nav"]');

    // 차량 검색
    await page.fill('[data-testid="vehicle-search-input"]', '12가3456');
    await page.click('[data-testid="search-vehicle-button"]');

    // 검색 결과에서 첫 번째 차량 선택
    await page.click('[data-testid="vehicle-result-0"]');

    // 차량 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*vehicles\/[a-zA-Z0-9-]+$/);

    // 정비 이력 탭 클릭
    await page.click('[data-testid="maintenance-history-tab"]');

    // 정비 이력이 표시되는지 확인
    await expect(page.locator('[data-testid="maintenance-history-list"]')).toBeVisible();

    // 새 정비 작업 등록 버튼 클릭
    await page.click('[data-testid="new-repair-job-button"]');

    // 정비 작업 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*jobs\/new\?vehicleId=[a-zA-Z0-9-]+$/);

    // 정비 유형 선택
    await page.selectOption('[data-testid="service-type-select"]', '정기 점검');

    // 정비 설명 입력
    await page.fill('[data-testid="service-description"]', '엔진 오일 교체 및 브레이크 패드 점검');

    // 정비 작업 등록
    await page.click('[data-testid="submit-job-button"]');

    // 작업 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*jobs\/[a-zA-Z0-9-]+$/);

    // 차량 페이지로 돌아가기
    await page.click('[data-testid="back-to-vehicle-button"]');

    // 정비 이력 목록에 새 작업이 추가되었는지 확인
    await expect(page.locator('[data-testid="maintenance-history-list"]')).toContainText(
      '정기 점검'
    );
  });

  test('고객 및 차량 검색 고급 기능', async ({ page }) => {
    // 고객 관리 페이지로 이동
    await page.click('[data-testid="customers-nav"]');

    // 고급 검색 버튼 클릭
    await page.click('[data-testid="advanced-search-button"]');

    // 검색 필터 설정
    await page.fill('[data-testid="search-input"]', '김');
    await page.selectOption('[data-testid="search-field"]', 'name');
    await page.click('[data-testid="apply-filter-button"]');

    // 검색 결과 확인
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-results"]')).toContainText('김');

    // 차량으로 고객 검색
    await page.click('[data-testid="search-by-vehicle-tab"]');
    await page.fill('[data-testid="vehicle-search-input"]', '12가');
    await page.click('[data-testid="search-vehicle-button"]');

    // 검색 결과 확인
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-results"]')).toContainText('12가');

    // 첫 번째 결과 선택
    await page.click('[data-testid="search-result-0"]');

    // 고객 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*customers\/[a-zA-Z0-9-]+$/);

    // 고객 정보가 올바르게 표시되는지 확인
    await expect(page.locator('[data-testid="customer-name"]')).toBeVisible();
  });
});
