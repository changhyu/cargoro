import axios from 'axios';
import {
  Context,
  CreateOrganizationInput,
  InviteUserInput,
  OrganizationConnection,
  Organization,
  UpdateMembershipInput,
  UpdateOrganizationInput,
} from '../types';
import { logger } from '../../utils/logger';

// API 서비스 URL 설정
const CORE_API_URL = process.env.CORE_API_URL || 'http://localhost:8001';

// 헬퍼 함수: API 호출 래퍼
async function callApi<T = any>(
  url: string,
  method = 'GET',
  data: T | null = null,
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

// 조직 관련 리졸버
export const organizationResolvers = {
  // 특정 조직 정보 조회
  organization: async ({ id }: { id: string }, context: Context) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    return callApi(`${CORE_API_URL}/api/organizations/${id}`, 'GET', null, {
      Authorization: token,
    });
  },

  // 조직 목록 조회
  organizations: async (
    { page = 1, limit = 10 }: { page: number; limit: number },
    context: Context
  ): Promise<OrganizationConnection> => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    const result = await callApi(
      `${CORE_API_URL}/api/organizations?page=${page}&limit=${limit}`,
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
      edges: result.items.map((org: Organization) => ({
        cursor: org.id,
        node: org,
      })),
    };
  },

  // 조직 생성
  createOrganization: async ({ input }: { input: CreateOrganizationInput }, context: Context) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    return callApi(`${CORE_API_URL}/api/organizations`, 'POST', input, {
      Authorization: token,
    });
  },

  // 조직 정보 업데이트
  updateOrganization: async (
    { id, input }: { id: string; input: UpdateOrganizationInput },
    context: Context
  ) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    return callApi(`${CORE_API_URL}/api/organizations/${id}`, 'PUT', input, {
      Authorization: token,
    });
  },

  // 조직 삭제
  deleteOrganization: async ({ id }: { id: string }, context: Context) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    await callApi(`${CORE_API_URL}/api/organizations/${id}`, 'DELETE', null, {
      Authorization: token,
    });
    return true;
  },

  // 사용자를 조직에 초대
  inviteUserToOrganization: async ({ input }: { input: InviteUserInput }, context: Context) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    await callApi(`${CORE_API_URL}/api/organizations/invite`, 'POST', input, {
      Authorization: token,
    });
    return true;
  },

  // 멤버십 업데이트
  updateMembership: async ({ input }: { input: UpdateMembershipInput }, context: Context) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    return callApi(
      `${CORE_API_URL}/api/organizations/${input.organizationId}/members/${input.userId}`,
      'PUT',
      { roleId: input.roleId, isAdmin: input.isAdmin },
      { Authorization: token }
    );
  },

  // 멤버 제거
  removeMember: async (
    { organizationId, userId }: { organizationId: string; userId: string },
    context: Context
  ) => {
    const token = context.headers.authorization;
    if (!token) throw new Error('인증이 필요합니다.');

    await callApi(
      `${CORE_API_URL}/api/organizations/${organizationId}/members/${userId}`,
      'DELETE',
      null,
      { Authorization: token }
    );
    return true;
  },
};
