export enum RepairJobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface RepairJobInput {
  vehicleId: string;
  vehicleInfo: {
    licensePlate: string;
    manufacturer: string;
    model: string;
    year: number;
    vin: string;
  };
  customerInfo: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  description: string;
  status: string;
  type?: string;
  priority?: string;
  estimatedHours?: number;
  assignedTechnicianId?: string | null;
  startDate?: string | null;
  completionDate?: string | null;
  notes?: string;
  cost?: {
    labor: number;
    parts: number;
    total: number;
    currency: string;
  };
  usedParts?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  diagnostics?: Array<{
    id: string;
    code: string;
    description: string;
    timestamp: string;
  }>;
  images: Array<RepairImage>; // Required field
}

export interface RepairImage {
  id: string;
  url: string;
  description?: string;
}
