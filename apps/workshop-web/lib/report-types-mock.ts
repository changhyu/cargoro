// 보고서 패키지에서 사용하는 타입들의 모의 구현
export interface GenerateReportRequest {
  templateId: string;
  parameters: Record<string, string | number | boolean | Date>;
  format?: 'pdf' | 'excel' | 'word' | 'csv' | 'json';
  async?: boolean;
  webhook?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  layout: {
    type: string;
    orientation?: 'portrait' | 'landscape';
    margins?: { top: number; right: number; bottom: number; left: number };
  };
  dataSource: {
    type: string;
    query?: string;
    endpoint?: string;
  };
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: string | number | boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
}
