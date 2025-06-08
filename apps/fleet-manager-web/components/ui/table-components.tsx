import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
} from '@cargoro/ui';

// SortableHeader 컴포넌트
export interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSort?: { key: string; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
  className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  children,
  sortKey,
  currentSort,
  onSort,
  className = '',
}) => {
  const isSorted = currentSort?.key === sortKey;
  const direction = currentSort?.direction;

  return (
    <button
      className={`flex items-center space-x-1 rounded p-2 hover:bg-gray-50 ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span>{children}</span>
      {isSorted ? (
        direction === 'asc' ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )
      ) : (
        <div className="h-4 w-4" />
      )}
    </button>
  );
};

// EmptyState 컴포넌트
export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '데이터가 없습니다',
  description = '표시할 항목이 없습니다.',
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mb-4 text-gray-500">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

// PerformanceSummaryCards 컴포넌트
export interface PerformanceSummaryCardsProps {
  metrics?: {
    totalDrivers: number;
    averageScore: number;
    topPerformers: number;
    needsImprovement: number;
  };
}

export const PerformanceSummaryCards: React.FC<PerformanceSummaryCardsProps> = ({ metrics }) => {
  if (!metrics) {
    return null;
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 운전자</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalDrivers}</div>
          <p className="text-xs text-muted-foreground">등록된 운전자</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageScore.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">전체 평균</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">우수 운전자</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{metrics.topPerformers}</div>
          <p className="text-xs text-muted-foreground">80점 이상</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">개선 필요</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{metrics.needsImprovement}</div>
          <p className="text-xs text-muted-foreground">60점 미만</p>
        </CardContent>
      </Card>
    </div>
  );
};

// 테이블 데이터의 기본 타입
interface TableItem {
  id: string;
  [key: string]: unknown;
}

// 페이지네이션 타입
interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 테이블 컬럼 정의 타입
interface TableColumn<T = TableItem> {
  key: string;
  title: string;
  render?: (value: unknown, record: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// DataTable Props
interface DataTableProps<T = TableItem> {
  title?: string;
  description?: string;
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  actions?: React.ReactNode;
  emptyMessage?: string;
}

// 데이터 테이블 컴포넌트
export function DataTable<T extends TableItem>({
  title,
  description,
  columns,
  data,
  loading = false,
  pagination,
  onPageChange,
  actions,
  emptyMessage = '데이터가 없습니다.',
}: DataTableProps<T>) {
  return (
    <Card>
      {(title || description || actions) && (
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(column => (
                    <TableHead
                      key={column.key}
                      style={{ width: column.width }}
                      className={
                        column.align === 'center'
                          ? 'text-center'
                          : column.align === 'right'
                            ? 'text-right'
                            : ''
                      }
                    >
                      {column.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(record => (
                  <TableRow key={record.id}>
                    {columns.map(column => (
                      <TableCell
                        key={`${record.id}-${column.key}`}
                        className={
                          column.align === 'center'
                            ? 'text-center'
                            : column.align === 'right'
                              ? 'text-right'
                              : ''
                        }
                      >
                        {column.render
                          ? column.render(record[column.key], record)
                          : String(record[column.key] || '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pagination && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-gray-500">
                  총 {pagination.total}개 중 {(pagination.page - 1) * pagination.pageSize + 1}-
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)}개 표시
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    이전
                  </Button>
                  <div className="text-sm">
                    {pagination.page} / {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    다음
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// 상태 뱃지 컴포넌트
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'default' }) => {
  const getVariantByStatus = (status: string) => {
    const statusMap: Record<string, typeof variant> = {
      active: 'default',
      inactive: 'secondary',
      pending: 'outline',
      completed: 'default',
      cancelled: 'destructive',
    };
    return statusMap[status.toLowerCase()] || variant;
  };

  return <Badge variant={getVariantByStatus(status)}>{status}</Badge>;
};

// 액션 버튼 컴포넌트
interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
}) => {
  return (
    <Button variant={variant} size={size} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
};

// 더보기 액션 버튼
interface MoreActionsProps {
  actions: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    destructive?: boolean;
  }>;
}

export const MoreActions: React.FC<MoreActionsProps> = ({ actions }) => {
  return (
    <div className="flex space-x-1">
      {actions.map((action, index) => (
        <ActionButton
          key={index}
          onClick={action.onClick}
          variant={action.destructive ? 'destructive' : 'ghost'}
        >
          {action.icon}
          {action.label}
        </ActionButton>
      ))}
    </div>
  );
};
