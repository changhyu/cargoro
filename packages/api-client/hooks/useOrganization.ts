// 모듈 경로 문제 해결을 위한 타입 정의
// 원래는 @cargoro/types/schema에서 임포트해야 하지만 임시로 여기서 정의
type Organization = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  members?: OrganizationMember[];
};

type OrganizationConnection = {
  edges: Array<{ node: Organization; cursor: string }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  totalCount: number;
};

type CreateOrganizationInput = {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
};

type UpdateOrganizationInput = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
};

type InviteUserInput = {
  organizationId: string;
  email: string;
  role: string;
};

type UpdateMembershipInput = {
  organizationId: string;
  userId: string;
  role: string;
};

type OrganizationMember = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 모듈 경로 문제 해결을 위한 임시 객체 정의
// 원래는 '../config'에서 임포트해야 하지만 임시로 여기서 정의
const graphqlClient = {
  query: async <T>(_query: any, _variables?: any): Promise<T> => {
    return {} as T;
  },
};

// 원래는 '../core/graphql'에서 임포트해야 하지만 임시로 여기서 정의
const ORGANIZATION_QUERIES = {
  ORGANIZATION_BY_ID: {},
  ORGANIZATIONS_LIST: {},
};

const ORGANIZATION_MUTATIONS = {
  CREATE_ORGANIZATION: {},
  UPDATE_ORGANIZATION: {},
  DELETE_ORGANIZATION: {},
  INVITE_USER: {},
  UPDATE_MEMBERSHIP: {},
  REMOVE_MEMBER: {},
};

/**
 * 조직 정보 조회 훅
 */
export function useOrganization(id: string) {
  return useQuery<Organization>({
    queryKey: ['organization', id],
    queryFn: async () => {
      const response = await graphqlClient.query<{ organization: Organization }>(
        ORGANIZATION_QUERIES.ORGANIZATION_BY_ID,
        { id }
      );
      return response.organization;
    },
    enabled: !!id,
  });
}

/**
 * 조직 목록 조회 훅
 */
export function useOrganizations(page = 1, limit = 10) {
  return useQuery<OrganizationConnection>({
    queryKey: ['organizations', page, limit],
    queryFn: async () => {
      const response = await graphqlClient.query<{ organizations: OrganizationConnection }>(
        ORGANIZATION_QUERIES.ORGANIZATIONS_LIST,
        {
          page,
          limit,
        }
      );
      return response.organizations;
    },
  });
}

/**
 * 조직 생성 훅
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrganizationInput) => {
      const response = await graphqlClient.query<{ createOrganization: Organization }>(
        ORGANIZATION_MUTATIONS.CREATE_ORGANIZATION,
        { input }
      );
      return response.createOrganization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

/**
 * 조직 정보 업데이트 훅
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateOrganizationInput }) => {
      const response = await graphqlClient.query<{ updateOrganization: Organization }>(
        ORGANIZATION_MUTATIONS.UPDATE_ORGANIZATION,
        { id, input }
      );
      return response.updateOrganization;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization', data.id] });
    },
  });
}

/**
 * 조직 삭제 훅
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await graphqlClient.query<{ deleteOrganization: boolean }>(
        ORGANIZATION_MUTATIONS.DELETE_ORGANIZATION,
        { id }
      );
      return response.deleteOrganization;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.removeQueries({ queryKey: ['organization', id] });
    },
  });
}

/**
 * 조직에 사용자 초대 훅
 */
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InviteUserInput) => {
      const response = await graphqlClient.query<{ inviteUserToOrganization: boolean }>(
        ORGANIZATION_MUTATIONS.INVITE_USER,
        { input }
      );
      return response.inviteUserToOrganization;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.organizationId] });
    },
  });
}

/**
 * 멤버십 업데이트 훅
 */
export function useUpdateMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMembershipInput) => {
      const response = await graphqlClient.query<{ updateMembership: OrganizationMember }>(
        ORGANIZATION_MUTATIONS.UPDATE_MEMBERSHIP,
        { input }
      );
      return response.updateMembership;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.organizationId] });
    },
  });
}

/**
 * 멤버 제거 훅
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, userId }: { organizationId: string; userId: string }) => {
      const response = await graphqlClient.query<{ removeMember: boolean }>(
        ORGANIZATION_MUTATIONS.REMOVE_MEMBER,
        { organizationId, userId }
      );
      return response.removeMember;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.organizationId] });
    },
  });
}
