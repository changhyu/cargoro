import { expect, test } from '@playwright/test';

/**
 * 정비소 앱 예약 관리 흐름 E2E 테스트
 * 이 테스트는 정비소 앱의 예약 관리 관련 사용자 흐름을 검증합니다.
 *
 * 테스트 시나리오:
 * 1. 로그인
 * 2. 예약 목록 확인
 * 3. 새 예약 등록
 * 4. 예약 상세 정보 조회
 * 5. 예약 상태 변경
 * 6. 예약 취소
 */

/**
 * 날짜를 'YYYY-MM-DD' 형식으로 변환
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

test.describe('정비소 예약 관리 워크플로우', () => {
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

  test('예약 목록 확인 및 필터링', async ({ page }) => {
    // 예약 관리 페이지로 이동
    await page.click('[data-testid="bookings-nav"]');
    await expect(page).toHaveURL(/.*bookings/);

    // 예약 목록이 표시되는지 확인
    await expect(page.locator('[data-testid="bookings-list"]')).toBeVisible();

    // 상태별 필터링 확인
    await page.selectOption('[data-testid="status-filter"]', 'requested');
    await expect(page.locator('[data-testid="bookings-list"]')).toBeVisible();

    // 날짜별 필터링 확인
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = formatDateToYYYYMMDD(tomorrow);

    await page.fill('[data-testid="date-filter"]', formattedDate);
    await page.click('[data-testid="apply-filter-button"]');

    // 필터링 결과 확인
    await expect(page.locator('[data-testid="bookings-list"]')).toBeVisible();
  });

  test('새 예약 등록 및 세부 정보 확인', async ({ page }) => {
    // 예약 관리 페이지로 이동
    await page.click('[data-testid="bookings-nav"]');

    // 새 예약 등록 버튼 클릭
    await page.click('[data-testid="new-booking-button"]');
    await expect(page).toHaveURL(/.*bookings\/new/);

    // 고객 정보 입력
    await page.fill('[data-testid="customer-search-input"]', '홍길동');
    await page.click('[data-testid="search-customer-button"]');
    await page.click('[data-testid="select-customer-0"]');

    // 차량 선택
    await page.click('[data-testid="select-vehicle-0"]');

    // 정비 유형 선택
    await page.selectOption('[data-testid="repair-type-select"]', '정기 점검');

    // 예약 날짜 및 시간 선택
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = formatDateToYYYYMMDD(tomorrow);

    await page.fill('[data-testid="preferred-date-input"]', formattedDate);
    await page.selectOption('[data-testid="preferred-time-select"]', '10:00');

    // 문제 설명 입력
    await page.fill(
      '[data-testid="description-input"]',
      '엔진 오일 교체 및 브레이크 패드 점검 필요'
    );

    // 특별 요청사항 입력
    await page.fill('[data-testid="special-requests-input"]', '가능하면 당일 완료 희망');

    // 연락처 입력
    await page.fill('[data-testid="contact-phone-input"]', '010-1234-5678');

    // 예약 생성
    await page.click('[data-testid="create-booking-button"]');

    // 예약 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*bookings\/[a-zA-Z0-9-]+$/);

    // 예약 정보가 올바르게 표시되는지 확인
    await expect(page.locator('[data-testid="booking-status"]')).toContainText('요청됨');
    await expect(page.locator('[data-testid="booking-customer"]')).toContainText('홍길동');
    await expect(page.locator('[data-testid="booking-date"]')).toContainText(formattedDate);
    await expect(page.locator('[data-testid="booking-time"]')).toContainText('10:00');
  });

  test('예약 상태 변경 및 수정', async ({ page }) => {
    // 예약 관리 페이지로 이동
    await page.click('[data-testid="bookings-nav"]');

    // 첫 번째 예약 선택
    await page.click('[data-testid="booking-item-0"]');

    // 예약 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*bookings\/[a-zA-Z0-9-]+$/);

    // 예약 상태 변경
    await page.click('[data-testid="change-status-button"]');
    await page.selectOption('[data-testid="new-status-select"]', 'confirmed');
    await page.click('[data-testid="update-status-button"]');

    // 상태가 변경되었는지 확인
    await expect(page.locator('[data-testid="booking-status"]')).toContainText('확정됨');

    // 예약 정보 수정
    await page.click('[data-testid="edit-booking-button"]');

    // 날짜 및 시간 변경
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const newDate = formatDateToYYYYMMDD(dayAfterTomorrow);

    await page.fill('[data-testid="scheduled-date-input"]', newDate);
    await page.selectOption('[data-testid="scheduled-time-select"]', '14:00');

    // 수정사항 저장
    await page.click('[data-testid="save-changes-button"]');

    // 변경된 정보가 반영되었는지 확인
    await expect(page.locator('[data-testid="booking-date"]')).toContainText(newDate);
    await expect(page.locator('[data-testid="booking-time"]')).toContainText('14:00');
  });

  test('예약 취소 프로세스', async ({ page }) => {
    // 예약 관리 페이지로 이동
    await page.click('[data-testid="bookings-nav"]');

    // 첫 번째 예약 선택
    await page.click('[data-testid="booking-item-0"]');

    // 예약 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*bookings\/[a-zA-Z0-9-]+$/);

    // 예약 취소 버튼 클릭
    await page.click('[data-testid="cancel-booking-button"]');

    // 취소 사유 입력
    await page.fill('[data-testid="cancellation-reason"]', '고객 요청으로 취소');

    // 취소 확인
    await page.click('[data-testid="confirm-cancellation-button"]');

    // 취소되었는지 확인
    await expect(page.locator('[data-testid="booking-status"]')).toContainText('취소됨');
    await expect(page.locator('[data-testid="cancellation-note"]')).toContainText(
      '고객 요청으로 취소'
    );
  });

  test('워크샵 일정 및 정비사 배정', async ({ page }) => {
    // 예약 관리 페이지로 이동
    await page.click('[data-testid="bookings-nav"]');

    // 확정된 예약 필터링
    await page.selectOption('[data-testid="status-filter"]', 'confirmed');

    // 첫 번째 확정된 예약 선택
    await page.click('[data-testid="booking-item-0"]');

    // 정비사 배정 버튼 클릭
    await page.click('[data-testid="assign-technician-button"]');

    // 가용 정비사 목록이 표시되는지 확인
    await expect(page.locator('[data-testid="available-technicians"]')).toBeVisible();

    // 첫 번째 정비사 선택
    await page.click('[data-testid="technician-0"]');

    // 정비사 배정 확인
    await page.click('[data-testid="confirm-assignment-button"]');

    // 배정된 정비사 정보가 표시되는지 확인
    await expect(page.locator('[data-testid="assigned-technician"]')).toBeVisible();

    // 정비 작업으로 변환
    await page.click('[data-testid="convert-to-job-button"]');

    // 변환 확인
    await page.click('[data-testid="confirm-conversion-button"]');

    // 정비 작업 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*jobs\/[a-zA-Z0-9-]+$/);
  });
});
