import React from 'react';
import { Search, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Input,
} from '@cargoro/ui';

// SearchInput 컴포넌트
export interface SearchInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  placeholder = '검색...',
  onChange,
  className,
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

// PeriodSelector 컴포넌트
export interface PeriodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">최근 7일</SelectItem>
        <SelectItem value="30">최근 30일</SelectItem>
        <SelectItem value="90">최근 3개월</SelectItem>
        <SelectItem value="365">최근 1년</SelectItem>
      </SelectContent>
    </Select>
  );
};

// ExportButton 컴포넌트
export interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename?: string;
  onExport?: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename = 'export.csv',
  onExport,
}) => {
  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // 기본 CSV 내보내기 구현
      const csvContent = convertToCSV(data);
      downloadCSV(csvContent, filename);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      내보내기
    </Button>
  );
};

// 유틸리티 함수들
function convertToCSV(data: Record<string, unknown>[]): string {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row =>
    headers
      .map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      })
      .join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// FormField 컴포넌트
interface FormFieldConfig {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: Record<string, unknown>;
}

interface FormFieldProps {
  config: FormFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

// 동적 폼 필드 컴포넌트
export const DynamicFormField = ({ config, value, onChange, error }: FormFieldProps) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    onChange(e.target.value);
  };
};

// SelectField 컴포넌트
interface SelectFieldConfig {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
}

interface SelectFieldProps {
  config: SelectFieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}
