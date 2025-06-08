/**
 * 배송 기사 앱 환경 설정
 * 개발 및 배포 환경에서 사용되는 설정 값들입니다.
 */

// 배포 환경별 API URL
const API_URLS = {
  development: 'https://dev-api.cargoro.co.kr/driver',
  staging: 'https://staging-api.cargoro.co.kr/driver',
  production: 'https://api.cargoro.co.kr/driver',
};

// 현재 환경 확인 (개발 모드일 경우 development, 아닐 경우 production으로 기본 설정)
const ENVIRONMENT = __DEV__ ? 'development' : 'production';

// 앱 설정
const Config = {
  // API 기본 URL
  API_BASE_URL: API_URLS[ENVIRONMENT as keyof typeof API_URLS],

  // 이미지 및 미디어 URL 기본 경로
  MEDIA_BASE_URL: `https://media.cargoro.co.kr/${ENVIRONMENT}`,

  // 위치 추적 설정
  LOCATION_TRACKING: {
    // 위치 업데이트 간격 (밀리초)
    UPDATE_INTERVAL: 60000, // 1분
    // 위치 정보 정확도 (미터)
    ACCURACY: 10,
    // 거리 필터 (미터) - 이 거리 이상 이동했을 때만 위치 업데이트
    DISTANCE_FILTER: 50,
  },

  // 앱 버전
  APP_VERSION: '1.0.0', // React Native에서는 expo-constants를 사용하여 버전 정보를 가져올 수 있습니다
};

export default Config;
