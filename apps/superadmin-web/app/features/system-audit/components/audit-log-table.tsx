'use client';

import { AuditLog, AuditCategoryValues, ServiceTypeValues } from '../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@cargoro/ui';
import { Button } from '@cargoro/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cargoro/ui';
import { Badge } from '@cargoro/ui';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  totalLogs: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  // onRefresh: () => void; // 향후 사용 예정
  // onExport: (format: 'csv' | 'json') => void; // 향후 사용 예정
  onLogSelect: (log: AuditLog) => void;
  onFilterChange: (
    type: 'level' | 'category' | 'serviceType' | 'searchQuery',
    value: string
  ) => void;
  currentFilters: {
    level: string;
    category: string;
    serviceType: string;
    searchQuery: string;
  };
}

export function AuditLogTable({
  logs,
  isLoading,
  totalLogs,
  totalPages,
  currentPage,
  onPageChange,
  // onRefresh,
  // onExport,
  onLogSelect,
  onFilterChange,
  currentFilters,
}: AuditLogTableProps) {
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'info':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            정보
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            경고
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            오류
          </Badge>
        );
      case 'critical':
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            심각
          </Badge>
        );
      default:
        return <Badge>알 수 없음</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">레벨</TableHead>
              <TableHead>메시지</TableHead>
              <TableHead className="w-[180px]">카테고리</TableHead>
              <TableHead className="w-[150px]">서비스</TableHead>
              <TableHead className="w-[180px]">날짜/시간</TableHead>
              <TableHead className="w-[80px] text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  조회된 감사 로그가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{getLevelBadge(log.level)}</TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium" title={log.message}>
                    {log.message}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={currentFilters.category}
                      onValueChange={value => onFilterChange('category', value)}
                    >
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue placeholder={log.category} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">모든 카테고리</SelectItem>
                        {Object.values(AuditCategoryValues).map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={currentFilters.serviceType}
                      onValueChange={value => onFilterChange('serviceType', value)}
                    >
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue placeholder={log.serviceType} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">모든 서비스</SelectItem>
                        {Object.values(ServiceTypeValues).map(service => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLogSelect(log)}
                      className="h-8 w-8 p-0"
                    >
                      <span className="sr-only">상세 보기</span>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {totalLogs}개 항목 중 {Math.min((currentPage - 1) * 10 + 1, totalLogs)}-
          {Math.min(currentPage * 10, totalLogs)}개 표시
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
