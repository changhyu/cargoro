'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Package, AlertCircle, Edit, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cargoro/ui';

// 부품 타입 정의
interface Part {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  manufacturer: string;
  model?: string;
  unit: 'EA' | 'SET' | 'BOX' | 'L' | 'KG';
  currentStock: number;
  minStock: number;
  maxStock: number;
  location: string;
  price: number;
  cost: number;
  category: {
    id: string;
    name: string;
  };

  status: 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';
  lastRestocked?: string;
}

// 상태별 뱃지 색상
const statusColors = {
  ACTIVE: 'success',
  DISCONTINUED: 'secondary',
  OUT_OF_STOCK: 'destructive',
} as const;

// 상태 한글 매핑
const statusLabels = {
  ACTIVE: '판매중',
  DISCONTINUED: '단종',
  OUT_OF_STOCK: '재고없음',
};

// 단위 한글 매핑
const unitLabels = {
  EA: '개',
  SET: '세트',
  BOX: '박스',
  L: '리터',
  KG: 'kg',
};

export function InventoryList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 부품 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['parts', { search: searchQuery, category: categoryFilter, status: statusFilter }],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch('/api/parts')
      // return response.json()

      // 임시 더미 데이터
      return {
        items: [
          {
            id: '1',
            partNumber: 'ENG-001',
            name: '엔진오일 필터',
            description: '현대/기아 가솔린 엔진용',
            manufacturer: '현대모비스',
            model: '소나타, K5',
            unit: 'EA',
            currentStock: 45,
            minStock: 20,
            maxStock: 100,
            location: 'A-1-3',
            price: 15000,
            cost: 8000,
            category: {
              id: '1',
              name: '엔진부품',
            },
            status: 'ACTIVE',
            lastRestocked: '2025-01-05T10:00:00',
          },
          {
            id: '2',
            partNumber: 'BRK-003',
            name: '브레이크 패드 세트',
            description: '전륜용 브레이크 패드',
            manufacturer: '상신브레이크',
            model: '중형차 전용',
            unit: 'SET',
            currentStock: 12,
            minStock: 10,
            maxStock: 50,
            location: 'B-2-1',
            price: 85000,
            cost: 45000,
            category: {
              id: '2',
              name: '제동장치',
            },
            status: 'ACTIVE',
            lastRestocked: '2024-12-28T14:00:00',
          },
          {
            id: '3',
            partNumber: 'OIL-002',
            name: '엔진오일 5W-30',
            description: '합성 엔진오일',
            manufacturer: 'SK루브리컨츠',
            unit: 'L',
            currentStock: 5,
            minStock: 20,
            maxStock: 100,
            location: 'C-1-1',
            price: 12000,
            cost: 7000,
            category: {
              id: '3',
              name: '오일/윤활유',
            },
            status: 'OUT_OF_STOCK',
            lastRestocked: '2024-12-15T09:00:00',
          },
        ] as Part[],
        total: 3,
        categories: [
          { id: '1', name: '엔진부품' },
          { id: '2', name: '제동장치' },
          { id: '3', name: '오일/윤활유' },
          { id: '4', name: '전기장치' },
          { id: '5', name: '서스펜션' },
        ],
      };
    },
  });

  // 필터링된 데이터
  const filteredData = data?.items?.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && item.category.id !== categoryFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.partNumber.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.manufacturer.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // 재고 부족 부품 수 계산
  const lowStockCount = data?.items?.filter(item => item.currentStock <= item.minStock).length || 0;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">로딩중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-destructive">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 부품</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
            <p className="text-xs text-muted-foreground">등록된 부품 종류</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">재고 부족</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">주문 필요</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 재고 가치</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩
              {data?.items
                ?.reduce((sum, item) => sum + item.currentStock * item.cost, 0)
                .toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">원가 기준</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">카테고리</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.categories?.length || 0}</div>
            <p className="text-xs text-muted-foreground">부품 분류</p>
          </CardContent>
        </Card>
      </div>

      {/* 부품 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>재고 관리</CardTitle>
              <CardDescription>부품 재고를 확인하고 관리합니다</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/inventory/movements">재고 이동 내역</Link>
              </Button>
              <Button asChild>
                <Link href="/inventory/new">
                  <Plus className="mr-2 h-4 w-4" />
                  부품 등록
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 필터 및 검색 */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="부품번호, 부품명, 제조사로 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 카테고리</SelectItem>
                {data?.categories?.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="ACTIVE">판매중</SelectItem>
                <SelectItem value="DISCONTINUED">단종</SelectItem>
                <SelectItem value="OUT_OF_STOCK">재고없음</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 테이블 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>부품번호</TableHead>
                  <TableHead>부품명</TableHead>
                  <TableHead>제조사</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead className="text-center">재고</TableHead>
                  <TableHead className="text-center">최소재고</TableHead>
                  <TableHead>보관위치</TableHead>
                  <TableHead className="text-right">단가</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData && filteredData.length > 0 ? (
                  filteredData.map(part => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">{part.partNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{part.name}</div>
                          {part.description && (
                            <div className="text-sm text-muted-foreground">{part.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{part.manufacturer}</TableCell>
                      <TableCell>{part.category.name}</TableCell>
                      <TableCell className="text-center">
                        <div
                          className={
                            part.currentStock <= part.minStock ? 'font-medium text-destructive' : ''
                          }
                        >
                          {part.currentStock} {unitLabels[part.unit]}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {part.minStock} {unitLabels[part.unit]}
                      </TableCell>
                      <TableCell>{part.location}</TableCell>
                      <TableCell className="text-right">₩{part.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[part.status]}>
                          {statusLabels[part.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/inventory/${part.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="py-8 text-center">
                      <div className="text-muted-foreground">조건에 맞는 부품이 없습니다</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 재고 부족 알림 */}
          {lowStockCount > 0 && (
            <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  {lowStockCount}개 부품의 재고가 부족합니다. 주문이 필요합니다.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
