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

// 권한 관련 리졸버
export const permissionResolvers = {
  // 권한 검증
  verifyPermission: async ({ permission }: { permission: string }, context: Context) => {
    const token = context.headers.authorization;
    if (!token) return false;

    try {
      const result = await callApi(
        `${CORE_API_URL}/api/auth/verify-permission`,
        'POST',
        { permission },
        { Authorization: token }
      );
      return result.hasPermission === true;
    } catch {
      return false;
    }
  },

  // 사용자 권한 목록 조회
  getUserPermissions: async ({ userId }: { userId: string }, context: Context) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    return callApi(`${CORE_API_URL}/api/users/${userId}/permissions`, 'GET', null, {
      Authorization: token,
    });
  },

  // 역할 권한 목록 조회
  getRolePermissions: async ({ role }: { role: string }, context: Context) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    return callApi(`${CORE_API_URL}/api/roles/${role}/permissions`, 'GET', null, {
      Authorization: token,
    });
  },
};
