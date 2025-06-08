import Redis from 'ioredis';

interface RedisConfig {
  host: string;
  port: number;
  retryDelayOnFailover?: number;
  enableReadyCheck?: boolean;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

class RedisManager {
  private client: Redis | null = null;
  private config: RedisConfig;

  constructor(config: RedisConfig) {
    this.config = {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      ...config,
    };
  }

  async connect(): Promise<Redis> {
    if (this.client && this.client.status === 'ready') {
      return this.client;
    }

    try {
      this.client = new Redis(this.config);

      this.client.on('error', error => {
        console.error('Redis connection error:', error);
      });

      this.client.on('connect', () => {
        console.log('Redis connected successfully');
      });

      this.client.on('ready', () => {
        console.log('Redis ready to accept commands');
      });

      return this.client;
    } catch (error) {
      console.error('Failed to create Redis connection:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  isConnected(): boolean {
    return this.client?.status === 'ready';
  }
}

// 환경별 Redis 연결 팩토리
export function createRedisConnection(
  environment: 'development' | 'staging' | 'production'
): RedisManager {
  const config: RedisConfig = {
    host: getRedisHost(environment),
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  };

  return new RedisManager(config);
}

function getRedisHost(environment: string): string {
  switch (environment) {
    case 'production':
      return process.env.PROD_REDIS_HOST || 'localhost';
    case 'staging':
      return process.env.STAGING_REDIS_HOST || 'localhost';
    case 'development':
    default:
      return process.env.REDIS_HOST || 'localhost';
  }
}

// 기본 Redis 인스턴스 (싱글톤)
let defaultRedisManager: RedisManager | null = null;
let defaultRedisClient: Redis | null = null;

/**
 * 기본 Redis 클라이언트 인스턴스를 가져오거나 생성합니다.
 * 싱글톤 패턴으로 구현되어 있어 여러 번 호출해도 동일한 인스턴스를 반환합니다.
 */
export async function getRedisClient(): Promise<Redis> {
  // 이미 생성된 클라이언트가 있고 상태가 준비되어 있으면 반환
  if (defaultRedisClient) {
    return defaultRedisClient;
  }

  // RedisManager가 없으면 생성
  if (!defaultRedisManager) {
    const environment = (process.env.NODE_ENV || 'development') as
      | 'development'
      | 'staging'
      | 'production';
    defaultRedisManager = createRedisConnection(environment);
  }

  // 클라이언트 연결 및 저장
  defaultRedisClient = await defaultRedisManager.connect();
  return defaultRedisClient;
}

/**
 * Redis 연결을 종료합니다.
 * 테스트 환경에서 연결을 리셋하거나, 애플리케이션 종료 시 정상적인 연결 종료를 위해 사용합니다.
 */
export async function disconnectRedis(): Promise<void> {
  if (defaultRedisManager) {
    await defaultRedisManager.disconnect();
  }

  // 싱글톤 인스턴스 초기화
  defaultRedisManager = null;
  defaultRedisClient = null;
}

export { RedisManager };
