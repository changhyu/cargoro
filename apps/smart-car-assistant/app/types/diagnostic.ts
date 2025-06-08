/**
 * 차량 진단 관련 타입 정의
 */

/**
 * 진단 결과 심각도 레벨
 */
export type DiagnosticSeverity = 'low' | 'medium' | 'high';

/**
 * 진단 결과 타입
 */
export interface DiagnosticResult {
  /** 진단 코드 (예: P0300, B1000 등) */
  code: string;

  /** 진단 결과 설명 */
  description: string;

  /** 문제의 심각도 */
  severity: DiagnosticSeverity;

  /** 권장 조치 사항 */
  recommendedAction: string;
}

/**
 * 진단 기록 타입
 */
export interface DiagnosticHistory {
  /** 진단 기록 ID */
  id: string;

  /** 진단 일시 */
  date: string;

  /** 차량 ID */
  vehicleId: string;

  /** 진단 결과 목록 */
  results: DiagnosticResult[];
}

/**
 * 진단 요청 파라미터
 */
export interface DiagnosticRequest {
  /** 차량 ID */
  vehicleId: string;

  /** 진단 유형 (전체 또는 특정 시스템) */
  type?: 'full' | 'engine' | 'transmission' | 'abs' | 'srs';
}

/**
 * 진단 요청 응답
 */
export interface DiagnosticResponse {
  /** 진단 세션 ID */
  sessionId: string;

  /** 진단 결과 목록 */
  results: DiagnosticResult[];

  /** 진단 완료 여부 */
  completed: boolean;

  /** 진단 완료 시간 (초) */
  duration: number;
}
