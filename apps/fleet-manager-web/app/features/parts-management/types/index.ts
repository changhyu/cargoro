export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PartCategory {
  ENGINE = 'ENGINE',
  BRAKE = 'BRAKE',
  SUSPENSION = 'SUSPENSION',
  ELECTRICAL = 'ELECTRICAL',
  TRANSMISSION = 'TRANSMISSION',
  FILTER = 'FILTER',
  FLUID = 'FLUID',
  TIRE = 'TIRE',
  BODY = 'BODY',
  OTHER = 'OTHER',
}

export enum PartStatus {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ON_ORDER = 'ON_ORDER',
  DISCONTINUED = 'DISCONTINUED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Part {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  category: PartCategory;
  price: number;
  cost: number;
  quantity: number;
  status: PartStatus;
  location: string;
  supplier: Supplier;
  manufacturerId?: string;
  manufacturerName?: string;
  minimumStockLevel: number;
  reorderPoint: number;
  lastOrderDate?: string;
  weight?: number;
  dimensions?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartOrder {
  id: string;
  orderNumber: string;
  partId: string;
  part: Part;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
  supplierId: string;
  supplier: Supplier;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartFilterParams {
  search?: string;
  category?: PartCategory;
  status?: PartStatus;
  supplierId?: string;
  minQuantity?: number;
  maxQuantity?: number;
  skip?: number;
  limit?: number;
}

export interface OrderFilterParams {
  search?: string;
  status?: OrderStatus;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  skip?: number;
  limit?: number;
}

export interface SupplierFilterParams {
  name?: string;
  city?: string;
  country?: string;
  status?: string;
  skip?: number;
  limit?: number;
}

export interface InventoryStats {
  totalParts: number;
  lowStockParts: number;
  outOfStockParts: number;
  totalValue: number;
  pendingOrders: number;
}
