/**
 * 배송 기사 앱 API 서비스
 * HTTP 요청 및 응답 처리를 위한 클래스입니다.
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { Delivery } from '../features/delivery-list/delivery-list-screen';

// 상세 배송 정보 인터페이스 (기본 배송 정보 확장)
export interface DeliveryDetail extends Delivery {
  actual_pickup_time?: string;
  actual_delivery_time?: string;
  driver_id?: string;
  completed_by?: string;
  customer_signature?: string;
  issues?: string[];
  notes?: string;
  vehicle_id: string;
  vehicle_info?: {
    make: string;
    model: string;
    licensePlate: string;
    year: number;
    color: string;
  };
}

// API 결과 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// API 오류 타입
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * API 서비스 클래스
 * 배송 기사 앱의 모든 HTTP 요청을 처리합니다.
 */
export class ApiService {
  private client: AxiosInstance;
  private static instance: ApiService;

  private constructor() {
    this.client = axios.create({
      baseURL: 'https://api.cargoro.co.kr/delivery-api', // 실제 서버 주소로 변경
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터 설정
    this.client.interceptors.request.use(
      config => {
        // 토큰이 필요한 경우 추가
        const token = this.getAuthToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터 설정
    this.client.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        // 에러 처리 로직
        if (error.response) {
          // 서버 응답이 있는 경우
          if (__DEV__) {
            console.error('API 오류:', error.response.status, error.response.data);
          }

          // 인증 오류 처리
          if (error.response.status === 401) {
            // 토큰 갱신 또는 로그아웃 처리
            // this.refreshToken() 또는 this.logout()
          }
        } else if (error.request) {
          // 요청은 보냈지만 응답이 없는 경우
          if (__DEV__) {
            console.error('API 응답 없음:', error.request);
          }
        } else {
          // 요청 설정 중 오류 발생
          if (__DEV__) {
            console.error('API 요청 오류:', error.message);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // 싱글톤 패턴
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // 인증 토큰 가져오기 (로컬 스토리지 또는 보안 스토리지에서)
  private getAuthToken(): string | null {
    // AsyncStorage 또는 다른 저장소에서 토큰을 가져오는 로직
    // 임시로 null 반환
    return null;
  }

  // 모의 데이터 생성 (실제 API가 준비되지 않은 경우 테스트용)
  private generateMockData(type: string): Delivery[] | DeliveryDetail | null {
    if (type === 'deliveries') {
      return [
        {
          id: '1',
          status: 'pending',
          delivery_type: 'customer_delivery',
          origin_location: '서울시 강남구 테헤란로 123',
          destination_location: '서울시 서초구 반포대로 45',
          scheduled_date: '2025-05-25T09:00:00Z',
          priority: 'normal',
          contact_person: '김고객',
          contact_phone: '010-1234-5678',
        },
        {
          id: '2',
          status: 'assigned',
          delivery_type: 'workshop_transfer',
          origin_location: '서울시 강남구 선릉로 72길 34',
          destination_location: '서울시 강동구 천호대로 1095',
          scheduled_date: '2025-05-26T10:30:00Z',
          priority: 'high',
        },
        {
          id: '3',
          status: 'in_transit',
          delivery_type: 'dealer_transfer',
          origin_location: '서울시 중구 세종대로 110',
          destination_location: '경기도 고양시 일산동구 중앙로 1305',
          scheduled_date: '2025-05-25T14:00:00Z',
          priority: 'normal',
        },
        {
          id: '4',
          status: 'completed',
          delivery_type: 'purchase_pickup',
          origin_location: '경기도 성남시 분당구 황새울로 326',
          destination_location: '서울시 동작구 사당로 27길 20',
          scheduled_date: '2025-05-24T11:00:00Z',
          priority: 'low',
          // actualTime: '2025-05-24T11:35:00Z', // Delivery 타입에 없는 필드
        },
        {
          id: '5',
          status: 'failed',
          delivery_type: 'return_delivery',
          origin_location: '인천시 연수구 송도과학로 32',
          destination_location: '인천시 미추홀구 경원대로 853',
          scheduled_date: '2025-05-23T16:00:00Z',
          priority: 'urgent',
          // notes: '고객 부재, 전화 연락 불가', // Delivery 타입에 없는 필드
        },
      ];
    } else if (type === 'delivery') {
      return {
        id: '2',
        status: 'assigned',
        delivery_type: 'workshop_transfer',
        origin_location: '서울시 강남구 선릉로 72길 34',
        destination_location: '서울시 강동구 천호대로 1095',
        scheduled_date: '2025-05-26T10:30:00Z',
        priority: 'high',
        actual_pickup_time: undefined,
        actual_delivery_time: undefined,
        driver_id: 'driver_123',
        completed_by: undefined,
        customer_signature: undefined,
        issues: undefined,
        notes: '차량 상태 확인 필요, 운송 중 충격 최소화 요청',
        vehicle_id: 'vehicle_456',
        vehicle_info: {
          make: '현대',
          model: '아반떼',
          licensePlate: '12가 3456',
          year: 2023,
          color: '검정색',
        },
        contact_person: '이정비',
        contact_phone: '010-9876-5432',
      };
    }

    return null;
  }

  /**
   * GET 요청
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);
    return response.data.data as T;
  }

  /**
   * POST 요청
   */
  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
    return response.data.data as T;
  }

  /**
   * PUT 요청
   */
  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config);
    return response.data.data as T;
  }

  /**
   * DELETE 요청
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);
    return response.data.data as T;
  }

  /**
   * 배송 정보 가져오기
   */
  public async getDeliveries(): Promise<Delivery[]> {
    try {
      // 실제 API 호출 (API가 준비되면 주석 해제)
      // const response = await this.client.get('/deliveries');
      // return response.data;

      // 모의 데이터 사용 (개발 테스트용)
      return this.generateMockData('deliveries') as Delivery[];
    } catch (error) {
      if (__DEV__) {
        console.error('배송 목록 조회 오류:', error);
      }
      throw error;
    }
  }

  /**
   * 특정 배송 정보 가져오기
   */
  public async getDelivery(id: string): Promise<DeliveryDetail> {
    try {
      // 실제 API 호출 (API가 준비되면 주석 해제)
      // const response = await this.client.get(`/deliveries/${id}`);
      // return response.data;

      // 모의 데이터 사용 (개발 테스트용)
      return this.generateMockData('delivery') as DeliveryDetail;
    } catch (error) {
      if (__DEV__) {
        console.error(`배송 상세 조회 오류(ID: ${id}):`, error);
      }
      throw error;
    }
  }

  /**
   * 배송 상태 업데이트
   */
  public async updateDeliveryStatus<T>(id: string, status: string) {
    return this.put<T>(`/api/v1/deliveries/${id}/status`, { status });
  }

  /**
   * 배송 완료 처리
   */
  public async completeDelivery<T>(id: string, data: { completedBy: string }) {
    return this.put<T>(`/api/v1/deliveries/${id}/complete`, data);
  }

  /**
   * 배송 취소 처리
   */
  public async cancelDelivery<T>(id: string, reason: string) {
    return this.put<T>(`/api/v1/deliveries/${id}/cancel`, { reason });
  }

  /**
   * 배송 단계 로그 기록
   */
  public async logDeliveryMilestone<T>(
    id: string,
    data: { status: string; details: string; milestoneId: number }
  ) {
    return this.post<T>(`/api/v1/deliveries/${id}/logs`, data);
  }

  /**
   * 사용자 정보 가져오기
   */
  public async getUserProfile<T>() {
    return this.get<T>('/api/v1/users/me');
  }

  /**
   * 사용자 프로필 업데이트
   */
  public async updateUserProfile<T>(data: Record<string, unknown>) {
    return this.put<T>('/api/v1/users/profile', data);
  }

  /**
   * 드라이버 가용성 업데이트
   */
  public async updateDriverAvailability<T>(isAvailable: boolean) {
    return this.put<T>('/api/v1/drivers/availability', { isAvailable });
  }
}

// API 서비스 인스턴스 생성 (싱글톤)
export const apiService = ApiService.getInstance();

export default apiService;
