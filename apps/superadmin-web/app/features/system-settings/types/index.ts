// 시스템 설정 관련 타입 정의

export interface SystemSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  email: EmailSettings;
  storage: StorageSettings;
  api: ApiSettings;
  backup: BackupSettings;
  maintenance: MaintenanceSettings;
}

export interface GeneralSettings {
  siteName: string;
  siteUrl: string;
  logoUrl?: string;
  timezone: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  dateFormat: string;
  timeFormat: string;
  currency: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays?: number;
  };
  sessionPolicy: {
    maxSessionDuration: number; // minutes
    idleTimeout: number; // minutes
    concurrentSessions: boolean;
    maxConcurrentSessions?: number;
  };
  twoFactorAuth: {
    enabled: boolean;
    required: boolean;
    methods: ('totp' | 'sms' | 'email')[];
  };
  ipWhitelist: {
    enabled: boolean;
    addresses: string[];
  };
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface EmailSettings {
  provider: 'smtp' | 'sendgrid' | 'ses' | 'mailgun';
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  templates: EmailTemplate[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: 'auth' | 'notification' | 'report' | 'marketing';
}

export interface StorageSettings {
  provider: 'local' | 's3' | 'gcs' | 'azure';
  local?: {
    path: string;
    maxSize: number; // GB
  };
  s3?: {
    bucket: string;
    region: string;
    accessKey: string;
    secretKey: string;
  };
  fileUpload: {
    maxFileSize: number; // MB
    allowedTypes: string[];
    imageOptimization: boolean;
    imageMaxWidth?: number;
    imageMaxHeight?: number;
  };
}

export interface ApiSettings {
  baseUrl: string;
  version: string;
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  cors: {
    enabled: boolean;
    origins: string[];
    methods: string[];
    headers: string[];
  };
  authentication: {
    tokenExpiration: number; // hours
    refreshTokenExpiration: number; // days
    apiKeyExpiration?: number; // days
  };
  webhooks: WebhookConfig[];
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  active: boolean;
  secret?: string;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // seconds
  };
}

export interface BackupSettings {
  enabled: boolean;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:mm
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  storage: {
    provider: 'local' | 's3' | 'gcs' | 'azure';
    path: string;
  };
  types: {
    database: boolean;
    files: boolean;
    logs: boolean;
  };
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    recipients: string[];
  };
}

export interface MaintenanceSettings {
  logs: {
    retention: number; // days
    level: 'debug' | 'info' | 'warn' | 'error';
    storage: 'file' | 'database' | 'both';
  };
  cache: {
    provider: 'memory' | 'redis';
    ttl: number; // seconds
    maxSize: number; // MB
  };
  jobs: {
    cleanupOldData: {
      enabled: boolean;
      schedule: string; // cron expression
      olderThan: number; // days
    };
    optimizeDatabase: {
      enabled: boolean;
      schedule: string; // cron expression
    };
    generateReports: {
      enabled: boolean;
      schedule: string; // cron expression
      types: string[];
    };
  };
}

export interface SystemConfiguration {
  id: string;
  key: string;
  value: string | number | boolean | object;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
  isSecret: boolean;
  isReadonly: boolean;
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: (string | number)[];
  };
  updatedAt: string;
  updatedBy: string;
}

export interface IntegrationSettings {
  id: string;
  name: string;
  type: 'payment' | 'sms' | 'analytics' | 'crm' | 'erp';
  provider: string;
  enabled: boolean;
  config: Record<string, unknown>;
  webhookUrl?: string;
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'error';
  error?: string;
}

export interface LicenseInfo {
  key: string;
  type: 'trial' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'expired' | 'suspended';
  issuedAt: string;
  expiresAt: string;
  features: {
    maxUsers?: number;
    maxOrganizations?: number;
    customBranding: boolean;
    apiAccess: boolean;
    advancedReporting: boolean;
    multiLanguage: boolean;
    customIntegrations: boolean;
    prioritySupport: boolean;
  };
  usage: {
    users: number;
    organizations: number;
    storage: number; // GB
    apiCalls: number;
  };
}
