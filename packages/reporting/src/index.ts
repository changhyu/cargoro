// 컴포넌트
export { ReportGenerator } from './components/report-generator';
export { ReportManager } from './components/report-manager';
export { TemplateEditor } from './components/template-editor';

// 훅
export * from './hooks';

// API 클라이언트
export * from './api';

// 유틸리티
export * from './utils/pdf-generator';

// 타입
export type {
  ReportTemplate,
  ReportHistory,
  GenerateReportRequest,
  GenerateReportResponse,
  ReportJob,
  ReportParameter,
  ReportSection,
  ReportLayout,
  DataSource,
  TableConfig,
  ChartConfig,
  KPIConfig,
} from './types';

// 상태 관리
export * from './store';

// 서버 사이드 유틸리티는 Next.js 서버 컴포넌트에서만 임포트하세요
// 서버 모듈은 '@cargoro/reporting/server'로 임포트하세요
// export * from './server/report-generator';

// 클라이언트에서는 직접 생성기를 사용하지 않습니다
// 서버 사이드에서만 사용하세요
// export * from './generators/pdf-generator';
// export * from './generators/excel-generator';
