import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { Customer } from '../../../features/customer-management/types';

// 이 라우트를 항상 동적으로 렌더링
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 임시 데이터 (실제로는 데이터베이스 사용)
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '김철수',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    customerType: 'individual',
    registrationDate: '2024-01-15T09:00:00Z',
    lastServiceDate: '2024-12-20T14:30:00Z',
    totalServiceCount: 5,
    totalSpent: 1250000,
    status: 'active',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
  },
  {
    id: '2',
    name: '(주)한국자동차',
    email: 'contact@hankookauto.com',
    phone: '02-555-1234',
    address: '서울시 서초구 서초대로 456',
    businessNumber: '123-45-67890',
    customerType: 'business',
    registrationDate: '2023-11-20T10:00:00Z',
    lastServiceDate: '2024-12-18T11:00:00Z',
    totalServiceCount: 12,
    totalSpent: 8500000,
    status: 'active',
    createdAt: '2023-11-20T10:00:00Z',
    updatedAt: '2024-12-18T11:00:00Z',
  },
];

// GET: 고객 상세 조회
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customer = mockCustomers.find(c => c.id === params.id);

  if (!customer) {
    return NextResponse.json({ error: '고객을 찾을 수 없습니다' }, { status: 404 });
  }

  return NextResponse.json(customer);
}

// PATCH: 고객 수정
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const customerIndex = mockCustomers.findIndex(c => c.id === params.id);

  if (customerIndex === -1) {
    return NextResponse.json({ error: '고객을 찾을 수 없습니다' }, { status: 404 });
  }

  mockCustomers[customerIndex] = {
    ...mockCustomers[customerIndex],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(mockCustomers[customerIndex]);
}

// DELETE: 고객 삭제
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customerIndex = mockCustomers.findIndex(c => c.id === params.id);

  if (customerIndex === -1) {
    return NextResponse.json({ error: '고객을 찾을 수 없습니다' }, { status: 404 });
  }

  mockCustomers.splice(customerIndex, 1);

  return NextResponse.json({ message: '고객이 삭제되었습니다' });
}
