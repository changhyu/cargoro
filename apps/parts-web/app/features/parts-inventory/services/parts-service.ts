'use client';

import {
  Part,
  PartFilter,
  StockMovement,
  StockMovementType,
  PartCategory,
  InventoryStats,
  PartCategoryWithCount,
  PartStatus,
} from '../types';

// 모킹 데이터
const mockParts: Part[] = [
  {
    id: '1',
    partNumber: 'P001',
    name: '브레이크 패드',
    category: PartCategory.BRAKE,
    price: 55000,
    cost: 40000,
    quantity: 28,
    status: PartStatus.IN_STOCK,
    location: 'A-10-23',
    supplierId: '1',
    manufacturer: '현대모비스',
    minimumStockLevel: 10,
    reorderPoint: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    partNumber: 'P002',
    name: '오일 필터',
    category: PartCategory.ENGINE,
    price: 12000,
    cost: 8000,
    quantity: 5,
    status: PartStatus.LOW_STOCK,
    location: 'B-05-11',
    supplierId: '2',
    manufacturer: '만도',
    minimumStockLevel: 20,
    reorderPoint: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    partNumber: 'P003',
    name: '에어 필터',
    category: PartCategory.ENGINE,
    price: 15000,
    cost: 10000,
    quantity: 8,
    status: PartStatus.LOW_STOCK,
    location: 'B-06-03',
    supplierId: '3',
    manufacturer: '한국필터',
    minimumStockLevel: 15,
    reorderPoint: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    partNumber: 'P004',
    name: '점화 플러그',
    category: PartCategory.ELECTRICAL,
    price: 8000,
    cost: 5000,
    quantity: 35,
    status: PartStatus.IN_STOCK,
    location: 'C-02-15',
    supplierId: '4',
    manufacturer: 'NGK',
    minimumStockLevel: 20,
    reorderPoint: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    partNumber: 'P005',
    name: '와이퍼 블레이드',
    category: PartCategory.EXTERIOR,
    price: 25000,
    cost: 18000,
    quantity: 30,
    status: PartStatus.IN_STOCK,
    location: 'D-08-04',
    supplierId: '5',
    manufacturer: '보쉬',
    minimumStockLevel: 10,
    reorderPoint: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockCategories: PartCategoryWithCount[] = [
  { categoryId: '1', name: '브레이크', count: 58 },
  { categoryId: '2', name: '엔진', count: 124 },
  { categoryId: '3', name: '전기', count: 76 },
  { categoryId: '4', name: '외부', count: 43 },
  { categoryId: '5', name: '냉각', count: 35 },
  { categoryId: '6', name: '서스펜션', count: 29 },
  { categoryId: '7', name: '점화', count: 18 },
];

const mockStats: InventoryStats = {
  totalParts: 383,
  totalValue: 35600000,
  lowStockItems: 47,
  lowStockCount: 47,
  outOfStockItems: 12,
  outOfStockCount: 12,
  categoriesBreakdown: [
    { categoryId: '1', categoryName: '엔진', count: 124, value: 12500000 },
    { categoryId: '2', categoryName: '브레이크', count: 58, value: 8900000 },
    { categoryId: '3', categoryName: '전기', count: 76, value: 6800000 },
    { categoryId: '4', categoryName: '냉각', count: 35, value: 4200000 },
    { categoryId: '5', categoryName: '서스펜션', count: 29, value: 3600000 },
  ],
  valueByCategory: [
    { name: '엔진', value: 12500000 },
    { name: '브레이크', value: 8900000 },
    { name: '전기', value: 6800000 },
    { name: '냉각', value: 4200000 },
    { name: '서스펜션', value: 3600000 },
  ],
  topMovingParts: [
    { partId: 'P012', name: '엔진 오일', movementRate: 100, category: '엔진' },
    { partId: 'P045', name: '브레이크 패드', movementRate: 87, category: '브레이크' },
    { partId: 'P076', name: '스파크 플러그', movementRate: 72, category: '점화' },
    { partId: 'P021', name: '에어 필터', movementRate: 65, category: '엔진' },
    { partId: 'P098', name: '타이밍 벨트 키트', movementRate: 58, category: '엔진' },
  ],
  stockValueTrend: [
    { date: '2023-01-01', value: 32000000 },
    { date: '2023-02-01', value: 32500000 },
    { date: '2023-03-01', value: 33100000 },
    { date: '2023-04-01', value: 33800000 },
    { date: '2023-05-01', value: 34500000 },
    { date: '2023-06-01', value: 34200000 },
    { date: '2023-07-01', value: 35100000 },
    { date: '2023-08-01', value: 35600000 },
  ],
  recentValueTrend: [
    { date: '2023-01-01', value: 32000000 },
    { date: '2023-02-01', value: 32500000 },
    { date: '2023-03-01', value: 33100000 },
    { date: '2023-04-01', value: 33800000 },
    { date: '2023-05-01', value: 34500000 },
    { date: '2023-06-01', value: 34200000 },
    { date: '2023-07-01', value: 35100000 },
    { date: '2023-08-01', value: 35600000 },
  ],
};

const mockStockMovements: StockMovement[] = [
  {
    id: '1',
    partId: '1',
    type: StockMovementType.IN,
    quantity: 10,
    previousQuantity: 18,
    newQuantity: 28,
    reason: '정기 발주',
    performedBy: 'user1',
    performedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: '2',
    partId: '1',
    type: StockMovementType.OUT,
    quantity: -2,
    previousQuantity: 30,
    newQuantity: 28,
    reason: '고객 주문',
    performedBy: 'user2',
    performedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '3',
    partId: '1',
    type: StockMovementType.OUT,
    quantity: -1,
    previousQuantity: 29,
    newQuantity: 28,
    reason: '고객 주문',
    performedBy: 'user2',
    performedAt: new Date().toISOString(),
  },
];

// API 함수들
export const partsService = {
  // 부품 목록 조회
  getParts: async (
    _filter?: PartFilter
  ): Promise<{ parts: Part[]; total: number; page: number; limit: number; totalPages: number }> => {
    // 모킹 데이터 반환
    return {
      parts: mockParts,
      total: mockParts.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
  },

  // 부품 상세 조회
  getPart: async (id: string): Promise<Part> => {
    const part = mockParts.find(p => p.id === id);
    if (!part) {
      throw new Error('부품을 찾을 수 없습니다');
    }
    return part;
  },

  // 부품 등록
  createPart: async (data: Omit<Part, 'id'>): Promise<Part> => {
    // 새 부품 생성 시뮬레이션
    return {
      ...data,
      id: `${mockParts.length + 1}`,
      updatedAt: new Date().toISOString(),
    };
  },

  // 부품 수정
  updatePart: async (id: string, data: Partial<Part>): Promise<Part> => {
    const part = mockParts.find(p => p.id === id);
    if (!part) {
      throw new Error('부품을 찾을 수 없습니다');
    }

    // 부품 업데이트 시뮬레이션
    return { ...part, ...data, updatedAt: new Date().toISOString() };
  },

  // 부품 삭제
  deletePart: async (_id: string): Promise<void> => {
    // 삭제 시뮬레이션
    return;
  },

  // 재고 이동 이력 조회
  getStockMovements: async (partId: string): Promise<StockMovement[]> => {
    return mockStockMovements.filter(m => m.partId === partId);
  },

  // 재고 조정
  adjustStock: async ({
    partId,
    quantity,
    type,
    reason,
  }: {
    partId: string;
    quantity: number;
    type: 'in' | 'out' | 'adjust';
    reason: string;
  }): Promise<StockMovement> => {
    // 현재 부품 찾기
    const part = mockParts.find(p => p.id === partId);
    if (!part) {
      throw new Error('부품을 찾을 수 없습니다');
    }

    // 재고 조정 시뮬레이션
    const adjustedQuantity = type === 'out' ? -Math.abs(quantity) : Math.abs(quantity);
    const currentStock = part.quantity ?? 0;
    const newStock = currentStock + adjustedQuantity;

    return {
      id: `${mockStockMovements.length + 1}`,
      partId,
      type:
        type === 'adjust'
          ? StockMovementType.ADJUSTMENT
          : (type.toUpperCase() as StockMovementType),
      quantity: adjustedQuantity,
      previousQuantity: currentStock,
      newQuantity: newStock,
      reason,
      performedBy: 'current-user',
      performedAt: new Date().toISOString(),
    };
  },

  // 카테고리 목록 조회
  getCategories: async (): Promise<PartCategoryWithCount[]> => {
    return mockCategories;
  },

  // 재고 통계 조회
  getInventoryStats: async (): Promise<InventoryStats> => {
    return mockStats;
  },
};
