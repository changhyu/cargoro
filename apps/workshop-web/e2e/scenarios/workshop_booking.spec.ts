import { test, expect } from '@playwright/test';

test.describe('정비소 예약 시나리오', () => {
  // 로그인 상태를 유지하기 위한 설정
  test.use({ storageState: 'e2e/.auth/workshop-user.json' });

  test('새로운 정비 예약 생성', async ({ page }) => {
    // 예약 페이지로 이동
    await page.goto('http://localhost:3000/dashboard/appointments/new');

    // 고객 정보 입력
    await page.fill('input[name="customerName"]', '홍길동');
    await page.fill('input[name="customerPhone"]', '010-1234-5678');
    await page.fill('input[name="customerEmail"]', 'hong@example.com');

    // 차량 정보 입력
    await page.selectOption('select[name="vehicleBrand"]', '현대');
    await page.selectOption('select[name="vehicleModel"]', '아반떼');
    await page.fill('input[name="vehicleNumber"]', '12가 3456');
    await page.fill('input[name="vehicleYear"]', '2022');

    // 정비 유형 선택
    await page.check('input[value="정기점검"]');
    await page.check('input[value="엔진오일 교환"]');

    // 예약 날짜 및 시간 선택
    await page.click('input[name="appointmentDate"]');
    // 달력에서 다음 주 월요일 선택
    await page.click('.calendar-day.available:first-child');

    // 시간 선택
    await page.selectOption('select[name="appointmentTime"]', '10:00');

    // 추가 요청사항
    await page.fill('textarea[name="notes"]', '브레이크 소음 점검 부탁드립니다.');

    // 예약 제출
    await page.click('button[type="submit"]');

    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toContainText('예약이 성공적으로 등록되었습니다');

    // 예약 상세 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/.*appointments\/[a-zA-Z0-9]+/);
  });

  test('예약 목록 조회 및 필터링', async ({ page }) => {
    // 예약 목록 페이지로 이동
    await page.goto('http://localhost:3000/dashboard/appointments');

    // 예약 목록이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="appointment-list"]');

    // 날짜 필터 적용
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-12-31');

    // 상태 필터 적용
    await page.selectOption('select[name="status"]', '진행중');

    // 검색 버튼 클릭
    await page.click('button[data-testid="search-button"]');

    // 필터된 결과 확인
    const appointments = await page.locator('[data-testid="appointment-item"]').count();
    expect(appointments).toBeGreaterThan(0);

    // 모든 항목이 '진행중' 상태인지 확인
    const statuses = await page.locator('[data-testid="appointment-status"]').allTextContents();
    statuses.forEach(status => {
      expect(status).toBe('진행중');
    });
  });

  test('예약 상세 정보 수정', async ({ page }) => {
    // 특정 예약 상세 페이지로 이동
    await page.goto('http://localhost:3000/dashboard/appointments/123');

    // 수정 버튼 클릭
    await page.click('button[data-testid="edit-appointment"]');

    // 정비 항목 추가
    await page.check('input[value="타이어 교체"]');

    // 예상 비용 입력
    await page.fill('input[name="estimatedCost"]', '150000');

    // 정비 기사 배정
    await page.selectOption('select[name="mechanicId"]', 'mechanic-001');

    // 저장
    await page.click('button[data-testid="save-changes"]');

    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toContainText('예약이 성공적으로 수정되었습니다');
  });

  test('예약 취소', async ({ page }) => {
    // 예약 상세 페이지로 이동
    await page.goto('http://localhost:3000/dashboard/appointments/456');

    // 취소 버튼 클릭
    await page.click('button[data-testid="cancel-appointment"]');

    // 취소 사유 입력 모달 확인
    await expect(page.locator('[data-testid="cancel-modal"]')).toBeVisible();

    // 취소 사유 입력
    await page.selectOption('select[name="cancelReason"]', '고객 요청');
    await page.fill('textarea[name="cancelNote"]', '일정 변경으로 인한 취소');

    // 취소 확인
    await page.click('button[data-testid="confirm-cancel"]');

    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toContainText('예약이 취소되었습니다');

    // 상태가 '취소됨'으로 변경되었는지 확인
    await expect(page.locator('[data-testid="appointment-status"]')).toContainText('취소됨');
  });

  test('정비 완료 처리', async ({ page }) => {
    // 진행 중인 정비 상세 페이지로 이동
    await page.goto('http://localhost:3000/dashboard/appointments/789');

    // 정비 완료 버튼 클릭
    await page.click('button[data-testid="complete-repair"]');

    // 정비 완료 정보 입력
    await page.fill('textarea[name="repairDetails"]', '엔진오일 교환 완료, 브레이크 패드 교체');
    await page.fill('input[name="actualCost"]', '180000');

    // 부품 사용 내역 추가
    await page.click('button[data-testid="add-part"]');
    await page.fill('input[name="partName"]', '엔진오일 5W-30');
    await page.fill('input[name="partQuantity"]', '4');
    await page.fill('input[name="partPrice"]', '50000');

    // 사진 업로드 (선택사항)
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/repair-complete.jpg');

    // 완료 처리
    await page.click('button[data-testid="confirm-complete"]');

    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toContainText('정비가 완료되었습니다');

    // 인보이스 생성 확인
    await expect(page.locator('[data-testid="invoice-link"]')).toBeVisible();
  });
});
