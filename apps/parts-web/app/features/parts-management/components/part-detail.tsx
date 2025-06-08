'use client';

import { useState } from 'react';
import { Button } from '@cargoro/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@cargoro/ui/dialog';
import { useDeletePart, useGetPart } from '../hooks';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Part, PartStatus } from '../types';
import { Loader2 } from 'lucide-react';

interface PartDetailProps {
  partId: string;
  onEdit?: () => void;
  onBack?: () => void;
}

/**
 * 부품 상세 정보 컴포넌트
 */
export function PartDetail({ partId, onEdit, onBack }: PartDetailProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 부품 정보 조회
  const { data: partData, isLoading, error } = useGetPart(partId);
  const part = partData as Part | undefined;

  // 부품 삭제 뮤테이션
  const { mutateAsync: deletePart, isPending: isDeleting } = useDeletePart();

  // 삭제 다이얼로그 열기
  const openDeleteDialog = () => {
    setShowDeleteDialog(true);
  };

  // 삭제 다이얼로그 닫기
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
  };

  // 삭제 확인
  const confirmDelete = () => {
    deletePart(partId, {
      onSuccess: () => {
        closeDeleteDialog();
        if (onBack) onBack();
      },
    });
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // 오류 표시
  if (error || !part || typeof part !== 'object') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h3 className="mb-2 text-xl font-semibold text-red-600">부품 정보를 불러올 수 없습니다</h3>
        <p className="mb-4 text-gray-600">{error?.message || '네트워크 오류가 발생했습니다.'}</p>
        <Button onClick={onBack} variant="outline">
          뒤로 가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">{part.name}</h2>
        <div className="flex space-x-2">
          <Button onClick={onBack} variant="outline">
            뒤로
          </Button>
          <Button onClick={onEdit} variant="secondary">
            수정
          </Button>
          <Button onClick={openDeleteDialog} variant="destructive">
            삭제
          </Button>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>부품 삭제 확인</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              정말 <strong>{part.name}</strong> 부품을 삭제하시겠습니까? 이 작업은 되돌릴 수
              없습니다.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={closeDeleteDialog} variant="outline" disabled={isDeleting}>
              취소
            </Button>
            <Button onClick={confirmDelete} variant="destructive" disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 부품 상세 정보 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6 rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">기본 정보</h3>
            </div>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-gray-600">부품 번호</div>
              <p className="font-medium">{part.partNumber}</p>

              <div className="text-gray-600">카테고리</div>
              <p className="font-medium">{part.category}</p>

              <div className="text-gray-600">상태</div>
              <p
                className={`rounded-full px-2 py-1 text-xs font-semibold
                  ${part.status === PartStatus.IN_STOCK ? 'bg-green-100 text-green-800' : ''}
                  ${part.status === PartStatus.LOW_STOCK ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${part.status === PartStatus.OUT_OF_STOCK ? 'bg-red-100 text-red-800' : ''}
                  ${part.status === PartStatus.DISCONTINUED ? 'bg-gray-100 text-gray-800' : ''}
                  ${part.status === PartStatus.ON_ORDER ? 'bg-blue-100 text-blue-800' : ''}
                `}
              >
                {part.status}
              </p>

              <div className="text-gray-600">판매 가격</div>
              <p className="font-medium">{formatCurrency(part.price)}</p>

              <div className="text-gray-600">원가</div>
              <p className="font-medium">{formatCurrency(part.cost || 0)}</p>

              <div className="text-gray-600">재고 수량</div>
              <p className="font-medium">{part.quantity}개</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">추가 정보</h3>
            </div>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-gray-600">보관 위치</div>
              <p className="font-medium">{part.location || '-'}</p>

              <div className="text-gray-600">공급업체</div>
              <p className="font-medium">
                {typeof part.supplier === 'string' ? part.supplier : part.supplier?.name || '-'}
              </p>

              <div className="text-gray-600">제조사</div>
              <p className="font-medium">{part.manufacturer || '-'}</p>

              <div className="text-gray-600">제조사 부품번호</div>
              <p className="font-medium">{part.manufacturerPartNumber || '-'}</p>

              <div className="text-gray-600">최소 재고 수준</div>
              <p className="font-medium">{part.minimumStockLevel || 0}개</p>

              <div className="text-gray-600">재주문 수량</div>
              <p className="font-medium">{part.reorderPoint || 0}개</p>

              <div className="text-gray-600">마지막 주문일</div>
              <p className="font-medium">-</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">규격 정보</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="text-gray-600">무게</div>
            <p className="font-medium">{part.weight ? `${part.weight}kg` : '-'}</p>

            <div className="text-gray-600">크기</div>
            <p className="font-medium">{part.dimensions || '-'}</p>

            <div className="text-gray-600">등록일</div>
            <p className="font-medium">{formatDate(part.createdAt)}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800">설명</h3>
          <p className="whitespace-pre-line text-gray-700">{part.description || '설명 없음'}</p>
        </div>
      </div>
    </div>
  );
}
