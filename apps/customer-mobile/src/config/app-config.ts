/**
 * 개발 환경에서 모의 데이터를 사용할지 여부를 결정하는 설정
 */

// 모의 데이터 사용 여부 설정
export const USE_MOCK_DATA = true;

// 백엔드 서버 URL 설정
export const API_BASE_URL =
  (process.env as { EXPO_PUBLIC_API_URL?: string }).EXPO_PUBLIC_API_URL ||
  'http://localhost:3000/api';

// 네트워크 요청 시간 초과 설정 (밀리초)
export const API_TIMEOUT = 5000;

// 모의 데이터 지연 시간 설정 (ms) - 실제 네트워크 요청처럼 느끼게 하기 위함
export const MOCK_DATA_DELAY = 300;

/**
 * 모의 데이터로 응답을 만드는 유틸리티 함수
 * @param data 반환할 모의 데이터
 * @returns 지정된 지연 후 모의 데이터를 반환하는 Promise
 */
export function mockResponse<T>(data: T): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, MOCK_DATA_DELAY);
  });
}
