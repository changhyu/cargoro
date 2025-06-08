// 보고서 관련 타입 정의

export * from './types/common';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'workshop' | 'financial' | 'customer' | 'inventory' | 'performance' | 'custom';
  type: 'pdf' | 'excel' | 'word' | 'ppt';
  layout: ReportLayout;
  dataSource: DataSource[];
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
  recipients?: ReportRecipient[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
}

export interface ReportLayout {
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header?: ReportSection;
  footer?: ReportSection;
  sections: ReportSection[];
  styles?: ReportStyles;
}

export interface ReportSection {
  id: string;
  type: 'title' | 'text' | 'table' | 'chart' | 'image' | 'pageBreak' | 'summary' | 'kpi';
  title?: string;
  content?: any;
  style?: SectionStyle;
  dataBinding?: DataBinding;
  condition?: SectionCondition;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'static' | 'calculated';
  endpoint?: string;
  query?: string;
  transform?: DataTransform;
  cache?: {
    enabled: boolean;
    duration: number; // minutes
  };
}

export interface DataBinding {
  sourceId: string;
  field: string;
  format?: string;
  aggregate?: 'sum' | 'average' | 'count' | 'min' | 'max';
  filter?: DataFilter;
}

export interface DataFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

export interface DataTransform {
  type: 'map' | 'filter' | 'reduce' | 'sort' | 'group';
  expression: string;
}

export interface ReportParameter {
  id: string;
  name: string;
  label: string;
  type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'text' | 'number' | 'boolean';
  defaultValue?: any;
  required: boolean;
  options?: ParameterOption[];
  validation?: ParameterValidation;
}

export interface ParameterOption {
  label: string;
  value: any;
}

export interface ParameterValidation {
  min?: number | Date;
  max?: number | Date;
  pattern?: string;
  message?: string;
}

export interface ReportSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  time: string; // HH:mm format
  dayOfWeek?: number; // 0-6 (일-토)
  dayOfMonth?: number; // 1-31
  months?: number[]; // 1-12
  customCron?: string;
  timezone: string;
  enabled: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface ReportRecipient {
  id: string;
  type: 'email' | 'webhook' | 'slack' | 'teams';
  address: string;
  name?: string;
  format?: 'pdf' | 'excel' | 'link';
  language?: string;
}

export interface ReportStyles {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    heading: FontStyle;
    body: FontStyle;
    caption: FontStyle;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
}

export interface FontStyle {
  family: string;
  size: number;
  weight?: 'normal' | 'bold' | 'light';
  style?: 'normal' | 'italic';
  color?: string;
}

export interface SectionStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  padding?: number | [number, number, number, number];
  margin?: number | [number, number, number, number];
  border?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
}

export interface SectionCondition {
  type: 'show' | 'hide';
  expression: string;
}

// 보고서 생성 관련 타입
export interface GenerateReportRequest {
  templateId: string;
  parameters: Record<string, any>;
  format?: 'pdf' | 'excel' | 'word' | 'csv' | 'json';
  async?: boolean;
  webhook?: string;
}

export interface GenerateReportResponse {
  reportId: string;
  jobId: string; // 비동기 작업 ID 추가
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
  generatedAt?: Date;
  expiresAt?: Date;
}

export interface ReportJob {
  id: string;
  templateId: string;
  parameters: Record<string, any>;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: GenerateReportResponse;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
}

// 차트 관련 타입
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar' | 'heatmap';
  data: ChartData;
  options: ChartOptions;
  size?: {
    width: number;
    height: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    title?: {
      display: boolean;
      text: string;
      font?: FontStyle;
    };
    legend?: {
      display: boolean;
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled: boolean;
    };
  };
  scales?: {
    x?: AxisOptions;
    y?: AxisOptions;
  };
}

export interface AxisOptions {
  display?: boolean;
  title?: {
    display: boolean;
    text: string;
  };
  grid?: {
    display: boolean;
    color?: string;
  };
  ticks?: {
    font?: FontStyle;
    color?: string;
  };
}

// 테이블 관련 타입
export interface TableConfig {
  headers: TableHeader[];
  rows: any[][];
  styles?: TableStyles;
  summary?: TableSummary;
}

export interface TableHeader {
  text: string;
  align?: 'left' | 'center' | 'right';
  width?: number;
  sortable?: boolean;
}

export interface TableStyles {
  headerBackground?: string;
  headerColor?: string;
  headerFont?: FontStyle;
  rowBackground?: string;
  alternateRowBackground?: string;
  rowColor?: string;
  rowFont?: FontStyle;
  borderColor?: string;
  borderWidth?: number;
}

export interface TableSummary {
  position: 'top' | 'bottom';
  rows: SummaryRow[];
}

export interface SummaryRow {
  label: string;
  value: string | number;
  style?: SectionStyle;
}

// KPI 관련 타입
export interface KPIConfig {
  title: string;
  value: number | string;
  unit?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  target?: {
    value: number;
    achieved: boolean;
  };
  icon?: string;
  color?: string;
}

// 보고서 미리보기
export interface ReportPreview {
  pages: ReportPage[];
  totalPages: number;
  generatedAt: Date;
}

export interface ReportPage {
  number: number;
  content: string; // HTML or base64 image
  type: 'html' | 'image';
}

// 보고서 템플릿 갤러리
export interface TemplateGalleryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  downloads: number;
  rating: number;
  tags: string[];
  isPremium: boolean;
}

// 보고서 권한
export interface ReportPermission {
  userId: string;
  templateId: string;
  permissions: ('view' | 'edit' | 'delete' | 'share' | 'schedule')[];
  grantedAt: Date;
  grantedBy: string;
}

// 보고서 실행 이력
export interface ReportHistory {
  id: string;
  templateId: string;
  templateName: string;
  generatedBy: string;
  generatedAt: Date;
  parameters: Record<string, any>;
  format: string;
  status: 'success' | 'failed';
  duration: number; // milliseconds
  fileSize?: number; // bytes
  downloadCount: number;
  lastDownloadedAt?: Date;
}

// 보고서 설정
export interface ReportSettings {
  defaultFormat: 'pdf' | 'excel' | 'word';
  defaultOrientation: 'portrait' | 'landscape';
  defaultPageSize: string;
  watermark?: {
    enabled: boolean;
    text: string;
    opacity: number;
  };
  branding?: {
    logo: string;
    companyName: string;
    website: string;
  };
  emailTemplate?: {
    subject: string;
    body: string;
  };
}
