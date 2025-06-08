import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { Customer } from '../../features/customer-management/types';

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
  {
    id: '3',
    name: '이영희',
    email: 'lee@example.com',
    phone: '010-9876-5432',
    address: '서울시 송파구 올림픽로 789',
    customerType: 'individual',
    registrationDate: '2024-03-10T13:00:00Z',
    totalServiceCount: 0,
    totalSpent: 0,
    status: 'active',
    createdAt: '2024-03-10T13:00:00Z',
    updatedAt: '2024-03-10T13:00:00Z',
  },
];

// GET: 고객 목록 조회
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') || '';
  const customerType = searchParams.get('customerType') || 'all';
  const status = searchParams.get('status') || 'all';
  const sortBy = searchParams.get('sortBy') || 'name';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  let filteredCustomers = [...mockCustomers];

  // 검색 필터
  if (search) {
    filteredCustomers = filteredCustomers.filter(
      customer =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search)
    );
  }

  // 고객 타입 필터
  if (customerType !== 'all') {
    filteredCustomers = filteredCustomers.filter(
      customer => customer.customerType === customerType
    );
  }

  // 상태 필터
  if (status !== 'all') {
    filteredCustomers = filteredCustomers.filter(customer => customer.status === status);
  }

  // 정렬
  filteredCustomers.sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'registrationDate':
        compareValue =
          new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
        break;
      case 'lastServiceDate': {
        const aDate = a.lastServiceDate ? new Date(a.lastServiceDate).getTime() : 0;
        const bDate = b.lastServiceDate ? new Date(b.lastServiceDate).getTime() : 0;
        compareValue = aDate - bDate;
        break;
      }
      case 'totalSpent':
        compareValue = a.totalSpent - b.totalSpent;
        break;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  return NextResponse.json(filteredCustomers);
}

// POST: 고객 생성
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const newCustomer: Customer = {
    id: Date.now().toString(),
    ...body,
    registrationDate: new Date().toISOString(),
    totalServiceCount: 0,
    totalSpent: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockCustomers.push(newCustomer);

  return NextResponse.json(newCustomer, { status: 201 });
}
