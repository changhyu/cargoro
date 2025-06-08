/**
 * 인증 관련 유틸리티 함수
 * 사용자 인증, 검증, 토큰 처리 등의 기능을 제공합니다.
 */

// jwt-decode 라이브러리 대신 직접 구현한 디코딩 함수를 사용합니다.

// 로깅 유틸리티
const logger = {
  error: (_message: string, _error?: unknown) => {
    // TODO: 프로덕션 환경에서 실제 로깅 서비스로 교체
    if (process.env.NODE_ENV === 'development') {
      // 개발 환경에서만 콘솔에 출력
      // console.error(`[Auth] ${_message}`, _error);
    }
  },
};

// 상수
const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';
const USER_ROLE_KEY = 'user_role';

/**
 * undefined나 null을 기본값으로 대체하는 유틸리티 함수
 */
export function ensureString(value?: string | null): string {
  return value || '';
}

/**
 * 이메일 주소의 유효성을 검사합니다.
 * @param email 검사할 이메일 주소
 * @returns 유효하면 true, 그렇지 않으면 false
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호의 유효성을 검사합니다.
 * 최소 8자 이상, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.
 * @param password 검사할 비밀번호
 * @returns 유효하면 true, 그렇지 않으면 false
 */
export function validatePassword(password: string): boolean {
  // 최소 8자, 대문자, 소문자, 숫자, 특수문자 포함
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * 이름의 유효성을 검사합니다.
 * 최소 2자 이상, 문자만 포함해야 합니다.
 * @param name 검사할 이름
 * @returns 유효하면 true, 그렇지 않으면 false
 */
export function validateName(name: string): boolean {
  // 최소 2자, 문자와 공백만 허용 (숫자와 특수문자 불가)
  const nameRegex = /^[가-힣a-zA-Z\s]{2,}$/;
  return nameRegex.test(name);
}

/**
 * 전화번호의 유효성을 검사합니다.
 * 숫자와 하이픈만 포함해야 합니다.
 * @param phoneNumber 검사할 전화번호
 * @returns 유효하면 true, 그렇지 않으면 false
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // 숫자와 하이픈만 허용, 총 길이는 9-13자 (지역번호 포함)
  const phoneRegex = /^[0-9-]{9,13}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * 사용자가 인증되었는지 확인합니다.
 * @returns 인증되었으면 true, 그렇지 않으면 false
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
}

/**
 * 인증 토큰을 설정합니다.
 * @param token 저장할 토큰
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 인증 토큰을 제거합니다.
 */
export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 현재 저장된 인증 토큰을 가져옵니다.
 * @returns 저장된 토큰 또는 null
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 사용자 역할을 가져옵니다.
 *
 * @returns 현재 사용자의 역할 또는 기본값
 */
export async function getUserRole(): Promise<string> {
  // 로컬 스토리지에서 사용자 역할 가져오기
  const storedRole = localStorage.getItem(USER_ROLE_KEY);

  if (storedRole) {
    return storedRole;
  }

  // 토큰에서 역할 정보 추출 시도
  const token = getAuthToken();
  if (token) {
    const payload = parseToken(token);
    if (payload && payload.role) {
      localStorage.setItem(USER_ROLE_KEY, payload.role);
      return payload.role;
    }
  }

  // 기본 역할 반환
  return 'technician'; // 기본 역할 (정비사)
}

/**
 * 모든 인증 상태를 초기화합니다.
 */
export function clearAuthState(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  // 기타 인증 관련 로컬 스토리지 항목 삭제

  // 세션 스토리지에서도 관련 항목 삭제
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_ID_KEY);
  sessionStorage.removeItem(USER_ROLE_KEY);
}

/**
 * JWT 토큰에서 사용자 정보를 추출합니다.
 * @param token JWT 토큰
 * @returns 사용자 정보 객체 또는 null
 */
export function getUserInfoFromToken(
  token: string | null
): { id: string; name: string; email: string } | null {
  if (!token) return null;

  const payload = parseToken(token);
  if (!payload) return null;

  return {
    id: ensureString(payload.sub),
    name: ensureString(payload.name),
    email: ensureString(payload.email),
  };
}

interface TokenPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * JWT 토큰을 파싱하여 페이로드를 추출합니다.
 * @param token JWT 토큰
 * @returns 페이로드 객체 또는 null
 */
export function parseToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    logger.error('토큰 파싱 오류:', error);
    return null;
  }
}

/**
 * 사용자의 인증 권한을 확인합니다.
 * @param requiredRole 필요한 역할
 * @returns 권한이 있으면 true, 없으면 false
 */
export async function checkAuthorization(requiredRole?: string): Promise<boolean> {
  if (!isAuthenticated()) {
    return false;
  }

  if (!requiredRole) {
    return true;
  }

  const userRole = await getUserRole();
  return userRole === requiredRole;
}

/**
 * 리다이렉트와 함께 인증을 체크합니다.
 * @param requiredRole 필요한 역할
 * @param redirectUrl 리다이렉트할 URL
 * @returns 인증되었는지 여부
 */
export async function requireAuth(
  requiredRole?: string,
  redirectUrl = '/sign-in'
): Promise<boolean> {
  const isAuthorized = await checkAuthorization(requiredRole);

  if (!isAuthorized && typeof window !== 'undefined') {
    window.location.href = redirectUrl;
    return false;
  }

  return isAuthorized;
}

// 기본 내보내기
export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePhoneNumber,
  isAuthenticated,
  setAuthToken,
  removeAuthToken,
  getAuthToken,
  getUserInfoFromToken,
  parseToken,
  getUserRole,
  clearAuthState,
};
