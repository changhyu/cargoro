import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

// 사용자 정의 메트릭
const errorRate = new Rate('errors');
const apiTrend = new Trend('api_trend');

// 테스트 설정
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // 서서히 트래픽 증가
    { duration: '1m', target: 50 }, // 로드 증가
    { duration: '30s', target: 100 }, // 피크 부하
    { duration: '1m', target: 50 }, // 정상 부하로 감소
    { duration: '30s', target: 0 }, // 서서히 종료
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95%는 500ms 이내, 99%는 1000ms 이내
    'http_req_duration{endpoint:publicAPI}': ['p(95)<400'], // 공개 API는 더 빠른 응답 요구
    errors: ['rate<0.1'], // 오류율 10% 미만
    http_reqs: ['count>100'], // 최소 100개 요청 실행
  },
};

// 엔드포인트 정의
const API_BASE_URL = __ENV.K6_BASE_URL || 'https://api.cargoro.com';
const ENDPOINTS = {
  public: ['/api/vehicles', '/api/services', '/api/workshops'],
  authenticated: ['/api/user/profile', '/api/user/appointments', '/api/user/vehicles'],
  admin: ['/api/admin/users', '/api/admin/reports', '/api/admin/stats'],
};

// 자주 사용되는 헤더
const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// 테스트용 더미 토큰 (실제 환경에서는 환경변수로 주입)
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'dummy-auth-token-for-testing';

// 인증 정보 헤더 포함
const AUTH_HEADERS = {
  ...COMMON_HEADERS,
  Authorization: `Bearer ${AUTH_TOKEN}`,
};

// 테스트 시나리오 정의 함수
export function setup() {
  // 설정 단계에서 필요한 데이터를 준비
  console.log(`API 부하 테스트 시작: ${API_BASE_URL}`);

  // 사용자 인증 시도 (선택적)
  const loginResp = http.post(
    `${API_BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: 'test@example.com',
      password: 'testPassword123',
    }),
    {
      headers: COMMON_HEADERS,
    }
  );

  // 실패해도 계속 진행 (실제 환경에서는 실패 처리 로직 추가)
  check(loginResp, {
    'login status is 200': r => r.status === 200,
  });

  // 실제 환경에서는 토큰 추출 및 사용
  // const authToken = loginResp.json('token');

  return {
    // setup에서 생성한 데이터를 테스트에 전달
    token: AUTH_TOKEN,
  };
}

// 기본 테스트 시나리오
export default function (data) {
  // 1. 공개 API 요청 (인증 불필요)
  const publicEndpoint = randomItem(ENDPOINTS.public);
  const publicResp = http.get(`${API_BASE_URL}${publicEndpoint}`, {
    headers: COMMON_HEADERS,
    tags: { endpoint: 'publicAPI' },
  });

  check(publicResp, {
    'status is 200': r => r.status === 200,
  }) || errorRate.add(1);

  apiTrend.add(publicResp.timings.duration, { endpoint: publicEndpoint });

  sleep(1);

  // 2. 인증된 API 요청 (토큰 필요)
  if (data.token) {
    const authEndpoint = randomItem(ENDPOINTS.authenticated);
    const authResp = http.get(`${API_BASE_URL}${authEndpoint}`, {
      headers: AUTH_HEADERS,
      tags: { endpoint: 'authAPI' },
    });

    check(authResp, {
      'auth status is 200': r => r.status === 200,
      'auth response has data': r => r.json('data') !== undefined,
    }) || errorRate.add(1);

    apiTrend.add(authResp.timings.duration, { endpoint: authEndpoint });
  }

  sleep(2);

  // 3. 관리자 API 요청 (특수 권한 필요, 대부분 실패 예상 - 부하 테스트용)
  if (Math.random() < 0.1) {
    // 10%의 확률로만 관리자 API 호출
    const adminEndpoint = randomItem(ENDPOINTS.admin);
    const adminResp = http.get(`${API_BASE_URL}${adminEndpoint}`, {
      headers: AUTH_HEADERS,
      tags: { endpoint: 'adminAPI' },
    });

    // 관리자 API는 대부분 403 예상 (권한 부족)
    check(adminResp, {
      'admin auth check': r => r.status === 200 || r.status === 403,
    }) || errorRate.add(1);

    apiTrend.add(adminResp.timings.duration, { endpoint: adminEndpoint });
  }

  sleep(1);
}

// 테스트 종료 후 정리
export function teardown(data) {
  console.log('API 부하 테스트 완료');

  // 선택적: 로그아웃 또는 정리 작업
  if (data.token) {
    http.post(`${API_BASE_URL}/api/auth/logout`, null, {
      headers: AUTH_HEADERS,
    });
  }
}
