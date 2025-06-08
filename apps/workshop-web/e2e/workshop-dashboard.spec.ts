import { expect, test } from '@playwright/test';

/**
 * 정비소 앱 대시보드 및 보고서 E2E 테스트
 * 이 테스트는 정비소 앱의 대시보드 및 보고서 관련 사용자 흐름을 검증합니다.
 *
 * 테스트 시나리오:
 * 1. 로그인
 * 2. 대시보드 주요 지표 확인
 * 3. 예약 및 작업 현황 확인
 * 4. 수익 보고서 조회
 * 5. 통계 및 분석 데이터 확인
 * 6. 대시보드 설정 및 사용자 맞춤화
 */
test.describe('정비소 대시보드 및 보고서 워크플로우', () => {
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

  test('대시보드 주요 지표 확인', async ({ page }) => {
    // 대시보드 페이지에 있는지 확인
    await expect(page).toHaveURL(/.*dashboard/);

    // 대시보드 제목이 표시되는지 확인
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();

    // 주요 KPI 카드가 표시되는지 확인
    await expect(page.locator('[data-testid="kpi-cards"]')).toBeVisible();

    // 개별 KPI 카드 확인
    await expect(page.locator('[data-testid="pending-jobs-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="in-progress-jobs-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="completed-jobs-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="today-revenue-card"]')).toBeVisible();

    // 활성 정비사 상태가 표시되는지 확인
    await expect(page.locator('[data-testid="active-technicians"]')).toBeVisible();

    // 오늘의 예약 목록이 표시되는지 확인
    await expect(page.locator('[data-testid="today-bookings-list"]')).toBeVisible();

    // 알림이 표시되는지 확인
    await expect(page.locator('[data-testid="notifications-panel"]')).toBeVisible();
  });

  test('예약 및 작업 현황 확인', async ({ page }) => {
    // 대시보드 페이지에 있는지 확인
    await expect(page).toHaveURL(/.*dashboard/);

    // 작업 현황 탭으로 이동
    await page.click('[data-testid="jobs-status-tab"]');

    // 작업 현황 그래프가 표시되는지 확인
    await expect(page.locator('[data-testid="jobs-status-chart"]')).toBeVisible();

    // 정비 유형별 분포가 표시되는지 확인
    await expect(page.locator('[data-testid="repair-types-chart"]')).toBeVisible();

    // 작업 세부 내역 보기 버튼 클릭
    await page.click('[data-testid="view-jobs-details-button"]');

    // 작업 목록 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*jobs/);

    // 대시보드로 돌아가기
    await page.click('[data-testid="dashboard-nav"]');

    // 주간 일정 탭으로 이동
    await page.click('[data-testid="weekly-schedule-tab"]');

    // 주간 일정이 표시되는지 확인
    await expect(page.locator('[data-testid="weekly-calendar"]')).toBeVisible();

    // 특정 날짜의 일정 세부 정보 확인
    await page.click('[data-testid="calendar-day-0"]'); // 첫 번째 날짜 클릭

    // 해당 날짜의 일정 세부 정보가 표시되는지 확인
    await expect(page.locator('[data-testid="day-schedule-details"]')).toBeVisible();
  });

  test('수익 보고서 조회', async ({ page }) => {
    // 보고서 페이지로 이동
    await page.click('[data-testid="reports-nav"]');

    // 보고서 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*reports/);

    // 매출 보고서 탭 선택
    await page.click('[data-testid="revenue-report-tab"]');

    // 날짜 범위 선택
    await page.click('[data-testid="date-range-selector"]');
    await page.click('[data-testid="this-month-option"]');

    // 보고서 생성 버튼 클릭
    await page.click('[data-testid="generate-report-button"]');

    // 보고서가 표시되는지 확인
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-summary"]')).toBeVisible();

    // 보고서 상세 정보가 표시되는지 확인
    await expect(page.locator('[data-testid="revenue-by-service-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-by-customer"]')).toBeVisible();

    // 인쇄 버튼이 표시되는지 확인
    await expect(page.locator('[data-testid="print-report-button"]')).toBeVisible();

    // CSV 내보내기 버튼이 표시되는지 확인
    await expect(page.locator('[data-testid="export-csv-button"]')).toBeVisible();

    // 부품 매출 탭으로 전환
    await page.click('[data-testid="parts-revenue-tab"]');

    // 부품 매출 보고서가 표시되는지 확인
    await expect(page.locator('[data-testid="parts-revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="top-selling-parts"]')).toBeVisible();
  });

  test('통계 및 분석 데이터 확인', async ({ page }) => {
    // 분석 페이지로 이동
    await page.click('[data-testid="analytics-nav"]');

    // 분석 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*analytics/);

    // 기간 선택
    await page.selectOption('[data-testid="period-select"]', 'last30days');

    // 적용 버튼 클릭
    await page.click('[data-testid="apply-period-button"]');

    // 주요 통계 지표가 표시되는지 확인
    await expect(page.locator('[data-testid="avg-repair-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-satisfaction"]')).toBeVisible();
    await expect(page.locator('[data-testid="repeat-customer-rate"]')).toBeVisible();

    // 정비 유형별 통계 탭으로 이동
    await page.click('[data-testid="repair-type-stats-tab"]');

    // 정비 유형별 통계가 표시되는지 확인
    await expect(page.locator('[data-testid="repair-type-chart"]')).toBeVisible();

    // 정비사 생산성 탭으로 이동
    await page.click('[data-testid="technician-productivity-tab"]');

    // 정비사 생산성 데이터가 표시되는지 확인
    await expect(page.locator('[data-testid="technician-productivity-chart"]')).toBeVisible();

    // 세부 정보를 볼 정비사 선택
    await page.click('[data-testid="technician-0"]');

    // 선택한 정비사의 세부 성과가 표시되는지 확인
    await expect(page.locator('[data-testid="technician-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="completed-jobs-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="avg-completion-time"]')).toBeVisible();
  });

  test('대시보드 설정 및 사용자 맞춤화', async ({ page }) => {
    // 대시보드 페이지에 있는지 확인
    await expect(page).toHaveURL(/.*dashboard/);

    // 대시보드 설정 버튼 클릭
    await page.click('[data-testid="dashboard-settings-button"]');

    // 설정 모달이 표시되는지 확인
    await expect(page.locator('[data-testid="dashboard-settings-modal"]')).toBeVisible();

    // 레이아웃 설정 탭 선택
    await page.click('[data-testid="layout-settings-tab"]');

    // 위젯 표시 여부 설정
    await page.click('[data-testid="toggle-revenue-widget"]'); // 매출 위젯 토글
    await page.click('[data-testid="toggle-technician-widget"]'); // 정비사 위젯 토글

    // 저장 버튼 클릭
    await page.click('[data-testid="save-settings-button"]');

    // 설정이 적용되었는지 확인하는 알림 표시 확인
    await expect(page.locator('[data-testid="settings-saved-notification"]')).toBeVisible();

    // 페이지 새로고침
    await page.reload();

    // 대시보드가 설정에 맞게 업데이트되었는지 확인
    if (await page.locator('[data-testid="toggle-revenue-widget"]').isChecked()) {
      await expect(page.locator('[data-testid="revenue-widget"]')).toBeVisible();
    } else {
      await expect(page.locator('[data-testid="revenue-widget"]')).not.toBeVisible();
    }

    // 알림 설정 탭으로 이동
    await page.click('[data-testid="dashboard-settings-button"]');
    await page.click('[data-testid="notification-settings-tab"]');

    // 알림 설정 변경
    await page.click('[data-testid="toggle-booking-notifications"]'); // 예약 알림 토글

    // 저장 버튼 클릭
    await page.click('[data-testid="save-notification-settings-button"]');

    // 설정이 적용되었는지 확인하는 알림 표시 확인
    await expect(page.locator('[data-testid="settings-saved-notification"]')).toBeVisible();
  });
});
