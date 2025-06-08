#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 UI 패키지 빌드 시작...');

try {
  // 1. 이전 빌드 제거
  console.log('🧹 이전 빌드 정리 중...');
  execSync('rm -rf dist', { stdio: 'inherit' });
  console.log('✅ 이전 빌드 정리 완료');

  // 2. TypeScript 컴파일
  console.log('📝 TypeScript 컴파일 중...');
  // 빌드 전용 tsconfig 사용
  const tscCommand = fs.existsSync(path.join(__dirname, '../tsconfig.build.json'))
    ? 'tsc -p tsconfig.build.json'
    : 'tsc';
  execSync(tscCommand, { stdio: 'inherit' });

  // 3. CSS 파일 복사
  console.log('🎨 CSS 파일 복사 중...');
  const cssSource = path.join(__dirname, '../app/styles/globals.css');
  const cssDest = path.join(__dirname, '../dist/globals.css');

  if (fs.existsSync(cssSource)) {
    fs.mkdirSync(path.dirname(cssDest), { recursive: true });
    fs.copyFileSync(cssSource, cssDest);
    console.log('✅ CSS 파일 복사 완료');
  }

  // 4. package.json 복사 (exports 필드 포함)
  const packageJson = require('../package.json');
  const distPackageJson = {
    ...packageJson,
    main: './index.js',
    module: './index.js',
    types: './index.d.ts',
  };

  fs.writeFileSync(
    path.join(__dirname, '../dist/package.json'),
    JSON.stringify(distPackageJson, null, 2)
  );

  console.log('✅ UI 패키지 빌드 완료!');
} catch (error) {
  console.error('❌ 빌드 실패:', error.message);
  process.exit(1);
}
