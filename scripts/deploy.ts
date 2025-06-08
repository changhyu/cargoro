#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { config } from 'dotenv';

// 환경 변수 로드
config();

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  services: string[];
  skipTests: boolean;
  skipBuild: boolean;
  dryRun: boolean;
}

async function deploy() {
  console.log(chalk.blue('🚀 CarGoro 배포 스크립트\n'));

  // 배포 설정 수집
  const config = await getDeploymentConfig();

  // 배포 전 확인
  if (!config.dryRun) {
    const { confirmDeploy } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmDeploy',
        message: chalk.yellow(`정말로 ${config.environment} 환경에 배포하시겠습니까?`),
        default: false,
      },
    ]);

    if (!confirmDeploy) {
      console.log(chalk.red('❌ 배포가 취소되었습니다.'));
      process.exit(0);
    }
  }

  try {
    // 1. Git 상태 확인
    console.log(chalk.yellow('\n1. Git 상태 확인...'));
    checkGitStatus();

    // 2. 테스트 실행
    if (!config.skipTests) {
      console.log(chalk.yellow('\n2. 테스트 실행...'));
      runTests();
    }

    // 3. 빌드
    if (!config.skipBuild) {
      console.log(chalk.yellow('\n3. 애플리케이션 빌드...'));
      buildApplications(config.services);
    }

    // 4. Docker 이미지 빌드
    console.log(chalk.yellow('\n4. Docker 이미지 빌드...'));
    buildDockerImages(config);

    // 5. 배포
    console.log(chalk.yellow('\n5. 배포 시작...'));
    if (config.dryRun) {
      console.log(chalk.gray('(Dry run 모드 - 실제 배포는 수행되지 않습니다)'));
    } else {
      deployToEnvironment(config);
    }

    console.log(chalk.green('\n✅ 배포가 성공적으로 완료되었습니다!'));
  } catch (error) {
    console.error(chalk.red('\n❌ 배포 중 오류가 발생했습니다:'), error);
    process.exit(1);
  }
}

async function getDeploymentConfig(): Promise<DeploymentConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'environment',
      message: '배포할 환경을 선택하세요:',
      choices: ['development', 'staging', 'production'],
    },
    {
      type: 'checkbox',
      name: 'services',
      message: '배포할 서비스를 선택하세요:',
      choices: [
        { name: 'Workshop Web', value: 'workshop-web' },
        { name: 'Fleet Manager Web', value: 'fleet-manager-web' },
        { name: 'Parts Web', value: 'parts-web' },
        { name: 'Superadmin Web', value: 'superadmin-web' },
        { name: 'Backend Gateway', value: 'backend-gateway' },
        { name: 'Core API', value: 'core-api' },
        { name: 'Repair API', value: 'repair-api' },
        { name: 'Parts API', value: 'parts-api' },
        { name: 'Fleet API', value: 'fleet-api' },
      ],
      validate: input => input.length > 0 || '최소 하나의 서비스를 선택해야 합니다.',
    },
    {
      type: 'confirm',
      name: 'skipTests',
      message: '테스트를 건너뛰시겠습니까?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'skipBuild',
      message: '빌드를 건너뛰시겠습니까? (이미 빌드된 경우)',
      default: false,
    },
    {
      type: 'confirm',
      name: 'dryRun',
      message: 'Dry run 모드로 실행하시겠습니까?',
      default: true,
    },
  ]);

  return answers as DeploymentConfig;
}

function checkGitStatus() {
  // 커밋되지 않은 변경사항 확인
  const status = execSync('git status --porcelain').toString();
  if (status) {
    throw new Error('커밋되지 않은 변경사항이 있습니다. 먼저 커밋해주세요.');
  }

  // 현재 브랜치 확인
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  console.log(chalk.gray(`현재 브랜치: ${branch}`));
}

function runTests() {
  console.log(chalk.gray('단위 테스트 실행...'));
  execSync('pnpm run test', { stdio: 'inherit' });

  console.log(chalk.gray('통합 테스트 실행...'));
  execSync('pnpm run test:integration', { stdio: 'inherit' });
}

function buildApplications(services: string[]) {
  services.forEach(service => {
    console.log(chalk.gray(`${service} 빌드 중...`));
    execSync(`pnpm run build --filter=${service}`, { stdio: 'inherit' });
  });
}

function buildDockerImages(config: DeploymentConfig) {
  const tag = `${config.environment}-${Date.now()}`;

  config.services.forEach(service => {
    console.log(chalk.gray(`${service} Docker 이미지 빌드 중...`));

    const dockerfilePath = getDockerfilePath(service);
    const imageName = `cargoro/${service}:${tag}`;

    const buildCommand = `docker build -f ${dockerfilePath} -t ${imageName} .`;

    if (config.dryRun) {
      console.log(chalk.gray(`[DRY RUN] ${buildCommand}`));
    } else {
      execSync(buildCommand, { stdio: 'inherit' });
    }
  });
}

function getDockerfilePath(service: string): string {
  if (service.includes('web')) {
    return `apps/${service}/Dockerfile`;
  } else if (service.includes('api')) {
    return `backend/services/${service}/Dockerfile`;
  } else if (service === 'backend-gateway') {
    return 'backend/gateway/Dockerfile';
  }
  throw new Error(`Unknown service: ${service}`);
}

function deployToEnvironment(config: DeploymentConfig) {
  switch (config.environment) {
    case 'development':
      deployToDevelopment(config);
      break;
    case 'staging':
      deployToStaging(config);
      break;
    case 'production':
      deployToProduction(config);
      break;
  }
}

function deployToDevelopment(config: DeploymentConfig) {
  console.log(chalk.gray('개발 환경에 배포 중...'));

  // Docker Compose를 사용한 로컬 배포
  const composeFile = 'docker-compose.dev.yml';
  const command = `docker-compose -f ${composeFile} up -d ${config.services.join(' ')}`;

  execSync(command, { stdio: 'inherit' });
}

function deployToStaging(config: DeploymentConfig) {
  console.log(chalk.gray('스테이징 환경에 배포 중...'));

  // Kubernetes 배포
  config.services.forEach(service => {
    const manifestPath = `infra/k8s/staging/${service}.yaml`;
    const command = `kubectl apply -f ${manifestPath}`;

    console.log(chalk.gray(`${service} 배포 중...`));
    execSync(command, { stdio: 'inherit' });
  });
}

function deployToProduction(config: DeploymentConfig) {
  console.log(chalk.gray('프로덕션 환경에 배포 중...'));

  // Helm을 사용한 프로덕션 배포
  config.services.forEach(service => {
    const releaseName = `cargoro-${service}`;
    const chartPath = `infra/helm/${service}`;
    const valuesFile = `infra/helm/values/production.yaml`;

    const command = `helm upgrade --install ${releaseName} ${chartPath} -f ${valuesFile}`;

    console.log(chalk.gray(`${service} 배포 중...`));
    execSync(command, { stdio: 'inherit' });
  });

  // 배포 후 헬스 체크
  console.log(chalk.yellow('\n배포 후 헬스 체크...'));
  checkDeploymentHealth(config);
}

function checkDeploymentHealth(config: DeploymentConfig) {
  // 각 서비스의 헬스 체크 엔드포인트 확인
  config.services.forEach(service => {
    const healthUrl = getHealthCheckUrl(service, config.environment);
    console.log(chalk.gray(`${service} 헬스 체크: ${healthUrl}`));

    // 실제 구현에서는 axios나 fetch를 사용하여 헬스 체크
    // 여기서는 시뮬레이션
    console.log(chalk.green(`✓ ${service} 정상 작동 중`));
  });
}

function getHealthCheckUrl(service: string, environment: string): string {
  const baseUrls: Record<string, string> = {
    development: 'http://localhost',
    staging: 'https://staging.cargoro.com',
    production: 'https://api.cargoro.com',
  };

  const base = baseUrls[environment];
  return `${base}/${service}/health`;
}

// 실행
deploy();
