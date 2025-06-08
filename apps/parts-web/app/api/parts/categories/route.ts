import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { PartCategoryWithCount } from '@/features/parts-inventory/types';

// 임시 카테고리 데이터
const mockCategories: PartCategoryWithCount[] = [
  { categoryId: '1', name: '오일류', count: 45 },
  { categoryId: '2', name: '브레이크', count: 58 },
  { categoryId: '3', name: '필터류', count: 76 },
  { categoryId: '4', name: '전기부품', count: 42 },
  { categoryId: '5', name: '엔진부품', count: 124 },
  { categoryId: '6', name: '서스펜션', count: 29 },
  { categoryId: '7', name: '냉각계통', count: 35 },
  { categoryId: '8', name: '배기계통', count: 18 },
  { categoryId: '9', name: '외장부품', count: 43 },
  { categoryId: '10', name: '기타', count: 23 },
];

// GET: 카테고리 목록 조회
export async function GET(_request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(mockCategories);
}
