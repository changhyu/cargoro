import axios from 'axios';
import { Context, UpdateUserInput, UserConnection, UserType } from '../types';
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

// 사용자 관련 리졸버
export const userResolvers = {
  // 현재 사용자 정보 조회
  currentUser: async (_args: unknown, context: Context) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    return callApi(`${CORE_API_URL}/api/users/me`, 'GET', null, {
      Authorization: token,
    });
  },

  // 특정 사용자 정보 조회
  user: async ({ id }: { id: string }, context: Context) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    return callApi(`${CORE_API_URL}/api/users/${id}`, 'GET', null, {
      Authorization: token,
    });
  },

  // 사용자 목록 조회
  users: async (
    { page = 1, limit = 10 }: { page: number; limit: number },
    context: Context
  ): Promise<UserConnection> => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    const result = await callApi(
      `${CORE_API_URL}/api/users?page=${page}&limit=${limit}`,
      'GET',
      null,
      { Authorization: token }
    );

    return {
      totalCount: result.total,
      pageInfo: {
        hasNextPage: result.has_next,
        hasPreviousPage: result.has_prev,
        startCursor: result.items[0]?.id || null,
        endCursor: result.items[result.items.length - 1]?.id || null,
      },
      edges: result.items.map((user: UserType) => ({
        cursor: user.id,
        node: user,
      })),
    };
  },

  // 사용자 정보 업데이트
  updateUser: async ({ input }: { input: UpdateUserInput }, context: Context) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    const { id, ...userData } = input;
    return callApi(`${CORE_API_URL}/api/users/${id}`, 'PUT', userData, {
      Authorization: token,
    });
  },

  // 사용자 삭제
  deleteUser: async ({ id }: { id: string }, context: Context) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    await callApi(`${CORE_API_URL}/api/users/${id}`, 'DELETE', null, {
      Authorization: token,
    });
    return true;
  },

  // 사용자에게 역할 할당
  assignRoleToUser: async (
    { userId, roleId }: { userId: string; roleId: string },
    context: Context
  ) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    await callApi(
      `${CORE_API_URL}/api/users/${userId}/roles`,
      'POST',
      { roleId },
      { Authorization: token }
    );
    return true;
  },

  // 사용자에게 권한 할당
  assignPermissionToUser: async (
    { userId, permissionId }: { userId: string; permissionId: string },
    context: Context
  ) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    await callApi(
      `${CORE_API_URL}/api/users/${userId}/permissions`,
      'POST',
      { permissionId, granted: true },
      { Authorization: token }
    );
    return true;
  },
};
