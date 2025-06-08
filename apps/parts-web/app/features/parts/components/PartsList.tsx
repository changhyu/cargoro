'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
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
import {
  Search,
  Plus,
  Package,
  AlertCircle,
  Eye,
  Edit,
  MoreVertical,
  TrendingDown,
  Truck,
  BarChart,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// 부품 타입 정의
interface Part {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  manufacturer: string;
  model?: string;
  description?: string;
  unit: string;
  price: number;
  cost?: number;
  minStock: number;
  maxStock?: number;
  leadTimeDays?: number;
  isActive: boolean;
  tags: string[];
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  isLowStock: boolean;
  primarySupplier?: {
    supplierName: string;
    supplyPrice: number;
    leadTimeDays?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 카테고리 매핑
const categoryLabels: Record<string, string> = {
  ENGINE: '엔진',
  BRAKE: '브레이크',
  SUSPENSION: '서스펜션',
  ELECTRICAL: '전기/전자',
  BODY: '차체',
  INTERIOR: '내장',
  FILTER: '필터',
  FLUID: '오일/유체',
  OTHER: '기타',
};

export function PartsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // 부품 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['parts', { search: searchQuery, category: categoryFilter, stockFilter }],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch('/api/parts')
      // return response.json()

      // 임시 더미 데이터
      return {
        items: [
          {
            id: '1',
            partNumber: 'OIL-5W30-1L',
            name: '엔진오일 5W-30 1L',
            category: 'FLUID',
            manufacturer: 'Mobil',
            model: 'Mobil 1',
            description: '합성 엔진오일',
            unit: 'L',
            price: 15000,
            cost: 10000,
            minStock: 50,
            maxStock: 200,
            leadTimeDays: 3,
            isActive: true,
            tags: ['엔진오일', '합성유'],
            currentStock: 45,
            reservedStock: 5,
            availableStock: 40,
            isLowStock: true,
            primarySupplier: {
              supplierName: '한국모빌',
              supplyPrice: 10000,
              leadTimeDays: 3,
            },
            createdAt: '2023-01-15',
            updatedAt: '2025-01-10',
          },
          {
            id: '2',
            partNumber: 'BRK-PAD-FR-001',
            name: '브레이크 패드 (전륜)',
            category: 'BRAKE',
            manufacturer: 'Bosch',
            description: '고성능 브레이크 패드',
            unit: 'SET',
            price: 80000,
            cost: 55000,
            minStock: 20,
            maxStock: 50,
            leadTimeDays: 5,
            isActive: true,
            tags: ['브레이크', '전륜'],
            currentStock: 35,
            reservedStock: 3,
            availableStock: 32,
            isLowStock: false,
            primarySupplier: {
              supplierName: '보쉬코리아',
              supplyPrice: 55000,
              leadTimeDays: 5,
            },
            createdAt: '2023-02-20',
            updatedAt: '2025-01-08',
          },
          {
            id: '3',
            partNumber: 'FLT-AIR-001',
            name: '에어필터',
            category: 'FILTER',
            manufacturer: 'Mann',
            unit: 'EA',
            price: 25000,
            cost: 15000,
            minStock: 30,
            isActive: true,
            tags: ['필터', '에어'],
            currentStock: 25,
            reservedStock: 0,
            availableStock: 25,
            isLowStock: true,
            createdAt: '2023-03-10',
            updatedAt: '2025-01-05',
          },
        ] as Part[],
        total: 3,
      };
    },
  });

  // 필터링된 데이터
  const filteredData = data?.items?.filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (stockFilter === 'low' && !item.isLowStock) return false;
    if (stockFilter === 'out' && item.currentStock > 0) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.partNumber.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.manufacturer.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

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

  // 통계 계산
  const totalParts = filteredData?.length || 0;
  const lowStockParts = filteredData?.filter(p => p.isLowStock).length || 0;
  const outOfStockParts = filteredData?.filter(p => p.currentStock === 0).length || 0;
  const totalValue = filteredData?.reduce((sum, p) => sum + p.currentStock * p.price, 0) || 0;

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
            <div className="text-2xl font-bold">{totalParts}</div>
            <p className="text-xs text-muted-foreground">등록된 부품 종류</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">재고 부족</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{lowStockParts}</div>
            <p className="text-xs text-muted-foreground">최소 재고 미달</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">품절</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{outOfStockParts}</div>
            <p className="text-xs text-muted-foreground">재고 없음</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">재고 가치</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{Math.round(totalValue / 1000000)}M</div>
            <p className="text-xs text-muted-foreground">총 재고 금액</p>
          </CardContent>
        </Card>
      </div>

      {/* 부품 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>부품 관리</CardTitle>
              <CardDescription>등록된 부품을 조회하고 관리합니다</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/purchase-orders">
                  <Truck className="mr-2 h-4 w-4" />
                  구매 주문
                </Link>
              </Button>
              <Button asChild>
                <Link href="/parts/new">
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
                placeholder="부품번호, 부품명, 제조사, 태그로 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 카테고리</SelectItem>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="재고 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="low">재고 부족</SelectItem>
                <SelectItem value="out">품절</SelectItem>
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
                  <TableHead>카테고리</TableHead>
                  <TableHead>제조사</TableHead>
                  <TableHead>단가</TableHead>
                  <TableHead>재고</TableHead>
                  <TableHead>공급업체</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData && filteredData.length > 0 ? (
                  filteredData.map(part => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{part.partNumber}</div>
                          {part.tags.length > 0 && (
                            <div className="mt-1 flex gap-1">
                              {part.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {part.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{part.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{part.name}</div>
                          {part.description && (
                            <div className="text-sm text-muted-foreground">{part.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[part.category] || part.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{part.manufacturer}</div>
                          {part.model && (
                            <div className="text-sm text-muted-foreground">{part.model}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">₩{part.price.toLocaleString()}</div>
                          {part.cost && (
                            <div className="text-sm text-muted-foreground">
                              원가: ₩{part.cost.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={cn(
                            'space-y-1',
                            part.isLowStock && 'text-orange-500',
                            part.currentStock === 0 && 'text-red-500'
                          )}
                        >
                          <div className="font-medium">
                            {part.currentStock}
                            {part.unit}
                          </div>
                          {part.reservedStock > 0 && (
                            <div className="text-xs">
                              예약: {part.reservedStock}
                              {part.unit}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            최소: {part.minStock}
                            {part.unit}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {part.primarySupplier ? (
                          <div>
                            <div className="text-sm">{part.primarySupplier.supplierName}</div>
                            <div className="text-xs text-muted-foreground">
                              ₩{part.primarySupplier.supplyPrice.toLocaleString()}
                              {part.primarySupplier.leadTimeDays &&
                                ` (${part.primarySupplier.leadTimeDays}일)`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">메뉴 열기</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>작업</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/parts/${part.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                상세보기
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/parts/${part.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                수정
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/parts/${part.id}/stock`}>
                                <Package className="mr-2 h-4 w-4" />
                                재고 조정
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/parts/${part.id}/order`}>
                                <Truck className="mr-2 h-4 w-4" />
                                발주
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      <div className="text-muted-foreground">조건에 맞는 부품이 없습니다</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
