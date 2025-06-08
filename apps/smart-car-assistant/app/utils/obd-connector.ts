/**
 * OBD 연결 및 차량 데이터 관련 유틸리티 함수들
 */
import { OBDConnector, getCurrentLocation as getGPSLocation } from '@cargoro/gps-obd-lib';

/**
 * 진단 데이터 타입 정의
 */
interface DiagnosticData {
  rpm: number;
  speed: number;
  engineTemp: number;
  fuelLevel: number;
  diagnosticTroubleCodes: string[];
}

// OBD 커넥터 인스턴스
let obdConnector: OBDConnector | null = null;

/**
 * OBD 모듈에 연결
 * @returns {Promise<boolean>} 연결 성공 여부
 */
export async function connectToOBD(): Promise<boolean> {
  try {
    obdConnector = new OBDConnector({ autoConnect: false });
    return await obdConnector.connect();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('OBD 연결 실패:', error);
    throw error; // 에러를 그대로 전파하여 테스트가 실패 케이스를 확인할 수 있도록 함
  }
}

/**
 * OBD 모듈에서 진단 데이터 가져오기
 * @returns {Promise<DiagnosticData>} 진단 데이터 객체
 */
export async function getDiagnosticData(): Promise<DiagnosticData> {
  if (!obdConnector) {
    throw new Error('OBD not connected');
  }

  const data = await obdConnector.getData();
  const diagnosticCodes = await obdConnector.scanDiagnosticCodes();

  return {
    rpm: data.rpm || 0,
    speed: data.speed || 0,
    engineTemp: data.engineTemp || 0,
    fuelLevel: data.fuelLevel || 0,
    diagnosticTroubleCodes: diagnosticCodes || [],
  };
}

/**
 * 차량 상태 분석
 * @returns {Promise<{isEngineRunning: boolean, isMoving: boolean, isFuelLow: boolean}>} 차량 상태 정보
 */
export async function getVehicleStatus(): Promise<{
  isEngineRunning: boolean;
  isMoving: boolean;
  isFuelLow: boolean;
}> {
  const data = await getDiagnosticData();

  return {
    isEngineRunning: data.rpm > 0,
    isMoving: data.speed > 0,
    isFuelLow: data.fuelLevel < 20, // 20% 미만이면 연료 부족으로 간주
  };
}

/**
 * OBD 모듈과의 연결 해제
 */
export async function disconnectFromOBD(): Promise<boolean> {
  if (obdConnector) {
    await obdConnector.disconnect();
    obdConnector = null;
  }
  return true;
}

/**
 * 현재 위치 가져오기
 */
export async function getCurrentLocation() {
  return await getGPSLocation();
}

// 기존 코드와의 호환성을 위한 별칭
export {
  connectToOBD as connectOBD,
  getDiagnosticData as readDiagnosticData,
  disconnectFromOBD as disconnectOBD,
};
