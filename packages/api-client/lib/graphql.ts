import { ApiClient, ApiClientConfig } from './index';

// GraphQL 응답 타입
export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
}

// GraphQL 쿼리 변수 타입
export type Variables = Record<string, unknown>;

/**
 * GraphQL API 클라이언트
 */
export class GraphQLClient extends ApiClient {
  constructor(config: ApiClientConfig) {
    super(config.baseURL, {
      timeout: config.timeout,
      headers: config.headers,
    });
  }

  /**
   * GraphQL 쿼리 실행
   */
  public async query<T>(query: string, variables?: Variables): Promise<T> {
    const response = await this.post<GraphQLResponse<T>>('/graphql', {
      query,
      variables,
    });

    // 오류 처리
    if (response.errors && response.errors.length > 0) {
      const error = response.errors[0];
      throw {
        code: (error.extensions?.code as string) || 'GRAPHQL_ERROR',
        message: error.message,
        details: {
          locations: error.locations,
          path: error.path,
          extensions: error.extensions,
        },
      };
    }

    return response.data;
  }

  /**
   * GraphQL 뮤테이션 실행
   */
  public async mutate<T>(mutation: string, variables?: Variables): Promise<T> {
    return this.query<T>(mutation, variables);
  }
}

// 기본 GraphQL 클라이언트 인스턴스
let defaultClient: GraphQLClient | null = null;

/**
 * 기본 GraphQL 클라이언트 설정
 */
export function configureGraphQLClient(config: ApiClientConfig): GraphQLClient {
  defaultClient = new GraphQLClient(config);
  return defaultClient;
}

/**
 * 기본 GraphQL 클라이언트 가져오기
 */
export function getGraphQLClient(): GraphQLClient {
  if (!defaultClient) {
    throw new Error(
      'GraphQL 클라이언트가 설정되지 않았습니다. configureGraphQLClient를 먼저 호출하세요.'
    );
  }
  return defaultClient;
}

// 사용자 관련 GraphQL 쿼리
export const USER_QUERIES = {
  CURRENT_USER: `
    query CurrentUser {
      currentUser {
        id
        email
        firstName
        lastName
        phoneNumber
        profileImage
        active
        createdAt
        updatedAt
        lastLogin
      }
    }
  `,

  USER_BY_ID: `
    query User($id: ID!) {
      user(id: $id) {
        id
        email
        firstName
        lastName
        phoneNumber
        profileImage
        active
        createdAt
        updatedAt
        lastLogin
      }
    }
  `,

  USERS_LIST: `
    query Users($page: Int, $limit: Int) {
      users(page: $page, limit: $limit) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          cursor
          node {
            id
            email
            firstName
            lastName
            phoneNumber
            profileImage
            active
            createdAt
            updatedAt
            lastLogin
          }
        }
      }
    }
  `,
};

// 사용자 관련 GraphQL 뮤테이션
export const USER_MUTATIONS = {
  UPDATE_USER: `
    mutation UpdateUser($input: UpdateUserInput!) {
      updateUser(input: $input) {
        id
        email
        firstName
        lastName
        phoneNumber
        profileImage
        active
        updatedAt
      }
    }
  `,

  DELETE_USER: `
    mutation DeleteUser($id: ID!) {
      deleteUser(id: $id)
    }
  `,
};

// 조직 관련 GraphQL 쿼리
export const ORGANIZATION_QUERIES = {
  ORGANIZATION_BY_ID: `
    query Organization($id: ID!) {
      organization(id: $id) {
        id
        name
        slug
        description
        Logo
        active
        createdAt
        updatedAt
        tier
        settings
      }
    }
  `,

  ORGANIZATIONS_LIST: `
    query Organizations($page: Int, $limit: Int) {
      organizations(page: $page, limit: $limit) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          cursor
          node {
            id
            name
            slug
            description
            Logo
            active
            createdAt
            updatedAt
            tier
          }
        }
      }
    }
  `,
};

// 조직 관련 GraphQL 뮤테이션
export const ORGANIZATION_MUTATIONS = {
  CREATE_ORGANIZATION: `
    mutation CreateOrganization($input: CreateOrganizationInput!) {
      createOrganization(input: $input) {
        id
        name
        slug
        description
        Logo
        active
        createdAt
        updatedAt
        tier
        settings
      }
    }
  `,

  UPDATE_ORGANIZATION: `
    mutation UpdateOrganization($id: ID!, $input: UpdateOrganizationInput!) {
      updateOrganization(id: $id, input: $input) {
        id
        name
        slug
        description
        Logo
        active
        updatedAt
        tier
        settings
      }
    }
  `,

  DELETE_ORGANIZATION: `
    mutation DeleteOrganization($id: ID!) {
      deleteOrganization(id: $id)
    }
  `,

  INVITE_USER: `
    mutation InviteUserToOrganization($input: InviteUserInput!) {
      inviteUserToOrganization(input: $input)
    }
  `,

  UPDATE_MEMBERSHIP: `
    mutation UpdateMembership($input: UpdateMembershipInput!) {
      updateMembership(input: $input) {
        id
        role {
          id
          name
        }
        isAdmin
        updatedAt
        status
      }
    }
  `,

  REMOVE_MEMBER: `
    mutation RemoveMember($organizationId: ID!, $userId: ID!) {
      removeMember(organizationId: $organizationId, userId: $userId)
    }
  `,
};
