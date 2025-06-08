#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import * as glob from 'glob';

async function formatAll() {
  console.log(chalk.blue('🎨 전체 프로젝트 포맷팅 시작...\n'));

  try {
    // 1. Prettier 실행
    console.log(chalk.yellow('1. Prettier 포맷팅...'));
    const prettierFiles = [
      '**/*.{js,jsx,ts,tsx,json,md,mdx,css,scss}',
      '!**/node_modules/**',
      '!**/.next/**',
      '!**/dist/**',
      '!**/build/**',
      '!**/coverage/**',
      '!**/.turbo/**',
      '!**/venv/**',
      '!**/.venv/**',
    ];

    execSync(`pnpm prettier --write "${prettierFiles.join(' ')}"`, {
      stdio: 'inherit',
      shell: '/bin/bash',
    });
    console.log(chalk.green('✅ Prettier 포맷팅 완료\n'));

    // 2. ESLint 자동 수정
    console.log(chalk.yellow('2. ESLint 자동 수정...'));
    execSync('pnpm run lint:fix', { stdio: 'inherit' });
    console.log(chalk.green('✅ ESLint 수정 완료\n'));

    // 3. Python 코드 포맷팅 (Black)
    console.log(chalk.yellow('3. Python 코드 포맷팅...'));
    const pythonPath = path.join(process.cwd(), 'backend');
    if (fs.existsSync(pythonPath)) {
      try {
        execSync(`cd backend && black . --exclude="/venv/|/.venv/|/migrations/"`, {
          stdio: 'inherit',
        });
        console.log(chalk.green('✅ Python 포맷팅 완료\n'));
      } catch (error) {
        console.log(chalk.gray('⚠️  Black이 설치되지 않았습니다. Python 포맷팅을 건너뜁니다.\n'));
      }
    }

    // 4. import 정렬
    console.log(chalk.yellow('4. Import 문 정렬...'));
    const tsFiles = glob.sync('**/*.{ts,tsx}', {
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
    });

    tsFiles.forEach(file => {
      sortImports(file);
    });
    console.log(chalk.green('✅ Import 정렬 완료\n'));

    // 5. 파일 권한 정리
    console.log(chalk.yellow('5. 파일 권한 정리...'));
    // 실행 가능한 스크립트 파일들
    const executableFiles = glob.sync('**/*.sh', {
      ignore: ['**/node_modules/**'],
    });

    executableFiles.forEach(file => {
      fs.chmodSync(file, '755');
    });
    console.log(chalk.green('✅ 파일 권한 정리 완료\n'));

    // 6. 불필요한 파일 정리
    console.log(chalk.yellow('6. 불필요한 파일 정리...'));
    cleanupFiles();
    console.log(chalk.green('✅ 파일 정리 완료\n'));

    console.log(chalk.blue('🎉 전체 포맷팅이 완료되었습니다!'));
  } catch (error) {
    console.error(chalk.red('❌ 포맷팅 중 오류가 발생했습니다:'), error);
    process.exit(1);
  }
}

function sortImports(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // import 문 추출
  const importLines: string[] = [];
  const otherLines: string[] = [];
  let inImportBlock = false;

  for (const line of lines) {
    if (line.startsWith('import ')) {
      inImportBlock = true;
      importLines.push(line);
    } else if (inImportBlock && line.trim() === '') {
      // import 블록 끝
      continue;
    } else {
      inImportBlock = false;
      otherLines.push(line);
    }
  }

  // import 문 정렬
  const sortedImports = sortImportLines(importLines);

  // 파일 재구성
  const newContent = [...sortedImports, '', ...otherLines].join('\n');
  fs.writeFileSync(filePath, newContent);
}

function sortImportLines(imports: string[]): string[] {
  const reactImports: string[] = [];
  const nextImports: string[] = [];
  const externalImports: string[] = [];
  const internalImports: string[] = [];
  const relativeImports: string[] = [];
  const styleImports: string[] = [];

  imports.forEach(line => {
    if (line.includes("from 'react'") || line.includes('from "react"')) {
      reactImports.push(line);
    } else if (line.includes("from 'next") || line.includes('from "next')) {
      nextImports.push(line);
    } else if (line.includes("from '@/") || line.includes('from "@/')) {
      internalImports.push(line);
    } else if (
      line.includes("from './") ||
      line.includes('from "./') ||
      line.includes("from '../") ||
      line.includes('from "../')
    ) {
      relativeImports.push(line);
    } else if (line.includes('.css') || line.includes('.scss') || line.includes('.module')) {
      styleImports.push(line);
    } else {
      externalImports.push(line);
    }
  });

  return [
    ...reactImports.sort(),
    ...nextImports.sort(),
    ...externalImports.sort(),
    ...internalImports.sort(),
    ...relativeImports.sort(),
    ...styleImports.sort(),
  ].filter(Boolean);
}

function cleanupFiles() {
  // 정리할 파일 패턴
  const filesToClean = [
    '**/*.log',
    '**/.DS_Store',
    '**/Thumbs.db',
    '**/*.bak',
    '**/*.tmp',
    '**/*.temp',
    '**/*.swp',
    '**/*~',
  ];

  filesToClean.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: ['**/node_modules/**', '**/.git/**'],
    });

    files.forEach(file => {
      fs.unlinkSync(file);
      console.log(chalk.gray(`  삭제: ${file}`));
    });
  });
}

// 실행
formatAll();
