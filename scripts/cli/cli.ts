#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const MONOREPO_ROOT = path.resolve(__dirname, '..');
const APP_TEMPLATE_DIR = path.join(MONOREPO_ROOT, 'scripts/templates/app');
const PACKAGE_TEMPLATE_DIR = path.join(MONOREPO_ROOT, 'scripts/templates/package');
const APPS_DIR = path.join(MONOREPO_ROOT, 'apps');
const PACKAGES_DIR = path.join(MONOREPO_ROOT, 'packages');

const question = (query: string): Promise<string> => {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer);
    });
  });
};

const validateName = (name: string, type: 'app' | 'package'): boolean => {
  if (!name) {
    console.error(`${type} 이름을 입력해주세요.`);
    return false;
  }

  const regex = /^[a-z0-9-]+$/;
  if (!regex.test(name)) {
    console.error(`${type} 이름은 소문자, 숫자, 대시(-)만 포함할 수 있습니다.`);
    return false;
  }

  const dir = type === 'app' ? path.join(APPS_DIR, name) : path.join(PACKAGES_DIR, name);
  if (fs.existsSync(dir)) {
    console.error(`${dir} 디렉토리가 이미 존재합니다.`);
    return false;
  }

  return true;
};

const createApp = async () => {
  const appName = await question('앱 이름을 입력하세요 (예: customer-web): ');
  if (!validateName(appName, 'app')) {
    rl.close();
    return;
  }

  const appType = await question('앱 유형을 선택하세요 (web/mobile, 기본값: web): ');
  const isWeb = appType.toLowerCase() !== 'mobile';

  const description = await question('앱 설명을 입력하세요: ');

  console.log(`\n${appName} 앱을 생성합니다...\n`);

  const targetDir = path.join(APPS_DIR, appName);
  fs.mkdirSync(targetDir, { recursive: true });

  // 템플릿 파일 복사
  console.log('템플릿 파일 복사 중...');

  // package.json 템플릿 처리 및 복사
  const packageJsonTemplate = fs.readFileSync(
    path.join(APP_TEMPLATE_DIR, 'package.json.template'),
    'utf8'
  );
  const packageJsonContent = packageJsonTemplate
    .replace(/{{APP_NAME}}/g, appName)
    .replace(/"name": "{{APP_NAME}}"/g, `"name": "${appName}"`)
    .replace(/"version": "0.1.0"/g, `"version": "0.1.0"`)
    .replace(/"description": ""/g, `"description": "${description}"`);

  fs.writeFileSync(path.join(targetDir, 'package.json'), packageJsonContent);

  // tsconfig.json 템플릿 복사
  const tsconfigTemplate = fs.readFileSync(
    path.join(APP_TEMPLATE_DIR, 'tsconfig.json.template'),
    'utf8'
  );
  fs.writeFileSync(path.join(targetDir, 'tsconfig.json'), tsconfigTemplate);

  // vitest 설정 파일 복사
  const vitestConfigTemplate = fs.readFileSync(
    path.join(APP_TEMPLATE_DIR, 'vitest.config.ts.template'),
    'utf8'
  );
  fs.writeFileSync(path.join(targetDir, 'vitest.config.ts'), vitestConfigTemplate);

  const vitestSetupTemplate = fs.readFileSync(
    path.join(APP_TEMPLATE_DIR, 'vitest.setup.ts.template'),
    'utf8'
  );
  fs.writeFileSync(path.join(targetDir, 'vitest.setup.ts'), vitestSetupTemplate);

  // Next.js 앱에 필요한 추가 설정
  if (isWeb) {
    console.log('Next.js 설정 추가 중...');

    // next.config.js 생성
    const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@cargoro/ui",
    "@cargoro/utils",
    "@cargoro/types",
    "@cargoro/api-client",
    "@cargoro/auth",
    "@cargoro/analytics",
    "@cargoro/i18n"
  ],
  eslint: {
    // 프로덕션 빌드 시에만 린트 검사 활성화
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },
};

module.exports = nextConfig;`;
    fs.writeFileSync(path.join(targetDir, 'next.config.js'), nextConfigContent);

    // tailwind.config.js 생성
    const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/app/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
      },
    },
  },
  plugins: [],
  presets: [require('../../packages/ui/app/theme/tailwind.preset.js')],
}`;
    fs.writeFileSync(path.join(targetDir, 'tailwind.config.js'), tailwindConfigContent);

    // middleware.ts 생성
    const middlewareContent = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 미들웨어 로직 (인증, 로깅, 리다이렉트 등)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 미들웨어를 적용할 경로 패턴 매처 설정
     * 예: '/dashboard/:path*'
     */
  ],
};`;
    fs.writeFileSync(path.join(targetDir, 'middleware.ts'), middlewareContent);
  } else {
    // 모바일 앱 설정
    console.log('모바일 앱 설정 추가 중...');

    // babel.config.js 생성
    const babelConfigContent = `module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@app': './app',
          '@components': './app/components',
          '@features': './app/features',
          '@hooks': './app/hooks',
          '@state': './app/state',
          '@services': './app/services',
          '@constants': './app/constants',
        },
      },
    ],
  ],
};`;
    fs.writeFileSync(path.join(targetDir, 'babel.config.js'), babelConfigContent);
  }

  // 앱 구조 생성 스크립트 복사 및 실행
  const structureScriptTemplate = fs.readFileSync(
    path.join(APP_TEMPLATE_DIR, 'structure.sh.template'),
    'utf8'
  );
  const structureScriptPath = path.join(targetDir, 'structure.sh');
  fs.writeFileSync(structureScriptPath, structureScriptTemplate);

  // 스크립트에 실행 권한 부여
  fs.chmodSync(structureScriptPath, '755');

  // 디렉토리 이동 후 스크립트 실행
  console.log('앱 구조 생성 중...');
  try {
    execSync(`cd "${targetDir}" && ./structure.sh`);
    // 스크립트 실행 후 삭제
    fs.unlinkSync(structureScriptPath);
  } catch (error) {
    console.error('앱 구조 생성 중 오류 발생:', error);
  }

  console.log(`\n✅ ${appName} 앱이 성공적으로 생성되었습니다!`);
  console.log(`\n앱 디렉토리: ${targetDir}`);
  console.log('\n다음 단계:');
  console.log('1. 앱 디렉토리로 이동: cd apps/' + appName);
  console.log('2. 개발 서버 실행: pnpm dev');
  console.log('\n');

  rl.close();
};

const createPackage = async () => {
  const packageName = await question('패키지 이름을 입력하세요 (예: utils): ');
  if (!validateName(packageName, 'package')) {
    rl.close();
    return;
  }

  const description = await question('패키지 설명을 입력하세요: ');

  console.log(`\n@cargoro/${packageName} 패키지를 생성합니다...\n`);

  const targetDir = path.join(PACKAGES_DIR, packageName);
  fs.mkdirSync(targetDir, { recursive: true });

  // 템플릿 파일 복사
  console.log('템플릿 파일 복사 중...');

  // package.json 템플릿 처리 및 복사
  const packageJsonTemplate = fs.readFileSync(
    path.join(PACKAGE_TEMPLATE_DIR, 'package.json.template'),
    'utf8'
  );
  const packageJsonContent = packageJsonTemplate
    .replace(/{{PACKAGE_NAME}}/g, packageName)
    .replace(/"version": "0.1.0"/g, `"version": "0.1.0"`)
    .replace(/"description": ""/g, `"description": "${description}"`);

  fs.writeFileSync(path.join(targetDir, 'package.json'), packageJsonContent);

  // tsconfig.json 템플릿 복사
  const tsconfigTemplate = fs.readFileSync(
    path.join(PACKAGE_TEMPLATE_DIR, 'tsconfig.json.template'),
    'utf8'
  );
  fs.writeFileSync(path.join(targetDir, 'tsconfig.json'), tsconfigTemplate);

  // vitest 설정 파일 복사
  const vitestConfigTemplate = fs.readFileSync(
    path.join(PACKAGE_TEMPLATE_DIR, 'vitest.config.ts.template'),
    'utf8'
  );
  fs.writeFileSync(path.join(targetDir, 'vitest.config.ts'), vitestConfigTemplate);

  // 패키지 구조 생성 스크립트 복사 및 실행
  const structureScriptTemplate = fs
    .readFileSync(path.join(PACKAGE_TEMPLATE_DIR, 'structure.sh.template'), 'utf8')
    .replace(/{{PACKAGE_NAME}}/g, packageName);

  const structureScriptPath = path.join(targetDir, 'structure.sh');
  fs.writeFileSync(structureScriptPath, structureScriptTemplate);

  // 스크립트에 실행 권한 부여
  fs.chmodSync(structureScriptPath, '755');

  // 디렉토리 이동 후 스크립트 실행
  console.log('패키지 구조 생성 중...');
  try {
    execSync(`cd "${targetDir}" && ./structure.sh`);
    // 스크립트 실행 후 삭제
    fs.unlinkSync(structureScriptPath);
  } catch (error) {
    console.error('패키지 구조 생성 중 오류 발생:', error);
  }

  console.log(`\n✅ @cargoro/${packageName} 패키지가 성공적으로 생성되었습니다!`);
  console.log(`\n패키지 디렉토리: ${targetDir}`);
  console.log('\n다음 단계:');
  console.log('1. 패키지 디렉토리로 이동: cd packages/' + packageName);
  console.log('2. 개발 모드 실행: pnpm dev');
  console.log('\n');

  rl.close();
};

const main = async () => {
  const command = process.argv[2];

  if (command === 'create-app') {
    await createApp();
  } else if (command === 'create-package') {
    await createPackage();
  } else {
    console.log('\n사용 가능한 명령어:');
    console.log('  create-app     : 새로운 앱 생성');
    console.log('  create-package : 새로운 패키지 생성');
    console.log('\n');
    rl.close();
  }
};

main();
