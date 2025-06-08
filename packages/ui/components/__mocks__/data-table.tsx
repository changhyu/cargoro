import React from 'react';

// 타입 정의
interface Column {
  accessorKey: string;
  header?: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  searchColumn?: string;
  filterPlaceholder?: string;
  className?: string;
  showPagination?: boolean;
  onRowClick?: (data: Record<string, any>) => void;
  noDataMessage?: string;
}

// 모의 DataTable 컴포넌트
export const DataTable = ({
  columns,
  data,
  searchColumn,
  filterPlaceholder = '검색...',
  className,
  showPagination = true,
  noDataMessage = '데이터가 없습니다',
}: DataTableProps) => (
  <div data-testid="data-table" className={className}>
    {searchColumn && (
      <div>
        <input placeholder={filterPlaceholder} data-testid="search-input" />
      </div>
    )}
    <table>
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={i}>{col.header || col.accessorKey}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((row, i) => (
            <tr key={i} role="row">
              {columns.map((col, j) => (
                <td key={j}>{row[col.accessorKey]}</td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length}>{noDataMessage}</td>
          </tr>
        )}
      </tbody>
    </table>
    {showPagination && (
      <div>
        <span>1 / 2 페이지</span>
        <button>이전</button>
        <button>다음</button>
      </div>
    )}
  </div>
);
