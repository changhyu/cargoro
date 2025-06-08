#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { glob } from 'glob';

const program = new Command();

// 환경 변수 템플릿
const envTemplate = `# CarGoro 앱 환경 설정
# 이 파일은 자동으로 생성되었습니다. - $(date)

# API 엔드포인트
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

# 인증 설정
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_
CLERK_SECRET_KEY=sk_test_

# 모니터링 및 분석
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# 기능 플래그
NEXT_PUBLIC_FEATURE_NEW_DASHBOARD=true
NEXT_PUBLIC_FEATURE_SMART_REPAIR=true

# 기타 설정
NEXT_PUBLIC_APP_ENV=development
NODE_ENV=development
`;

// .env 파일 생성 함수
const createEnvFile = async (appName: string) => {
  try {
    let targetDir;

    // 대상 디렉토리 결정
    switch (appName) {
      case 'root':
        targetDir = process.cwd();
        break;
      case 'workshop-web':
      case 'fleet-manager-web':
      case 'parts-web':
      case 'superadmin-web':
        targetDir = path.join(process.cwd(), `apps/${appName}`);
        break;
      case 'all':
        // 모든 앱에 대해 재귀적으로 실행
        await createEnvFile('root');
        await createEnvFile('workshop-web');
        await createEnvFile('fleet-manager-web');
        await createEnvFile('parts-web');
        await createEnvFile('superadmin-web');
        return;
      default:
        console.log(chalk.yellow(`⚠️ 경고: 지원되지 않는 앱 이름입니다: ${appName}`));
        return;
    }

    // 디렉토리 존재 확인
    if (!fs.existsSync(targetDir)) {
      console.log(chalk.red(`❌ 에러: ${targetDir} 디렉토리가 존재하지 않습니다.`));
      return;
    }

    const envPath = path.join(targetDir, '.env');
    const envExamplePath = path.join(targetDir, '.env.example');

    // 기존 .env 파일 확인
    if (fs.existsSync(envPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `${envPath} 파일이 이미 존재합니다. 덮어쓰시겠습니까?`,
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.yellow(`⚠️ ${envPath} 파일 생성을 건너뜁니다.`));
        return;
      }
    }

    // 현재 날짜를 템플릿에 추가
    const envContent = envTemplate.replace('$(date)', new Date().toLocaleString());

    // .env 및 .env.example 파일 작성
    fs.writeFileSync(envPath, envContent);
    fs.writeFileSync(envExamplePath, envContent);

    console.log(chalk.green(`✅ ${envPath} 파일이 생성되었습니다.`));
    console.log(chalk.green(`✅ ${envExamplePath} 파일이 생성되었습니다.`));
  } catch (error) {
    console.error(chalk.red('❌ .env 파일 생성 실패:'), error);
  }
};

// 기존 .env 파일 동기화 함수
const syncEnvFiles = async () => {
  try {
    // 루트 .env 파일이 있는지 확인
    const rootEnvPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(rootEnvPath)) {
      console.log(chalk.yellow('⚠️ 루트 .env 파일이 없습니다. 먼저 루트 .env 파일을 생성하세요.'));
      return;
    }

    // 루트 .env 파일 로드
    const rootEnv = dotenv.parse(fs.readFileSync(rootEnvPath));

    // 앱 디렉토리 찾기
    const appDirs = ['workshop-web', 'fleet-manager-web', 'parts-web', 'superadmin-web']
      .map(app => path.join(process.cwd(), 'apps', app))
      .filter(dir => fs.existsSync(dir));

    // 각 앱 디렉토리의 .env 파일 업데이트
    for (const dir of appDirs) {
      const appEnvPath = path.join(dir, '.env');

      // 앱의 .env 파일이 없으면 루트 파일 복사
      if (!fs.existsSync(appEnvPath)) {
        fs.copyFileSync(rootEnvPath, appEnvPath);
        console.log(chalk.green(`✅ ${appEnvPath} 파일이 생성되었습니다.`));
        continue;
      }

      // 앱의 .env 파일이 있으면 업데이트
      const appEnv = dotenv.parse(fs.readFileSync(appEnvPath));
      let updated = false;
      let updatedContent = '';

      // 각 라인 확인
      const appEnvContent = fs.readFileSync(appEnvPath, 'utf8');
      const lines = appEnvContent.split('\n');

      for (const line of lines) {
        if (line.trim() && !line.startsWith('#')) {
          const [key] = line.split('=');
          if (key && rootEnv[key] && rootEnv[key] !== appEnv[key]) {
            updatedContent += `${key}=${rootEnv[key]}\n`;
            updated = true;
          } else {
            updatedContent += `${line}\n`;
          }
        } else {
          updatedContent += `${line}\n`;
        }
      }

      // 루트에 있는 새로운 키 추가
      for (const key in rootEnv) {
        if (!appEnv[key]) {
          updatedContent += `${key}=${rootEnv[key]}\n`;
          updated = true;
        }
      }

      if (updated) {
        fs.writeFileSync(appEnvPath, updatedContent);
        console.log(chalk.green(`✅ ${appEnvPath} 파일이 업데이트되었습니다.`));
      } else {
        console.log(chalk.blue(`ℹ️ ${appEnvPath} 파일은 이미 최신 상태입니다.`));
      }
    }

    console.log(chalk.green('✅ 모든 .env 파일이 동기화되었습니다.'));
  } catch (error) {
    console.error(chalk.red('❌ .env 파일 동기화 실패:'), error);
  }
};

// CLI 설정
program
  .name('setup-env')
  .description('CarGoro 모노레포의 환경 변수 설정을 관리하는 CLI 도구')
  .option(
    '-a, --app <app>',
    '환경 변수를 설정할 앱 (root, workshop-web, fleet-manager-web, parts-web, superadmin-web, all)',
    'all'
  )
  .option('-s, --sync', '기존 .env 파일들을 동기화합니다', false)
  .action(async options => {
    console.log(chalk.blue('🔧 CarGoro 환경 설정 도구'));

    if (options.sync) {
      await syncEnvFiles();
    } else {
      await createEnvFile(options.app);
    }
  });

program.parse();
