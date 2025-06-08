'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRepairStatusHistory, StatusHistoryItem } from '../hooks/useRepairStatusHistory';

// 상태별 배지 스타일 정의
const statusBadgeStyles: Record<string, string> = {
  pending: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-800',
  waiting_parts: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// 상태 한글명 매핑
const statusKoreanMap: Record<string, string> = {
  pending: '대기 중',
  in_progress: '진행 중',
  waiting_parts: '부품 대기',
  completed: '완료',
  cancelled: '취소됨',
};

interface RepairStatusTimelineProps {
  repairId: string;
}

export const RepairStatusTimeline: React.FC<RepairStatusTimelineProps> = ({ repairId }) => {
  // 상태 이력 조회 훅 사용
  const { data, isLoading, isError } = useRepairStatusHistory(repairId);
  const statusHistory = data?.statusHistory || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">상태 변경 이력</h3>
        <div className="py-4 text-center text-sm text-muted-foreground">이력 불러오는 중...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">상태 변경 이력</h3>
        <div className="py-4 text-center text-sm text-red-500">
          이력을 불러오는 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">상태 변경 이력</h3>

      {statusHistory.length === 0 ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          상태 변경 이력이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {statusHistory.map((item: StatusHistoryItem, index: number) => (
            <div key={item.id} className="relative pl-8">
              {/* 타임라인 연결선 */}
              {index < statusHistory.length - 1 && (
                <div className="absolute bottom-0 left-3.5 top-6 w-px bg-gray-200"></div>
              )}

              {/* 타임라인 원형 마커 */}
              <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
                <div className={`h-4 w-4 rounded-full ${statusBadgeStyles[item.status]}`}></div>
              </div>

              {/* 이력 내용 */}
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeStyles[item.status]}`}
                  >
                    {statusKoreanMap[item.status] || item.status}
                  </span>
                  <time className="text-xs text-gray-500">
                    {format(parseISO(item.timestamp), 'yyyy.MM.dd HH:mm', { locale: ko })}
                  </time>
                </div>

                {item.note && <p className="mt-2 text-sm text-gray-700">{item.note}</p>}

                {item.technicianName && (
                  <div className="mt-2 text-xs text-gray-500">담당자: {item.technicianName}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
