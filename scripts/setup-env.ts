#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface EnvConfig {
  [key: string]: {
    description: string;
    required: boolean;
    default?: string;
    validation?: (value: string) => boolean;
  };
}

// 필수 환경 변수 정의
const envConfig: EnvConfig = {
  // Next.js 환경 변수
  NEXT_PUBLIC_APP_URL: {
    description: '애플리케이션 URL',
    required: true,
    default: 'http://localhost:3000',
  },

  // Clerk 인증
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
    description: 'Clerk Publishable Key',
    required: true,
  },
  CLERK_SECRET_KEY: {
    description: 'Clerk Secret Key',
    required: true,
  },

  // 데이터베이스
  DATABASE_URL: {
    description: 'PostgreSQL 데이터베이스 URL',
    required: true,
    validation: value => value.startsWith('postgresql://'),
  },

  // API 설정
  API_BASE_URL: {
    description: 'Backend API 기본 URL',
    required: true,
    default: 'http://localhost:8000',
  },

  // Firebase (선택적)
  NEXT_PUBLIC_FIREBASE_API_KEY: {
    description: 'Firebase API Key',
    required: false,
  },
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {
    description: 'Firebase Auth Domain',
    required: false,
  },
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: {
    description: 'Firebase Project ID',
    required: false,
  },

  // Sentry (선택적)
  NEXT_PUBLIC_SENTRY_DSN: {
    description: 'Sentry DSN',
    required: false,
  },

  // PostHog (선택적)
  NEXT_PUBLIC_POSTHOG_KEY: {
    description: 'PostHog API Key',
    required: false,
  },
  NEXT_PUBLIC_POSTHOG_HOST: {
    description: 'PostHog Host URL',
    required: false,
    default: 'https://app.posthog.com',
  },
};

async function setupEnvironment() {
  console.log(chalk.blue('🔧 환경 변수 설정을 시작합니다...\n'));

  const { environment } = await inquirer.prompt([
    {
      type: 'list',
      name: 'environment',
      message: '설정할 환경을 선택하세요:',
      choices: ['development', 'staging', 'production'],
    },
  ]);

  const envFile = environment === 'development' ? '.env.local' : `.env.${environment}`;
  const envPath = path.join(process.cwd(), envFile);

  // 기존 환경 변수 파일 읽기
  let existingEnv: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `${envFile} 파일이 이미 존재합니다. 덮어쓰시겠습니까?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      existingEnv = dotenv.parse(fs.readFileSync(envPath));
      console.log(chalk.yellow('기존 값을 유지하며 누락된 값만 추가합니다.\n'));
    }
  }

  const envValues: Record<string, string> = { ...existingEnv };

  // 각 환경 변수 설정
  for (const [key, config] of Object.entries(envConfig)) {
    if (existingEnv[key]) {
      console.log(chalk.gray(`✓ ${key}: 기존 값 사용`));
      continue;
    }

    if (!config.required) {
      const { skip } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'skip',
          message: `${key} (선택적)을 설정하시겠습니까?`,
          default: false,
        },
      ]);

      if (skip) continue;
    }

    const { value } = await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message: `${key} - ${config.description}:`,
        default: config.default,
        validate: input => {
          if (config.required && !input) {
            return '필수 값입니다.';
          }
          if (config.validation && input && !config.validation(input)) {
            return '유효하지 않은 형식입니다.';
          }
          return true;
        },
      },
    ]);

    if (value) {
      envValues[key] = value;
    }
  }

  // 환경 변수 파일 생성
  const envContent = Object.entries(envValues)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(envPath, envContent);

  console.log(chalk.green(`\n✅ ${envFile} 파일이 성공적으로 생성되었습니다!`));

  // .env.example 업데이트
  const { updateExample } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'updateExample',
      message: '.env.example 파일을 업데이트하시겠습니까?',
      default: true,
    },
  ]);

  if (updateExample) {
    const exampleContent = Object.entries(envConfig)
      .map(([key, config]) => {
        const value = config.default || '';
        const comment = config.required ? '# 필수' : '# 선택적';
        return `${key}=${value} ${comment} - ${config.description}`;
      })
      .join('\n');

    fs.writeFileSync(path.join(process.cwd(), '.env.example'), exampleContent);
    console.log(chalk.green('✅ .env.example 파일이 업데이트되었습니다!'));
  }

  console.log(chalk.blue('\n🎉 환경 설정이 완료되었습니다!'));
}

// 실행
setupEnvironment().catch(error => {
  console.error(chalk.red('❌ 오류가 발생했습니다:'), error);
  process.exit(1);
});
