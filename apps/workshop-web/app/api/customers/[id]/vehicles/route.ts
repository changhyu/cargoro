import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { CustomerVehicle } from '../../../../features/customer-management/types';

// 이 라우트를 항상 동적으로 렌더링
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 임시 차량 데이터
const mockVehicles: CustomerVehicle[] = [
  {
    id: 'v1',
    customerId: '1',
    vehicleNumber: '12가 3456',
    manufacturer: '현대',
    model: '아반떼',
    year: 2022,
    vin: 'KMHD341GXNU123456',
    engineType: 'gasoline',
    color: '흰색',
    mileage: 25000,
    lastServiceMileage: 23000,
    registrationDate: '2022-03-15T10:00:00Z',
    notes: '정기 점검 주의',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
  },
  {
    id: 'v2',
    customerId: '2',
    vehicleNumber: '34나 5678',
    manufacturer: '기아',
    model: 'K5',
    year: 2023,
    vin: 'KNAG341GXNU789012',
    engineType: 'hybrid',
    color: '검정색',
    mileage: 15000,
    lastServiceMileage: 12000,
    registrationDate: '2023-11-20T10:00:00Z',
    createdAt: '2023-11-20T10:00:00Z',
    updatedAt: '2024-12-18T11:00:00Z',
  },
  {
    id: 'v3',
    customerId: '2',
    vehicleNumber: '56다 7890',
    manufacturer: '현대',
    model: '그랜저',
    year: 2021,
    vin: 'KMHG341GXNU345678',
    engineType: 'gasoline',
    color: '은색',
    mileage: 45000,
    lastServiceMileage: 42000,
    registrationDate: '2021-05-10T09:00:00Z',
    createdAt: '2023-11-20T10:00:00Z',
    updatedAt: '2024-12-15T15:00:00Z',
  },
];

// GET: 고객 차량 목록 조회
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customerVehicles = mockVehicles.filter(v => v.customerId === params.id);

  return NextResponse.json(customerVehicles);
}
