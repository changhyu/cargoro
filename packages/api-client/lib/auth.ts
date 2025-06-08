import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * 인증 API 클라이언트
 */
export class AuthApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터 설정
    this.client.interceptors.request.use(
      config => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * 토큰 설정
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * 토큰 가져오기
   */
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  /**
   * 토큰 삭제
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Clerk ID를 사용하여 JWT 토큰 발급
   */
  async getJwtToken(
    clerkId: string,
    organizationId?: string
  ): Promise<{ access_token: string; expires_in: number }> {
    try {
      const params = new URLSearchParams();
      params.append('clerk_id', clerkId);
      if (organizationId) {
        params.append('organization_id', organizationId);
      }

      const response = await this.client.post('/api/auth/token', params);
      const { access_token, expires_in } = response.data;
      this.setToken(access_token);
      return { access_token, expires_in };
    } catch (error) {
      console.error('JWT 토큰 발급 실패:', error);
      throw error;
    }
  }

  /**
   * 토큰 유효성 검증
   */
  async validateToken(token = this.getToken()): Promise<boolean> {
    if (!token) return false;

    try {
      await this.client.get('/api/auth/validate', {
        params: { token },
      });
      return true;
    } catch {
      this.clearToken();
      return false;
    }
  }

  /**
   * 사용자 생성
   */
  async createUser(userData: {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    profileImage?: string;
  }) {
    try {
      const response = await this.client.post('/api/users', userData);
      return response.data;
    } catch (error) {
      console.error('사용자 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 정보 조회
   */
  async getUser(userId: string) {
    try {
      const response = await this.client.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('사용자 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 조직 생성
   */
  async createOrganization(orgData: {
    name: string;
    slug: string;
    description?: string;
    Logo?: string;
    tier?: string;
  }) {
    try {
      const response = await this.client.post('/api/organizations', orgData);
      return response.data;
    } catch (error) {
      console.error('조직 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 멤버십 생성 (사용자를 조직에 추가)
   */
  async createMembership(membershipData: {
    userId: string;
    organizationId: string;
    roleId: number;
    isOwner?: boolean;
    isAdmin?: boolean;
  }) {
    try {
      const response = await this.client.post('/api/memberships', membershipData);
      return response.data;
    } catch (error) {
      console.error('멤버십 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자의 조직 목록 조회
   */
  async getUserOrganizations(userId: string) {
    try {
      const response = await this.client.get(`/api/users/${userId}/organizations`);
      return response.data;
    } catch (error) {
      console.error('조직 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자의 역할 및 권한 조회
   */
  async getUserRoles(userId: string, organizationId: string) {
    try {
      const response = await this.client.get(`/api/users/${userId}/roles`, {
        params: { organization_id: organizationId },
      });
      return response.data;
    } catch (error) {
      console.error('역할 및 권한 조회 실패:', error);
      throw error;
    }
  }
}

// 인증 API 클라이언트 인스턴스 생성
export const authApiClient = new AuthApiClient();

export default authApiClient;
