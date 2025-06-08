// 부품 재고 관련 타입 정의

export interface Part {
  id: string;
  partId?: string; // 부품번호 (기존 서비스와 호환성 유지)
  partNumber?: string; // 부품번호
  name: string;
  description?: string;
  category: string | PartCategory;
  manufacturer: string;
  model?: string; // 적용 차종
  unit?: 'EA' | 'SET' | 'BOX' | 'L' | 'KG'; // 단위
  currentStock?: number;
  stockQuantity?: number; // 기존 코드와 호환성 유지
  minStock?: number; // 최소 재고
  minStockLevel?: number; // 기존 코드와 호환성 유지
  maxStock?: number; // 최대 재고
  location: string; // 보관 위치
  price: number; // 판매가
  cost?: number; // 원가
  supplier?: Supplier;
  supplierId?: string;
  barcode?: string;
  imageUrl?: string;
  notes?: string;
  status: 'active' | 'discontinued' | 'out_of_stock' | 'low_stock';
  lastStockUpdate?: string; // 최근 재고 업데이트 날짜
  lastRestocked?: string;
  createdAt?: string;
  updatedAt?: string;
  compatibility?: string[]; // 호환 차량 목록
  reorderPoint?: number; // 재주문 포인트
}

export interface PartCategory {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  count?: number; // 카테고리별 부품 수
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  businessNumber?: string;
  paymentTerms?: string; // 결제 조건
  leadTime?: number; // 리드타임 (일)
  rating?: number; // 평가 점수
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  partId: string;
  type: 'in' | 'out' | 'adjust'; // 입고/출고/조정
  quantity: number;
  previousStock?: number;
  newStock?: number;
  reason: string;
  referenceType?: 'purchase_order' | 'work_order' | 'adjustment';
  referenceId?: string;
  performedBy?: string;
  notes?: string;
  createdAt?: string;
  date: string; // 이동 날짜 (ISO 문자열)
  userId: string; // 작업자 ID
  userName: string; // 작업자 이름
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  partId: string;
  partNumber: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  receivedQuantity?: number;
}

export interface CreatePartInput {
  partNumber: string;
  name: string;
  description?: string;
  categoryId: string;
  manufacturer: string;
  model?: string;
  unit: Part['unit'];
  minStock: number;
  maxStock: number;
  location: string;
  price: number;
  cost: number;
  supplierId?: string;
  barcode?: string;
  notes?: string;
}

export interface UpdatePartInput extends Partial<CreatePartInput> {
  status?: Part['status'];
}

export interface CreateSupplierInput {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  businessNumber?: string;
  paymentTerms?: string;
  leadTime?: number;
  notes?: string;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {
  status?: Supplier['status'];
  rating?: number;
}

export interface PartFilter {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  status?: Part['status'] | 'all';
  stockLevel?: 'all' | 'low' | 'normal' | 'over';
  sortBy?: 'partNumber' | 'name' | 'currentStock' | 'lastRestocked';
  sortOrder?: 'asc' | 'desc';
}

export interface InventoryStats {
  totalParts: number;
  totalValue: number; // 재고 총 가치
  lowStockCount: number; // 이전 필드명: lowStockItems
  outOfStockCount: number; // 이전 필드명: outOfStockItems
  valueByCategory: Array<{
    // 이전 필드명: categoriesBreakdown
    category: string;
    value: number;
  }>;
  recentValueTrend: Array<{
    // 이전 필드명: stockValueTrend
    date: string;
    value: number;
  }>;
  topMovingParts: Array<{
    partId: string;
    name: string; // 이전 필드명: partName
    movementRate: number; // 이전 필드명: movement
    category: string;
  }>;
}
