import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { CustomerServiceHistory } from '../../../../features/customer-management/types';

// 이 라우트를 항상 동적으로 렌더링
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 임시 서비스 이력 데이터
const mockServiceHistory: CustomerServiceHistory[] = [
  {
    id: 's1',
    customerId: '1',
    vehicleId: 'v1',
    serviceDate: '2024-12-20T14:30:00Z',
    serviceType: '정기 점검',
    description: '엔진오일 교환, 에어필터 교체, 브레이크 점검',
    technician: '박기술',
    totalCost: 150000,
    paymentStatus: 'paid',
    paymentMethod: 'card',
    invoiceNumber: 'INV-2024-001234',
    notes: '다음 점검 예정일: 2025-06-20',
    createdAt: '2024-12-20T14:30:00Z',
    updatedAt: '2024-12-20T15:00:00Z',
  },
  {
    id: 's2',
    customerId: '1',
    vehicleId: 'v1',
    serviceDate: '2024-09-15T10:00:00Z',
    serviceType: '타이어 교체',
    description: '전륜 타이어 2개 교체',
    technician: '김정비',
    totalCost: 280000,
    paymentStatus: 'paid',
    paymentMethod: 'transfer',
    invoiceNumber: 'INV-2024-000987',
    createdAt: '2024-09-15T10:00:00Z',
    updatedAt: '2024-09-15T11:30:00Z',
  },
  {
    id: 's3',
    customerId: '2',
    vehicleId: 'v2',
    serviceDate: '2024-12-18T11:00:00Z',
    serviceType: '배터리 점검',
    description: '하이브리드 배터리 상태 점검 및 소프트웨어 업데이트',
    technician: '이전기',
    totalCost: 80000,
    paymentStatus: 'paid',
    paymentMethod: 'card',
    invoiceNumber: 'INV-2024-001230',
    createdAt: '2024-12-18T11:00:00Z',
    updatedAt: '2024-12-18T12:00:00Z',
  },
  {
    id: 's4',
    customerId: '2',
    vehicleId: 'v3',
    serviceDate: '2024-12-15T15:00:00Z',
    serviceType: '사고 수리',
    description: '후면 범퍼 교체, 트렁크 판금 도색',
    technician: '최판금',
    totalCost: 1200000,
    paymentStatus: 'pending',
    notes: '보험 처리 진행 중',
    createdAt: '2024-12-15T15:00:00Z',
    updatedAt: '2024-12-15T17:00:00Z',
  },
];

// GET: 고객 서비스 이력 조회
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customerHistory = mockServiceHistory
    .filter(h => h.customerId === params.id)
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());

  return NextResponse.json(customerHistory);
}
