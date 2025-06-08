// 결제 및 송장 관련 타입 정의

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  vehicleId?: string;
  vehicleInfo?: string;
  repairId?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'credit';
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  type: 'service' | 'part' | 'other';
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  customerId: string;
  vehicleId?: string;
  repairId?: string;
  issueDate?: string;
  dueDate: string;
  items: Omit<InvoiceItem, 'id'>[];
  discount?: number;
  notes?: string;
}

export interface UpdateInvoiceInput {
  dueDate?: string;
  items?: Omit<InvoiceItem, 'id'>[];
  discount?: number;
  notes?: string;
  status?: Invoice['status'];
}

export interface CreatePaymentInput {
  invoiceId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';
  transactionId?: string;
  notes?: string;
}

export interface InvoiceFilter {
  search?: string;
  customerId?: string;
  status?: Invoice['status'] | 'all';
  paymentStatus?: Invoice['paymentStatus'] | 'all';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'invoiceNumber' | 'issueDate' | 'dueDate' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  monthlyRevenue: Array<{
    month: string;
    amount: number;
  }>;
  paymentMethodBreakdown: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
}
