import axios from 'axios';
import { Context } from '../types';
import { logger } from '../../utils/logger';

// API 서비스 URL 설정
const CORE_API_URL = process.env.CORE_API_URL || 'http://localhost:8001';

// 헬퍼 함수: API 호출 래퍼
async function callApi(
  url: string,
  method = 'GET',
  data: Record<string, unknown> | null = null,
  headers: Record<string, string> = {}
) {
  try {
    const response = await axios({
      url,
      method,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    logger.error(`API 호출 오류 (${url}):`, error);
    throw error;
  }
}

// 인증 관련 리졸버
export const authResolvers = {
  // 로그인
  login: async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await callApi(
        `${CORE_API_URL}/api/auth/token`,
        'POST',
        { username: email, password },
        { 'Content-Type': 'application/x-www-form-urlencoded' }
      );

      return {
        token: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in,
        user: response.user,
      };
    } catch {
      throw new Error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  },

  // 토큰 갱신
  refreshToken: async ({ refreshToken }: { refreshToken: string }) => {
    try {
      const response = await callApi(`${CORE_API_URL}/api/auth/refresh-token`, 'POST', {
        refresh_token: refreshToken,
      });

      return {
        token: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in,
        user: response.user,
      };
    } catch {
      throw new Error('토큰 갱신에 실패했습니다. 다시 로그인해주세요.');
    }
  },

  // 로그아웃
  logout: async (_args: unknown, context: Context) => {
    const token = context.headers.authorization;
    if (!token) return true; // 이미 로그아웃 상태

    try {
      await callApi(`${CORE_API_URL}/api/auth/logout`, 'POST', null, { Authorization: token });
      return true;
    } catch {
      // 오류가 발생해도 클라이언트 측에서는 로그아웃 처리
      return true;
    }
  },

  // 사용자 등록
  register: async ({
    input,
  }: {
    input: {
      email: string;
      password: string;
      firstName: string;
      lastName?: string;
      phoneNumber?: string;
    };
  }) => {
    try {
      const { email, password, firstName, lastName, phoneNumber } = input;
      const fullName = lastName ? `${lastName}${firstName}` : firstName;

      const response = await callApi(`${CORE_API_URL}/api/auth/register`, 'POST', {
        email,
        password,
        full_name: fullName,
        phone: phoneNumber,
      });

      return {
        token: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in,
        user: response.user,
      };
    } catch {
      throw new Error('회원가입에 실패했습니다. 입력 정보를 확인해주세요.');
    }
  },

  // 비밀번호 변경
  changePassword: async (
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
    context: Context
  ) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    try {
      await callApi(
        `${CORE_API_URL}/api/auth/change-password`,
        'POST',
        { current_password: currentPassword, new_password: newPassword },
        { Authorization: token }
      );
      return true;
    } catch {
      throw new Error('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
    }
  },

  // 비밀번호 재설정 요청
  requestPasswordReset: async ({ email }: { email: string }) => {
    try {
      await callApi(`${CORE_API_URL}/api/auth/reset-password-request`, 'POST', { email });
      // 보안상 이메일 존재 여부와 관계없이 성공 응답
      return true;
    } catch {
      // 오류가 발생해도 보안상 성공 응답
      return true;
    }
  },

  // 비밀번호 재설정 확인
  resetPassword: async ({ token, newPassword }: { token: string; newPassword: string }) => {
    try {
      await callApi(`${CORE_API_URL}/api/auth/reset-password-confirm`, 'POST', {
        token,
        new_password: newPassword,
      });
      return true;
    } catch {
      throw new Error('비밀번호 재설정에 실패했습니다. 토큰이 유효하지 않거나 만료되었습니다.');
    }
  },

  // 세션 유효성 검증
  validateSession: async (_args: unknown, context: Context) => {
    const token = context.headers.authorization;
    if (!token) return false;

    try {
      await callApi(`${CORE_API_URL}/api/auth/me`, 'GET', null, { Authorization: token });
      return true;
    } catch {
      return false;
    }
  },
};
