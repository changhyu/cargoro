import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { InventoryStats } from '@/features/parts-inventory/types';

// GET: 재고 통계 조회
export async function GET(_request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 임시 통계 데이터
  const stats: InventoryStats = {
    totalParts: 156,
    totalValue: 125000000,
    lowStockItems: 12,
    outOfStockItems: 3,
    categoriesBreakdown: [
      { categoryId: '1', categoryName: '오일류', count: 25, value: 15000000 },
      { categoryId: '2', categoryName: '브레이크', count: 30, value: 25000000 },
      { categoryId: '3', categoryName: '필터류', count: 45, value: 10000000 },
      { categoryId: '4', categoryName: '전기부품', count: 20, value: 35000000 },
      { categoryId: '5', categoryName: '엔진부품', count: 15, value: 30000000 },
      { categoryId: '6', categoryName: '기타', count: 21, value: 10000000 },
    ],
    topMovingParts: [
      { partId: '1', name: '엔진오일 5W-30', movementRate: 120, category: '오일류' },
      { partId: '2', name: '브레이크 패드 전륜', movementRate: 85, category: '브레이크' },
      { partId: '3', name: '에어필터', movementRate: 76, category: '필터류' },
      { partId: '5', name: '와이퍼 블레이드', movementRate: 65, category: '외부' },
      { partId: '6', name: '점화플러그', movementRate: 58, category: '점화' },
      { partId: '7', name: '오일필터', movementRate: 52, category: '필터류' },
      { partId: '8', name: '브레이크액', movementRate: 45, category: '브레이크' },
      { partId: '9', name: '부동액', movementRate: 40, category: '냉각' },
      { partId: '10', name: '타이밍벨트', movementRate: 35, category: '엔진' },
      { partId: '11', name: 'CV조인트', movementRate: 30, category: '구동' },
    ],
    stockValueTrend: [
      { date: '2024-12-01', value: 118000000 },
      { date: '2024-12-05', value: 120000000 },
      { date: '2024-12-10', value: 122000000 },
      { date: '2024-12-15', value: 123500000 },
      { date: '2024-12-20', value: 125000000 },
    ],
  };

  return NextResponse.json(stats);
}
