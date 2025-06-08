/**
 * 재고 관리 관련 타입 정의
 */

/**
 * 부품 카테고리 열거형
 */
export enum PartCategory {
  ENGINE = 'ENGINE',
  BRAKE = 'BRAKE',
  TRANSMISSION = 'TRANSMISSION',
  ELECTRICAL = 'ELECTRICAL',
  BODY = 'BODY',
  INTERIOR = 'INTERIOR',
  EXTERIOR = 'EXTERIOR',
  FLUID = 'FLUID',
  FILTER = 'FILTER',
  OTHER = 'OTHER',
}

/**
 * 부품 상태 열거형
 */
export enum PartStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
  ON_ORDER = 'ON_ORDER',
}

/**
 * 공급업체 상태 열거형
 */
export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/**
 * 공급업체 인터페이스
 */
export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: SupplierStatus;
  website?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 부품 인터페이스
 */
export interface Part {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  category: PartCategory;
  price: number;
  cost?: number;
  quantity: number;
  status: PartStatus;
  location?: string;
  supplier?: string | Supplier;
  supplierId?: string;
  minimumStockLevel?: number;
  reorderPoint?: number;
  leadTime?: number;
  dimensions?: string;
  weight?: string;
  manufacturer?: string;
  manufacturerPartNumber?: string;
  barcode?: string;
  notes?: string;
  image?: string;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 부품 필터 인터페이스
 */
export interface PartFilter {
  category?: PartCategory;
  status?: PartStatus;
  search?: string;
  supplierId?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
}

/**
 * 부품 생성 입력 인터페이스
 */
export interface CreatePartInput {
  partNumber: string;
  name: string;
  description?: string;
  category: PartCategory;
  price: number;
  cost?: number;
  quantity: number;
  status?: PartStatus;
  location?: string;
  supplierId?: string;
  minimumStockLevel?: number;
  reorderPoint?: number;
  leadTime?: number;
  dimensions?: string;
  weight?: string;
  manufacturer?: string;
  manufacturerPartNumber?: string;
  barcode?: string;
  notes?: string;
  image?: string;
}

/**
 * 부품 수정 입력 인터페이스
 */
export interface UpdatePartInput {
  partNumber?: string;
  name?: string;
  description?: string;
  category?: PartCategory;
  price?: number;
  cost?: number;
  quantity?: number;
  status?: PartStatus;
  location?: string;
  supplierId?: string;
  minimumStockLevel?: number;
  reorderPoint?: number;
  leadTime?: number;
  dimensions?: string;
  weight?: string;
  manufacturer?: string;
  manufacturerPartNumber?: string;
  barcode?: string;
  notes?: string;
  image?: string;
}

/**
 * 재고 이동 타입
 */
export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  TRANSFER = 'TRANSFER',
}

/**
 * 재고 이동 인터페이스
 */
export interface StockMovement {
  id: string;
  partId: string;
  part?: Part;
  type: StockMovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

/**
 * 구매 주문 상태
 */
export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ORDERED = 'ORDERED',
  PARTIAL_RECEIVED = 'PARTIAL_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

/**
 * 구매 주문 항목
 */
export interface PurchaseOrderItem {
  id: string;
  partId: string;
  part?: Part;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
  notes?: string;
}

/**
 * 구매 주문 인터페이스
 */
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier?: Supplier;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax?: number;
  shipping?: number;
  total: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 공급업체 생성 입력
 */
export interface CreateSupplierInput {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: SupplierStatus;
  website?: string;
  notes?: string;
}

/**
 * 공급업체 수정 입력
 */
export interface UpdateSupplierInput {
  name?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: SupplierStatus;
  website?: string;
  notes?: string;
}

/**
 * 카테고리별 재고 분석
 */
export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  count: number;
  value: number;
}

/**
 * 인기 부품 정보
 */
export interface TopMovingPart {
  partId: string;
  name: string;
  movementRate: number;
  category: string;
}

/**
 * 재고 가치 추이
 */
export interface StockValueTrend {
  date: string;
  value: number;
}

/**
 * 재고 통계 인터페이스
 */
export interface InventoryStats {
  totalParts: number;
  totalValue: number;
  lowStockItems: number;
  lowStockCount?: number; // 호환성을 위해 추가
  outOfStockItems: number;
  outOfStockCount?: number; // 호환성을 위해 추가
  categoriesBreakdown: CategoryBreakdown[];
  valueByCategory?: Array<{ name: string; value: number }>; // 호환성을 위해 추가
  topMovingParts: TopMovingPart[];
  stockValueTrend: StockValueTrend[];
  recentValueTrend?: Array<{ date: string; value: number }>; // 호환성을 위해 추가
}

/**
 * API 응답 제네릭 인터페이스
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * 카테고리별 부품 수
 */
export interface PartCategoryWithCount {
  id?: string; // 선택적으로 변경
  categoryId: string;
  name: string;
  count: number;
}
