#!/usr/bin/env node
/**
 * Prisma 클라이언트 생성 스크립트
 *
 * 이 스크립트는 Prisma 스키마를 기반으로 Prisma 클라이언트를 생성합니다.
 * 테스트 실행 전에 이 스크립트를 실행하여 필요한 Prisma 클라이언트를 생성합니다.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 얻기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 색상 정의
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Prisma 스키마 경로
const prismaDir = path.join(__dirname, '..', 'backend', 'database', 'lib', 'prisma');
const prismaSchemaPath = path.join(prismaDir, 'schema.prisma');

/**
 * 메시지를 색상으로 출력
 * @param {string} message - 출력할 메시지
 * @param {string} color - 색상 코드
 */
function printColored(message, color) {
  console.log(`${color}${message}${RESET}`);
}

/**
 * 명령 실행
 * @param {string} command - 실행할 명령
 * @param {string[]} args - 명령 인자
 * @param {Object} options - 실행 옵션
 * @returns {Promise} - 명령 실행 결과
 */
function runCommand(command, args, options = {}) {
  printColored(`실행: ${command} ${args.join(' ')}`, BLUE);

  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: options.cwd || prismaDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, ...options.env },
    });

    proc.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`명령이 코드 ${code}로 종료되었습니다`));
      }
    });
  });
}

/**
 * Prisma 클라이언트 생성
 */
async function generatePrismaClient() {
  printColored(`${BOLD}Prisma 클라이언트 생성 중...${RESET}`, BLUE);

  try {
    // Prisma 스키마 파일 확인
    if (!fs.existsSync(prismaSchemaPath)) {
      printColored(`❌ Prisma 스키마 파일을 찾을 수 없습니다: ${prismaSchemaPath}`, RED);
      process.exit(1);
    }

    // 테스트를 위한 더미 DATABASE_URL 설정 (실제로는 .env 파일에서 읽어와야 함)
    const dummyDatabaseUrl =
      'postgresql://postgres:postgres@localhost:5432/cargoro_test?schema=public';

    // 호환 버전 사용하여 Node.js 클라이언트 생성
    printColored('Prisma 클라이언트 생성 중 (호환 버전 사용)...', BLUE);
    await runCommand('npx', ['prisma@5.17.0', 'generate'], {
      env: { DATABASE_URL: dummyDatabaseUrl },
    });

    // Python 클라이언트를 위한 디버그 모드 설정
    printColored('Python Prisma 클라이언트 생성 중...', BLUE);
    await runCommand('npx', ['prisma@5.17.0', 'generate'], {
      env: {
        DATABASE_URL: dummyDatabaseUrl,
        PRISMA_PY_DEBUG_GENERATOR: '1',
      },
    });

    printColored('✅ Prisma 클라이언트 생성이 완료되었습니다.', GREEN);
  } catch (error) {
    printColored(`❌ Prisma 클라이언트 생성 중 오류가 발생했습니다: ${error.message}`, RED);
    printColored('💡 .env 파일에 DATABASE_URL이 올바르게 설정되어 있는지 확인하세요.', YELLOW);
    process.exit(1);
  }
}

// 스크립트 실행
generatePrismaClient();
