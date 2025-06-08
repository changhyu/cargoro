'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@cargoro/ui';
import {
  Package,
  Truck,
  TrendingUp,
  TrendingDown,
  Edit,
  AlertCircle,
  DollarSign,
  Building,
  BarChart,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PartDetailProps {
  partId: string;
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

// 재고 이동 타입 매핑
const movementTypeLabels: Record<string, string> = {
  IN: '입고',
  OUT: '출고',
  ADJUSTMENT: '조정',
  RETURN: '반품',
};

export function PartDetail({ partId }: PartDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // 부품 상세 정보 조회
  const {
    data: part,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['part', partId],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch(`/api/parts/${partId}`)
      // return response.json()

      // 임시 더미 데이터
      return {
        id: partId,
        partNumber: 'OIL-5W30-1L',
        name: '엔진오일 5W-30 1L',
        category: 'FLUID',
        manufacturer: 'Mobil',
        model: 'Mobil 1',
        description: '고성능 합성 엔진오일. 연비 개선 및 엔진 보호 효과.',
        unit: 'L',
        price: 15000,
        cost: 10000,
        minStock: 50,
        maxStock: 200,
        leadTimeDays: 3,
        isActive: true,
        tags: ['엔진오일', '합성유', '5W-30'],
        inventory: [
          {
            id: '1',
            warehouseId: 'default-warehouse',
            warehouseName: '메인 창고',
            quantity: 45,
            reservedQuantity: 5,
          },
        ],
        suppliers: [
          {
            id: '1',
            supplierName: '한국모빌',
            supplierCode: 'MOB-5W30-1L',
            supplyPrice: 10000,
            leadTimeDays: 3,
            minimumOrderQuantity: 20,
            isPrimary: true,
          },
          {
            id: '2',
            supplierName: '오일뱅크',
            supplierCode: 'OB-ENG-5W30',
            supplyPrice: 9500,
            leadTimeDays: 5,
            minimumOrderQuantity: 50,
            isPrimary: false,
          },
        ],
        stockMovements: [
          {
            id: '1',
            movementType: 'IN',
            quantity: 100,
            reason: '구매 입고',
            referenceType: 'PURCHASE',
            referenceId: 'PO-20250105-0001',
            createdAt: '2025-01-05T10:00:00',
            createdBy: {
              name: '김창고',
            },
          },
          {
            id: '2',
            movementType: 'OUT',
            quantity: 5,
            reason: '정비 사용',
            referenceType: 'REPAIR',
            referenceId: 'REQ-202501-001',
            createdAt: '2025-01-06T14:00:00',
            createdBy: {
              name: '이정비',
            },
          },
        ],
        repairParts: [
          {
            id: '1',
            quantity: 5,
            createdAt: '2025-01-06',
            repair: {
              repairNumber: 'REQ-202501-001',
              vehicle: {
                vehicleNumber: '12가 3456',
                manufacturer: '현대',
                model: '소나타',
              },
            },
          },
        ],
        statistics: {
          totalStock: 45,
          totalReserved: 5,
          availableStock: 40,
          warehouseCount: 1,
          supplierCount: 2,
          usageCount: 15,
          lastMovement: {
            movementType: 'OUT',
            quantity: 5,
            createdAt: '2025-01-06T14:00:00',
          },
        },
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">로딩중...</div>
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-destructive">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  // 재고 상태 계산
  const stockStatus =
    part.statistics.totalStock === 0
      ? 'out'
      : part.statistics.totalStock <= part.minStock
        ? 'low'
        : 'normal';

  const stockPercentage = part.maxStock ? (part.statistics.totalStock / part.maxStock) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <Package className="h-8 w-8" />
            {part.partNumber}
          </h1>
          <p className="text-muted-foreground">{part.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/parts/${partId}/stock`}>
              <Package className="mr-2 h-4 w-4" />
              재고 조정
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/parts/${partId}/order`}>
              <Truck className="mr-2 h-4 w-4" />
              발주
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/parts/${partId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Link>
          </Button>
        </div>
      </div>

      {/* 주요 정보 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">현재 재고</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                stockStatus === 'out' && 'text-red-500',
                stockStatus === 'low' && 'text-orange-500'
              )}
            >
              {part.statistics.totalStock}
              {part.unit}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">가용</span>
                <span>
                  {part.statistics.availableStock}
                  {part.unit}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">예약</span>
                <span>
                  {part.statistics.totalReserved}
                  {part.unit}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    'h-full transition-all',
                    stockStatus === 'out' && 'bg-red-500',
                    stockStatus === 'low' && 'bg-orange-500',
                    stockStatus === 'normal' && 'bg-green-500'
                  )}
                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{part.maxStock || '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">판매가</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{part.price.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              원가: ₩{part.cost?.toLocaleString() || '-'}
            </p>
            {part.cost && (
              <p className="mt-1 text-xs text-green-600">
                마진율: {Math.round(((part.price - part.cost) / part.price) * 100)}%
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">공급업체</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{part.statistics.supplierCount}</div>
            <p className="text-xs text-muted-foreground">리드타임: {part.leadTimeDays || '-'}일</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">사용 이력</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{part.statistics.usageCount}회</div>
            <p className="text-xs text-muted-foreground">최근 30일</p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="stock">재고 현황</TabsTrigger>
          <TabsTrigger value="suppliers">공급업체</TabsTrigger>
          <TabsTrigger value="history">사용 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* 부품 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>부품 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">부품번호</p>
                    <p className="text-sm">{part.partNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">카테고리</p>
                    <Badge variant="outline">
                      {categoryLabels[part.category] || part.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">제조사</p>
                    <p className="text-sm">{part.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">모델</p>
                    <p className="text-sm">{part.model || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">단위</p>
                    <p className="text-sm">{part.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">상태</p>
                    <Badge variant={part.isActive ? 'success' : 'destructive'}>
                      {part.isActive ? '활성' : '비활성'}
                    </Badge>
                  </div>
                </div>
                {part.description && (
                  <div>
                    <p className="mb-1 text-sm font-medium text-muted-foreground">설명</p>
                    <p className="text-sm">{part.description}</p>
                  </div>
                )}
                {part.tags.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">태그</p>
                    <div className="flex flex-wrap gap-1">
                      {part.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 재고 관리 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>재고 관리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">최소 재고</p>
                    <p className="text-sm">
                      {part.minStock}
                      {part.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">최대 재고</p>
                    <p className="text-sm">
                      {part.maxStock || '-'}
                      {part.maxStock && part.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">리드타임</p>
                    <p className="text-sm">{part.leadTimeDays || '-'}일</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">창고 수</p>
                    <p className="text-sm">{part.statistics.warehouseCount}개</p>
                  </div>
                </div>

                {stockStatus === 'low' && (
                  <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        재고가 최소 재고 수준 이하입니다. 발주가 필요합니다.
                      </p>
                    </div>
                  </div>
                )}

                {part.statistics.lastMovement && (
                  <div>
                    <p className="mb-1 text-sm font-medium text-muted-foreground">최근 이동</p>
                    <div className="flex items-center gap-2 text-sm">
                      {part.statistics.lastMovement.movementType === 'IN' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span>
                        {movementTypeLabels[part.statistics.lastMovement.movementType]}{' '}
                        {part.statistics.lastMovement.quantity}
                        {part.unit}
                      </span>
                      <span className="text-muted-foreground">
                        ({format(new Date(part.statistics.lastMovement.createdAt), 'MM/dd HH:mm')})
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>창고별 재고 현황</CardTitle>
              <CardDescription>각 창고의 재고 수량을 확인합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {part.inventory.map(inv => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{inv.warehouseName}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          재고: {inv.quantity}
                          {part.unit}
                        </span>
                        <span>
                          예약: {inv.reservedQuantity}
                          {part.unit}
                        </span>
                        <span>
                          가용: {inv.quantity - inv.reservedQuantity}
                          {part.unit}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/parts/${partId}/stock?warehouse=${inv.warehouseId}`}>
                        재고 조정
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>재고 이동 내역</CardTitle>
              <CardDescription>최근 재고 변동 내역입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {part.stockMovements.map(movement => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {movement.movementType === 'IN' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">
                          {movementTypeLabels[movement.movementType]} {movement.quantity}
                          {part.unit}
                        </span>
                      </div>
                      <p className="text-sm">{movement.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{movement.createdBy.name}</span>
                        <span>
                          {format(new Date(movement.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                        </span>
                        {movement.referenceId && <span>참조: {movement.referenceId}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>공급업체 목록</CardTitle>
              <CardDescription>이 부품을 공급하는 업체 정보입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {part.suppliers.map(supplier => (
                  <div key={supplier.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">{supplier.supplierName}</span>
                        {supplier.isPrimary && <Badge variant="default">주 공급업체</Badge>}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/parts/${partId}/order?supplier=${supplier.id}`}>발주</Link>
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-muted-foreground">공급업체 코드</p>
                        <p>{supplier.supplierCode || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">공급가</p>
                        <p className="font-medium">₩{supplier.supplyPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">리드타임</p>
                        <p>{supplier.leadTimeDays || '-'}일</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">최소 주문</p>
                        <p>
                          {supplier.minimumOrderQuantity || '-'}
                          {supplier.minimumOrderQuantity && part.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>사용 이력</CardTitle>
              <CardDescription>정비에 사용된 이력입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {part.repairParts.map(usage => (
                  <div
                    key={usage.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{usage.repair.repairNumber}</span>
                        <Badge variant="outline">
                          {usage.quantity}
                          {part.unit}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {usage.repair.vehicle.vehicleNumber} - {usage.repair.vehicle.manufacturer}{' '}
                        {usage.repair.vehicle.model}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(usage.createdAt), 'yyyy.MM.dd', { locale: ko })}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/repairs/${usage.repair.repairNumber}`}>상세보기</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
