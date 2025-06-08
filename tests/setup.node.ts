import { vi } from 'vitest';

// 기본 설정 가져오기
import './setup';

// Node.js 전용 모킹 설정

// 파일 시스템 모킹
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    rmdir: vi.fn(),
    unlink: vi.fn(),
    stat: vi.fn(),
    readdir: vi.fn(),
  },
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
  rmdirSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

// 경로 모듈 모킹
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
  resolve: vi.fn((...args) => args.join('/')),
  dirname: vi.fn(path => path.split('/').slice(0, -1).join('/')),
  basename: vi.fn(path => path.split('/').pop()),
  extname: vi.fn(path => {
    const parts = path.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }),
}));

// 암호화 모듈 모킹
vi.mock('crypto', () => ({
  randomBytes: vi.fn(() => Buffer.from('mock-random-bytes')),
  randomUUID: vi.fn(() => 'mock-uuid-12345'),
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'mock-hash'),
  })),
}));

// 환경 변수 설정
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  JWT_SECRET: 'test-jwt-secret',
  REDIS_URL: 'redis://localhost:6379',
  AWS_ACCESS_KEY_ID: 'test-access-key',
  AWS_SECRET_ACCESS_KEY: 'test-secret-key',
  AWS_REGION: 'us-east-1',
};
