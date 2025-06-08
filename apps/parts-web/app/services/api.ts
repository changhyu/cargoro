'use client';

import { apiClient } from '../lib/api-client';

// API 클라이언트 인스턴스 생성
const client = apiClient('/api');

// 부품 관련 API
export const partsApi = {
  // 부품 목록 조회
  getAllParts: async () => {
    const response = await client.get('/parts');
    return response.data;
  },

  // 부품 상세 조회
  getPart: async (id: string) => {
    const response = await client.get(`/parts/${id}`);
    return response.data;
  },

  // 부품 생성
  createPart: async (partData: unknown) => {
    const response = await client.post('/parts', partData);
    return response.data;
  },

  // 부품 수정
  updatePart: async (id: string, partData: unknown) => {
    const response = await client.put(`/parts/${id}`, partData);
    return response.data;
  },

  // 부품 삭제
  deletePart: async (id: string) => {
    const response = await client.delete(`/parts/${id}`);
    return response.data;
  },

  // HTTP 메서드 추가
  get: async <T>(url: string, params?: Record<string, unknown>) => {
    const response = await client.get(url);
    return response as T;
  },

  post: async <T>(url: string, data?: unknown) => {
    const response = await client.post(url, data);
    return response as T;
  },

  put: async <T>(url: string, data?: unknown) => {
    const response = await client.put(url, data);
    return response as T;
  },

  patch: async <T>(url: string, data?: unknown) => {
    const response = await client.patch(url, data);
    return response as T;
  },

  delete: async <T>(url: string) => {
    const response = await client.delete(url);
    return response as T;
  },
};

// ERP 연동 API
export const erpApi = {
  // ERP 시스템에서 부품 동기화
  syncParts: async () => {
    const response = await client.post('/erp/sync/parts');
    return response.data;
  },

  // ERP 시스템에서 주문 동기화
  syncOrders: async () => {
    const response = await client.post('/erp/sync/orders');
    return response.data;
  },

  // HTTP 메서드 추가
  post: async <T>(url: string, data?: unknown) => {
    const response = await client.post(url, data);
    return response as T;
  },
};
