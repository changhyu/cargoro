'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
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
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from '@cargoro/ui';
import {
  CalendarIcon,
  Search,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  CircleDot,
} from 'lucide-react';

// 재고 이동 타입 정의
interface StockMovement {
  id: string;
  part: {
    id: string;
    partNumber: string;
    name: string;
  };

  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  performedBy: {
    id: string;
    name: string;
  };

  notes?: string;
  createdAt: string;
}

// 이동 타입별 아이콘과 색상
const movementTypeConfig = {
  IN: {
    icon: ArrowDownCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: '입고',
  },
  OUT: {
    icon: ArrowUpCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: '출고',
  },
  ADJUST: {
    icon: CircleDot,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: '조정',
  },
};

export function StockMovementHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // 재고 이동 내역 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['stockMovements', { search: searchQuery, type: typeFilter, dateRange }],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch('/api/stock-movements')
      // return response.json()

      // 임시 더미 데이터
      return {
        items: [
          {
            id: '1',
            part: {
              id: '1',
              partNumber: 'ENG-001',
              name: '엔진오일 필터',
            },
            type: 'IN',
            quantity: 50,
            previousStock: 20,
            newStock: 70,
            reason: '정기 발주',
            referenceType: 'purchase_order',
            referenceId: 'PO-2025-001',
            performedBy: {
              id: '1',
              name: '김창고',
            },
            notes: '월간 정기 발주분',
            createdAt: '2025-01-05T10:00:00',
          },
          {
            id: '2',
            part: {
              id: '2',
              partNumber: 'BRK-003',
              name: '브레이크 패드 세트',
            },
            type: 'OUT',
            quantity: 2,
            previousStock: 14,
            newStock: 12,
            reason: '정비 작업',
            referenceType: 'repair_request',
            referenceId: 'REQ-202501-001',
            performedBy: {
              id: '2',
              name: '박기술',
            },
            createdAt: '2025-01-08T14:30:00',
          },
          {
            id: '3',
            part: {
              id: '3',
              partNumber: 'OIL-002',
              name: '엔진오일 5W-30',
            },
            type: 'ADJUST',
            quantity: -3,
            previousStock: 8,
            newStock: 5,
            reason: '재고 실사 조정',
            performedBy: {
              id: '1',
              name: '김창고',
            },
            notes: '실물 재고와 시스템 재고 차이 조정',
            createdAt: '2025-01-07T16:00:00',
          },
        ] as StockMovement[],
        total: 3,
      };
    },
  });

  // 필터링된 데이터
  const filteredData = data?.items?.filter(item => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.part.partNumber.toLowerCase().includes(query) ||
        item.part.name.toLowerCase().includes(query) ||
        item.reason.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query)
      );
    }
    if (dateRange.from && new Date(item.createdAt) < dateRange.from) return false;
    if (dateRange.to && new Date(item.createdAt) > dateRange.to) return false;
    return true;
  });

  // CSV 다운로드 함수
  const handleExportCSV = () => {
    // TODO: 실제 CSV 내보내기 구현
    // 디버깅 로그는 프로덕션에서 제거
  };

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>재고 이동 내역</CardTitle>
            <CardDescription>부품의 입고, 출고, 조정 내역을 확인합니다</CardDescription>
          </div>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* 필터 및 검색 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="부품번호, 부품명, 사유로 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="이동 유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 유형</SelectItem>
              <SelectItem value="IN">입고</SelectItem>
              <SelectItem value="OUT">출고</SelectItem>
              <SelectItem value="ADJUST">조정</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal sm:w-[240px]',
                  !dateRange.from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MM/dd', { locale: ko })} -{' '}
                      {format(dateRange.to, 'MM/dd', { locale: ko })}
                    </>
                  ) : (
                    format(dateRange.from, 'MM/dd', { locale: ko })
                  )
                ) : (
                  <span>기간 선택</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={dateRange}
                onSelect={range => {
                  if (range) {
                    setDateRange({
                      from: range.from,
                      to: range.to,
                    });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 테이블 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>일시</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>부품정보</TableHead>
                <TableHead className="text-center">수량</TableHead>
                <TableHead className="text-center">이전재고</TableHead>
                <TableHead className="text-center">변경후재고</TableHead>
                <TableHead>사유</TableHead>
                <TableHead>참조</TableHead>
                <TableHead>작업자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData && filteredData.length > 0 ? (
                filteredData.map(movement => {
                  const config = movementTypeConfig[movement.type];
                  const Icon = config.icon;

                  return (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {format(new Date(movement.createdAt), 'MM/dd HH:mm', {
                          locale: ko,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn('rounded p-1', config.bgColor)}>
                            <Icon className={cn('h-4 w-4', config.color)} />
                          </div>
                          <span className="font-medium">{config.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{movement.part.partNumber}</div>
                          <div className="text-sm text-muted-foreground">{movement.part.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn(
                            'font-medium',
                            movement.type === 'IN'
                              ? 'text-green-600'
                              : movement.type === 'OUT'
                                ? 'text-red-600'
                                : 'text-blue-600'
                          )}
                        >
                          {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : ''}
                          {Math.abs(movement.quantity)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{movement.previousStock}</TableCell>
                      <TableCell className="text-center font-medium">{movement.newStock}</TableCell>
                      <TableCell>
                        <div>
                          <div>{movement.reason}</div>
                          {movement.notes && (
                            <div className="text-sm text-muted-foreground">{movement.notes}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {movement.referenceId && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {movement.referenceId}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{movement.performedBy.name}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center">
                    <div className="text-muted-foreground">
                      조건에 맞는 재고 이동 내역이 없습니다
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
