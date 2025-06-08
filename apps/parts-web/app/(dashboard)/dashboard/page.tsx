'use client';

import { InventoryDashboard } from '@/features/parts-inventory/components/inventory-dashboard';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">대시보드</h1>
      <InventoryDashboard />
    </div>
  );
}
