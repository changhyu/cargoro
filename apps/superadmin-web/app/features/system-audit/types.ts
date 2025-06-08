/**
 * 시스템 감사 모듈에서 사용하는 타입 정의
 */

// 감사 로그 레벨
export type AuditLogLevel = 'info' | 'warning' | 'error' | 'critical';

// 감사 카테고리
export const AuditCategoryValues = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  DATA_ACCESS: 'data_access',
  SYSTEM_CONFIG: 'system_config',
  USER_MANAGEMENT: 'user_management',
  REPORTING: 'reporting',
  API: 'api',
  SECURITY: 'security',
  GENERAL: 'general',
} as const;

export type AuditCategory = (typeof AuditCategoryValues)[keyof typeof AuditCategoryValues];

// 서비스 유형
export const ServiceTypeValues = {
  AUTH_SERVICE: 'auth_service',
  USER_SERVICE: 'user_service',
  CORE_API: 'core_api',
  ADMIN_API: 'admin_api',
  WORKSHOP_API: 'workshop_api',
  FLEET_API: 'fleet_api',
  DELIVERY_API: 'delivery_api',
  PARTS_API: 'parts_api',
  GATEWAY_API: 'gateway_api',
  SCHEDULING_SERVICE: 'scheduling_service',
  NOTIFICATION_SERVICE: 'notification_service',
  ADMIN_PORTAL: 'admin_portal',
} as const;

export type ServiceType = (typeof ServiceTypeValues)[keyof typeof ServiceTypeValues];

// 감사 로그 필터 타입
export interface AuditLogFilter {
  page: number;
  pageSize: number;
  level?: AuditLogLevel;
  category?: AuditCategory;
  serviceType?: ServiceType;
  userId?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

// 감사 로그 아이템 타입
export interface AuditLog {
  id: string;
  timestamp: string;
  level: AuditLogLevel;
  category: AuditCategory;
  serviceType: ServiceType;
  message: string;
  details: string;
  userId?: string;
  userName?: string;
  resourceId?: string;
  resourceType?: string;
  ipAddress?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

// 감사 로그 응답 타입
export interface AuditLogsResponse {
  logs: AuditLog[];
  totalLogs: number;
  totalPages: number;
  page: number;
  pageSize: number;
  statistics: {
    info: number;
    warning: number;
    error: number;
    critical: number;
  };
}

// 감사 룰 타입
export interface AuditRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: AuditCategory;
  level: AuditLogLevel;
  conditions: AuditRuleCondition[];
  actions: AuditRuleAction[];
  createdAt: string;
  updatedAt: string;
}

// 감사 룰 조건 타입
export interface AuditRuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

// 감사 룰 액션 타입
export interface AuditRuleAction {
  type: 'log' | 'alert' | 'block';
  params?: Record<string, unknown>;
}

// 감사 로그 통계 인터페이스
export interface AuditLogStatistics {
  totalLogs: number;
  totalErrorLogs: number;
  totalWarningLogs: number;
  totalInfoLogs: number;
  totalCriticalLogs: number;
  topCategories: Array<{ category: AuditCategory; count: number }>;
  topServices: Array<{ serviceType: ServiceType; count: number }>;
  recentActivity: {
    date: string;
    count: number;
  }[];
}
