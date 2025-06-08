// 시스템 모니터링 관련 타입 정의

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number; // 0-100
    cores: number;
  };
  memory: {
    total: number; // bytes
    used: number; // bytes
    percentage: number; // 0-100
  };
  disk: {
    total: number; // bytes
    used: number; // bytes
    percentage: number; // 0-100
  };
  network: {
    inbound: number; // bytes/sec
    outbound: number; // bytes/sec
  };
}

export interface ServiceHealth {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number; // seconds
  responseTime: number; // ms
  errorRate: number; // 0-100
  lastChecked: string;
  endpoints: EndpointHealth[];
}

export interface EndpointHealth {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number; // ms
  successRate: number; // 0-100
  lastError?: string;
}

export interface DatabaseMetrics {
  name: string;
  type: 'postgresql' | 'redis' | 'mongodb';
  status: 'connected' | 'disconnected' | 'error';
  connections: {
    active: number;
    idle: number;
    max: number;
  };
  queryPerformance: {
    avgResponseTime: number; // ms
    slowQueries: number;
    totalQueries: number;
  };
  size: number; // bytes
}

export interface ApplicationMetrics {
  appName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  activeUsers: number;
  totalUsers: number;
  requestsPerMinute: number;
  errorRate: number; // 0-100
  avgResponseTime: number; // ms
  topEndpoints: Array<{
    path: string;
    count: number;
    avgTime: number;
  }>;
}

export interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  type: 'system' | 'service' | 'database' | 'security';
  title: string;
  message: string;
  source: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  acknowledgedBy?: string;
}

export interface SystemDashboard {
  systemMetrics: SystemMetrics;
  services: ServiceHealth[];
  databases: DatabaseMetrics[];
  applications: ApplicationMetrics[];
  recentAlerts: SystemAlert[];
  uptimePercentage: number; // 최근 30일
  totalRequests24h: number;
  totalErrors24h: number;
}

export interface UserActivity {
  userId: string;
  userName: string;
  email: string;
  role: string;
  lastActive: string;
  actions: Array<{
    timestamp: string;
    action: string;
    resource: string;
    ipAddress: string;
    userAgent: string;
  }>;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  service: string;
  message: string;
  metadata?: Record<string, unknown>;
  traceId?: string;
}

export interface BackupStatus {
  id: string;
  type: 'database' | 'files' | 'full';
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  size?: number; // bytes
  location?: string;
  error?: string;
}
