// 이 파일은 @cargoro/reporting/server 모듈의 모의 버전입니다.
// 실제 구현에서는 적절한 로직이 필요합니다.

/**
 * 비동기적으로 보고서를 생성하는 함수 (백그라운드 작업)
 */
export async function generateReportAsync(request, onProgress, onComplete, onError) {
  try {
    // 더미 구현
    // TODO: 실제 보고서 생성 로직 구현
    // 디버깅 로그는 프로덕션에서 제거

    // 진행률 업데이트 시뮬레이션
    if (onProgress) {
      setTimeout(() => onProgress(30), 500);
      setTimeout(() => onProgress(60), 1000);
      setTimeout(() => onProgress(100), 1500);
    }

    // 완료 처리 시뮬레이션
    if (onComplete) {
      setTimeout(() => onComplete(`/tmp/report-${Date.now()}.pdf`), 2000);
    }
  } catch (error) {
    // 에러 처리
    if (onError) {
      onError(error instanceof Error ? error : new Error('알 수 없는 오류'));
    }
  }
}
