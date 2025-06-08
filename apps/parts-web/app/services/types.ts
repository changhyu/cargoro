// API 타입 정의

export interface PartListResponse {
  data: unknown[];
}

export interface PartDetailResponse {
  data: unknown;
}

export interface PartCreateResponse {
  data: unknown;
}

export interface PartUpdateResponse {
  data: unknown;
}

export interface PartDeleteResponse {
  success: boolean;
}

export interface PartOrderListResponse {
  data: unknown[];
}

export interface PartOrderDetailResponse {
  data: unknown;
}

export interface PartOrderCreateResponse {
  data: unknown;
}

export interface PartOrderUpdateResponse {
  data: unknown;
}

export interface ErpSyncRequest {
  source: string;
  syncType: 'full' | 'incremental';
}

export interface ErpSyncResponse {
  data: {
    syncedCount: number;
    message: string;
  };
}

export interface PartFilterParams {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PartOrderFilterParams {
  search?: string;
  supplierId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
