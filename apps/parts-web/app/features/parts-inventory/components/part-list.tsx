'use client';

import { Badge } from '@cargoro/ui';
import * as React from 'react';
import { Button } from '@cargoro/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@cargoro/ui/table';
import { Edit, ShoppingCart, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

// 목업 데이터
const mockParts = [
  {
    id: '1',
    partId: 'P001',
    name: '브레이크 패드',
    category: '브레이크',
    manufacturer: '현대모비스',
    price: 55000,
    stockQuantity: 28,
    minStockLevel: 10,
    location: 'A-10-23',
  },
  {
    id: '2',
    partId: 'P002',
    name: '오일 필터',
    category: '엔진',
    manufacturer: '만도',
    price: 12000,
    stockQuantity: 5,
    minStockLevel: 20,
    location: 'B-05-11',
  },
  {
    id: '3',
    partId: 'P003',
    name: '에어 필터',
    category: '엔진',
    manufacturer: '한국필터',
    price: 15000,
    stockQuantity: 42,
    minStockLevel: 15,
    location: 'B-06-03',
  },
  {
    id: '4',
    partId: 'P004',
    name: '점화 플러그',
    category: '점화',
    manufacturer: 'NGK',
    price: 8000,
    stockQuantity: 12,
    minStockLevel: 20,
    location: 'C-02-15',
  },
  {
    id: '5',
    partId: 'P005',
    name: '와이퍼 블레이드',
    category: '외부',
    manufacturer: '보쉬',
    price: 25000,
    stockQuantity: 30,
    minStockLevel: 10,
    location: 'D-08-04',
  },
];

interface PartListProps {
  readonly onCreateClick?: () => void;
}

export function PartList({ onCreateClick }: PartListProps) {
  return (
    <div className="space-y-4">
      {onCreateClick && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">부품 재고</h2>
          <Button onClick={onCreateClick}>새 부품 추가</Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>부품 ID</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>제조사</TableHead>
              <TableHead className="text-right">가격</TableHead>
              <TableHead className="text-right">재고</TableHead>
              <TableHead>위치</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockParts.map(part => (
              <TableRow key={part.id}>
                <TableCell className="font-medium">{part.partId}</TableCell>
                <TableCell>{part.name}</TableCell>
                <TableCell>{part.category}</TableCell>
                <TableCell>{part.manufacturer}</TableCell>
                <TableCell className="text-right">{formatCurrency(part.price)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>{part.stockQuantity}</span>
                    {part.stockQuantity < part.minStockLevel && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        부족
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{part.location}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
