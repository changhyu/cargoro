import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Part, PartCategory, PartStatus } from '@/features/parts-inventory/types';

// 임시 데이터
const mockParts: Part[] = [
  {
    id: '1',
    partNumber: 'EO-001',
    name: '엔진오일 5W-30',
    description: '합성 엔진오일',
    category: PartCategory.FLUID,
    manufacturer: 'SK루브리컨츠',
    price: 35000,
    cost: 25000,
    quantity: 45,
    status: PartStatus.IN_STOCK,
    location: 'A-01-01',
    supplierId: '1',
    minimumStockLevel: 20,
    reorderPoint: 25,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
  },
  {
    id: '2',
    partNumber: 'BPF-001',
    name: '브레이크 패드 전륜',
    description: '프리미엄 브레이크 패드',
    category: PartCategory.BRAKE,
    manufacturer: '상신브레이크',
    price: 85000,
    cost: 60000,
    quantity: 12,
    status: PartStatus.LOW_STOCK,
    location: 'B-02-03',
    supplierId: '2',
    minimumStockLevel: 10,
    reorderPoint: 15,
    createdAt: '2024-02-20T11:00:00Z',
    updatedAt: '2024-12-10T14:00:00Z',
  },
  {
    id: '3',
    partNumber: 'AF-001',
    name: '에어필터',
    description: '고효율 에어필터',
    category: PartCategory.FILTER,
    manufacturer: '만도',
    price: 25000,
    cost: 15000,
    quantity: 5,
    status: PartStatus.LOW_STOCK,
    location: 'C-03-02',
    supplierId: '3',
    minimumStockLevel: 15,
    reorderPoint: 20,
    createdAt: '2024-03-10T13:00:00Z',
    updatedAt: '2024-11-20T09:00:00Z',
  },
  {
    id: '4',
    partNumber: 'BAT-001',
    name: '자동차 배터리 80A',
    description: '무보수 MF 배터리',
    category: PartCategory.ELECTRICAL,
    manufacturer: '델코',
    price: 150000,
    cost: 110000,
    quantity: 0,
    status: PartStatus.OUT_OF_STOCK,
    location: 'D-01-01',
    supplierId: '4',
    minimumStockLevel: 5,
    reorderPoint: 8,
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-12-20T16:00:00Z',
  },
];

// GET: 부품 목록 조회
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') as PartCategory | null;
  const status = searchParams.get('status') as PartStatus | null;
  const stockLevel = searchParams.get('stockLevel') || 'all';
  const sortBy = searchParams.get('sortBy') || 'partNumber';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  let filteredParts = [...mockParts];

  // 검색 필터
  if (search) {
    filteredParts = filteredParts.filter(
      part =>
        part.partNumber?.toLowerCase().includes(search.toLowerCase()) ||
        part.name.toLowerCase().includes(search.toLowerCase()) ||
        part.manufacturer?.toLowerCase().includes(search.toLowerCase())
    );
  }

  // 카테고리 필터
  if (category) {
    filteredParts = filteredParts.filter(part => part.category === category);
  }

  // 상태 필터
  if (status) {
    filteredParts = filteredParts.filter(part => part.status === status);
  }

  // 재고 수준 필터
  if (stockLevel !== 'all') {
    filteredParts = filteredParts.filter(part => {
      const currentStock = part.quantity ?? 0;
      const minStock = part.minimumStockLevel ?? 0;
      const reorderPoint = part.reorderPoint ?? 0;

      if (stockLevel === 'low') return currentStock < minStock;
      if (stockLevel === 'reorder') return currentStock <= reorderPoint;
      if (stockLevel === 'out') return currentStock === 0;
      return true;
    });
  }

  // 정렬
  filteredParts.sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'partNumber':
        compareValue = (a.partNumber || '').localeCompare(b.partNumber || '');
        break;
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'quantity':
        compareValue = (a.quantity ?? 0) - (b.quantity ?? 0);
        break;
      case 'updatedAt':
        compareValue = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
        break;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  return NextResponse.json(filteredParts);
}

// POST: 부품 생성
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const newPart: Part = {
      id: Date.now().toString(),
      ...body,
      quantity: 0,
      status: PartStatus.OUT_OF_STOCK,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockParts.push(newPart);

    return NextResponse.json(newPart, { status: 201 });
  } catch {
    return NextResponse.json({ error: '부품 생성에 실패했습니다' }, { status: 400 });
  }
}
