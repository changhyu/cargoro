/**
 * API 클라이언트 모킹
 * 테스트 환경에서 사용하기 위한 모의 API 클라이언트입니다.
 */

interface RequestParams {
  [key: string]: string | number | boolean | null | undefined;
}

interface RequestData {
  [key: string]: unknown;
}

export class ApiClient {
  // private baseURL: string;
  // private timeout: number;
  private headers: Record<string, string> = {};

  constructor(_params: { baseURL: string; timeout: number }) {
    // this.baseURL = baseURL;
    // this.timeout = timeout;
  }

  async get(_url: string, _params?: RequestParams) {
    return { data: { message: 'Mocked GET response' } };
  }

  async post(_url: string, data?: RequestData) {
    return { data: { message: 'Mocked POST response', data } };
  }

  async put(_url: string, data?: RequestData) {
    return { data: { message: 'Mocked PUT response', data } };
  }

  async delete(_url: string) {
    return { data: { message: 'Mocked DELETE response' } };
  }

  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }
}
