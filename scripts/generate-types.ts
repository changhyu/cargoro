#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

async function generateTypes() {
  console.log(chalk.blue('🔧 타입 생성을 시작합니다...\n'));

  try {
    // 1. Prisma 클라이언트 생성
    console.log(chalk.yellow('1. Prisma 클라이언트 생성 중...'));
    if (fs.existsSync(path.join(process.cwd(), 'backend/database/prisma/schema.prisma'))) {
      execSync('cd backend/database && npx prisma generate', { stdio: 'inherit' });
      console.log(chalk.green('✅ Prisma 클라이언트가 생성되었습니다!\n'));
    } else {
      console.log(chalk.gray('⏭️  Prisma schema 파일이 없습니다. 건너뜁니다.\n'));
    }

    // 2. GraphQL 코드젠 실행
    console.log(chalk.yellow('2. GraphQL 타입 생성 중...'));
    const codegenConfigPath = path.join(process.cwd(), 'codegen.yml');
    if (fs.existsSync(codegenConfigPath)) {
      execSync('npx graphql-codegen', { stdio: 'inherit' });
      console.log(chalk.green('✅ GraphQL 타입이 생성되었습니다!\n'));
    } else {
      // codegen.yml 파일 생성
      const codegenConfig = `overwrite: true
schema: "http://localhost:8000/graphql"
documents: "apps/**/src/**/*.{ts,tsx}"
generates:
  packages/types/src/graphql.ts:
    plugins:
      - "typescript"
      - "typescript-operations"
      - "typescript-react-query"
    config:
      fetcher:
        endpoint: "http://localhost:8000/graphql"
        fetchParams:
          headers:
            Content-Type: "application/json"
`;
      fs.writeFileSync(codegenConfigPath, codegenConfig);
      console.log(
        chalk.yellow(
          '⚠️  codegen.yml 파일을 생성했습니다. GraphQL 서버를 실행한 후 다시 시도해주세요.\n'
        )
      );
    }

    // 3. API 타입 생성 (OpenAPI)
    console.log(chalk.yellow('3. API 타입 생성 중...'));
    const openapiPath = path.join(process.cwd(), 'backend/openapi.json');
    if (fs.existsSync(openapiPath)) {
      execSync('npx openapi-typescript backend/openapi.json --output packages/types/src/api.ts', {
        stdio: 'inherit',
      });
      console.log(chalk.green('✅ API 타입이 생성되었습니다!\n'));
    } else {
      console.log(chalk.gray('⏭️  OpenAPI 스펙 파일이 없습니다. 건너뜁니다.\n'));
    }

    // 4. 타입 인덱스 파일 업데이트
    console.log(chalk.yellow('4. 타입 인덱스 파일 업데이트 중...'));
    const typesIndexPath = path.join(process.cwd(), 'packages/types/src/index.ts');
    const indexContent = `// 자동 생성된 타입들
export * from './graphql';
export * from './api';
export * from './domain';
export * from './shared';

// Prisma 타입 재내보내기
export * from '@prisma/client';
`;

    fs.mkdirSync(path.dirname(typesIndexPath), { recursive: true });
    fs.writeFileSync(typesIndexPath, indexContent);

    console.log(chalk.green('✅ 타입 인덱스 파일이 업데이트되었습니다!\n'));

    // 5. 타입 체크
    console.log(chalk.yellow('5. 타입 체크 실행 중...'));
    execSync('pnpm run typecheck', { stdio: 'inherit' });
    console.log(chalk.green('✅ 타입 체크가 완료되었습니다!\n'));

    console.log(chalk.blue('🎉 모든 타입 생성이 완료되었습니다!'));
  } catch (error) {
    console.error(chalk.red('❌ 타입 생성 중 오류가 발생했습니다:'), error);
    process.exit(1);
  }
}

// 실행
generateTypes();
