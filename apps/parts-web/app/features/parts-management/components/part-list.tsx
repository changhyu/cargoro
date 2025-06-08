'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@cargoro/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@cargoro/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cargoro/ui/select';
import { Input } from '@cargoro/ui/input';
import { formatCurrency } from '@/utils/formatters';
import { PartCategory, PartStatus, type Part } from '../types';
import { useDeletePart, useGetParts } from '../hooks';

export interface PartListProps {
  parts?: Part[];
  isLoading?: boolean;
  onDelete?: () => void;
}

/**
 * 부품 목록
 */
export function PartList({ parts: propParts, isLoading: propIsLoading, onDelete }: PartListProps) {
  const { data: fetchedPartsData, isLoading: fetchIsLoading, error } = useGetParts(undefined);

  // 타입 안전하게 fetchedParts 접근
  const fetchedParts = fetchedPartsData?.data?.parts || [];
  const deletePart = useDeletePart();

  // 로컬 상태 관리
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [partToDelete, setPartToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 외부에서 주입된 parts 또는 API에서 로드된 parts 사용
  const displayParts = propParts || fetchedParts;

  // 필터링 및 검색
  const filteredParts =
    displayParts && Array.isArray(displayParts)
      ? displayParts.filter((part: Part) => {
          const matchesCategory = categoryFilter ? part.category === categoryFilter : true;
          const matchesStatus = statusFilter ? part.status === statusFilter : true;

          const matchesSearch =
            part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof part.supplier === 'string'
              ? part.supplier.toLowerCase().includes(searchTerm.toLowerCase())
              : part.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

          return matchesCategory && matchesStatus && matchesSearch;
        })
      : [];

  // props 또는 자체 fetch 데이터 사용
  const parts = propParts || fetchedParts;
  const isLoading = propIsLoading !== undefined ? propIsLoading : fetchIsLoading;

  // 삭제 핸들러
  const handleDelete = async (partId: string) => {
    try {
      setIsDeleting(true);
      await deletePart.mutateAsync(partId);
      setPartToDelete(null);
      setShowDeleteDialog(false);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      // 오류는 Toast로 처리됨
    } finally {
      setIsDeleting(false);
    }
  };

  // 삭제 확인 다이얼로그 열기
  const openDeleteDialog = (partId: string) => {
    setPartToDelete(partId);
    setShowDeleteDialog(true);
  };

  // 삭제 취소
  const cancelDelete = () => {
    setPartToDelete(null);
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
        role="alert"
      >
        <strong className="font-bold">오류!</strong>
        <span className="block sm:inline"> 부품 데이터를 불러오는 데 실패했습니다.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 필터 및 검색 */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-wrap gap-2">
          {/* 카테고리 필터 */}
          <div className="w-40">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 카테고리</SelectItem>
                {Object.values(PartCategory).map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 상태 필터 */}
          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 상태</SelectItem>
                {Object.values(PartStatus).map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 검색 필드 */}
          <div className="relative min-w-64 flex-1">
            <Input
              type="text"
              placeholder="부품명, 부품번호, 공급업체 검색..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <Link href="/dashboard/inventory/new">
            <Button>새 부품 추가</Button>
          </Link>
        </div>
      </div>

      {/* 부품 테이블 */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>부품번호</TableHead>
              <TableHead>부품명</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>가격</TableHead>
              <TableHead>수량</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>공급업체</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-4 text-center text-gray-500">
                  {searchTerm || categoryFilter || statusFilter
                    ? '검색 결과가 없습니다.'
                    : '부품 정보가 없습니다.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredParts.map((part: Part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.partNumber}</TableCell>
                  <TableCell>{part.name}</TableCell>
                  <TableCell>{part.category}</TableCell>
                  <TableCell>{formatCurrency(part.price)}</TableCell>
                  <TableCell>{part.quantity}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-block rounded-full px-2 py-1 text-xs
                        ${part.status === PartStatus.IN_STOCK ? 'bg-green-100 text-green-800' : ''}
                        ${part.status === PartStatus.LOW_STOCK ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${part.status === PartStatus.OUT_OF_STOCK ? 'bg-red-100 text-red-800' : ''}
                        ${part.status === PartStatus.DISCONTINUED ? 'bg-gray-100 text-gray-800' : ''}
                        ${part.status === PartStatus.ON_ORDER ? 'bg-blue-100 text-blue-800' : ''}
                      `}
                    >
                      {part.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    {typeof part.supplier === 'string'
                      ? part.supplier
                      : part.supplier?.name || '정보 없음'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/dashboard/inventory/${part.id}`}>
                        <Button variant="outline" size="sm">
                          보기
                        </Button>
                      </Link>
                      <Link href={`/dashboard/inventory/${part.id}/edit`}>
                        <Button variant="outline" size="sm">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(part.id)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-800"
                      >
                        삭제
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium">부품 삭제 확인</h3>
            <p className="mb-4">이 부품을 정말 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.</p>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelDelete} disabled={isDeleting}>
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={() => partToDelete && handleDelete(partToDelete)}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
