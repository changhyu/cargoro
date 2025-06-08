'use client';

import { InventoryDashboard } from '@/features/parts-inventory/components/inventory-dashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InventoryStatsPage() {
  const router = useRouter();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로가기
        </Button>
        <h1 className="text-2xl font-bold">재고 통계</h1>
      </div>
      <InventoryDashboard />
    </div>
  );
}
