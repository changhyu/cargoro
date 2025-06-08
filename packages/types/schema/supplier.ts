// 공급업체 관련 응답 타입
export interface SupplierListResponse {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SupplierDetailResponse {
  data: Record<string, unknown>;
  success: boolean;
}

export interface SupplierCreateResponse {
  data: Record<string, unknown>;
  success: boolean;
  message: string;
}

export interface SupplierUpdateResponse {
  data: Record<string, unknown>;
  success: boolean;
  message: string;
}

export interface SupplierDeleteResponse {
  success: boolean;
  message: string;
}
