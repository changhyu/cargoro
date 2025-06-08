import { DiagnosticResult } from '../types/diagnostic';
import { api } from './api-client';

/**
 * 차량 진단 관련 API 호출 로직
 */

/**
 * 차량 ID로 진단 데이터 조회
 * @param vehicleId 차량 식별자
 * @returns 진단 결과 목록
 */
export const getDiagnosticData = async (vehicleId: string): Promise<DiagnosticResult[]> => {
  try {
    const response = await api.get(`/api/vehicle/${vehicleId}/diagnostics`);
    return response.data;
  } catch (error) {
    console.error('진단 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * 새로운 차량 진단 요청
 * @param vehicleId 차량 식별자
 * @returns 진단 결과
 */
export const startDiagnosis = async (vehicleId: string): Promise<DiagnosticResult[]> => {
  try {
    const response = await api.post(`/api/vehicle/${vehicleId}/diagnostics/scan`);
    return response.data;
  } catch (error) {
    console.error('진단 요청 실패:', error);
    throw error;
  }
};

/**
 * 진단 기록 저장
 * @param vehicleId 차량 식별자
 * @param results 진단 결과
 * @returns 저장 결과
 */
export const saveDiagnosticResults = async (
  vehicleId: string,
  results: DiagnosticResult[]
): Promise<{ success: boolean; id: string }> => {
  try {
    const response = await api.post(`/api/vehicle/${vehicleId}/diagnostics/save`, { results });
    return response.data;
  } catch (error) {
    console.error('진단 결과 저장 실패:', error);
    throw error;
  }
};

/**
 * 진단 기록 조회
 * @param vehicleId 차량 식별자
 * @param limit 조회 개수 제한
 * @returns 진단 기록 목록
 */
export const getDiagnosticHistory = async (
  vehicleId: string,
  limit: number = 10
): Promise<Array<{ id: string; date: string; results: DiagnosticResult[] }>> => {
  try {
    const response = await api.get(`/api/vehicle/${vehicleId}/diagnostics/history?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('진단 기록 조회 실패:', error);
    throw error;
  }
};

/**
 * 모의 진단 데이터 생성 (개발 테스트용)
 * @param severity 심각도 레벨
 * @returns 모의 진단 결과
 */
export const getMockDiagnosticData = (
  severity: 'low' | 'medium' | 'high' = 'medium'
): DiagnosticResult[] => {
  const mockResults: DiagnosticResult[] = [];

  if (severity === 'high' || severity === 'medium') {
    mockResults.push({
      code: 'P0300',
      description: '랜덤/다중 실린더 실화 감지됨',
      severity: 'high',
      recommendedAction: '점화 시스템 점검 필요',
    });
  }

  if (severity === 'medium' || severity === 'low') {
    mockResults.push({
      code: 'P0171',
      description: '연료 시스템 농도 희박 - 뱅크 1',
      severity: 'medium',
      recommendedAction: '연료 시스템 및 센서 점검 필요',
    });
  }

  if (severity === 'low') {
    mockResults.push({
      code: 'P0456',
      description: '증발 배출 시스템 소량 누출 감지',
      severity: 'low',
      recommendedAction: '연료 캡 점검 필요',
    });
  }

  return mockResults;
};
