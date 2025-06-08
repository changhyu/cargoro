import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { CustomerStats } from '../../../features/customer-management/types';

// 이 라우트를 항상 동적으로 렌더링
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: 고객 통계 조회
export async function GET(_request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 임시 통계 데이터 (실제로는 데이터베이스에서 집계)
  const stats: CustomerStats = {
    totalCustomers: 156,
    activeCustomers: 142,
    newCustomersThisMonth: 12,
    totalRevenue: 125000000,
    averageServiceValue: 350000,
    topCustomers: [
      {
        id: '2',
        name: '(주)한국자동차',
        totalSpent: 8500000,
        serviceCount: 12,
      },
      {
        id: '5',
        name: '(주)서울운수',
        totalSpent: 6200000,
        serviceCount: 8,
      },
      {
        id: '8',
        name: '김대표',
        totalSpent: 4800000,
        serviceCount: 15,
      },
      {
        id: '12',
        name: '이사장',
        totalSpent: 3500000,
        serviceCount: 6,
      },
      {
        id: '1',
        name: '김철수',
        totalSpent: 1250000,
        serviceCount: 5,
      },
    ],
  };

  return NextResponse.json(stats);
}
