#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const MONOREPO_ROOT = path.resolve(__dirname, '..');
const APPS_DIR = path.join(MONOREPO_ROOT, 'apps');
const BASE_ENV_FILE = path.join(MONOREPO_ROOT, '.env.example');

const question = (query: string): Promise<string> => {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer);
    });
  });
};

const listApps = (): string[] => {
  return fs.readdirSync(APPS_DIR).filter(item => {
    const stats = fs.statSync(path.join(APPS_DIR, item));
    return stats.isDirectory();
  });
};

/**
 * 환경 변수 파일에서 변수를 추출합니다.
 * @param filePath 환경 변수 파일 경로
 * @returns 환경 변수와 값의 맵
 */
const parseEnvFile = (filePath: string): Map<string, string> => {
  const envMap = new Map<string, string>();

  if (!fs.existsSync(filePath)) {
    return envMap;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (const line of lines) {
    // 주석 또는 빈 줄 무시
    if (line.startsWith('#') || line.trim() === '') {
      continue;
    }

    // 환경 변수 이름과 값 추출
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && match.length >= 3) {
      const name = match[1].trim();
      const value = match[2].trim();
      envMap.set(name, value);
    }
  }

  return envMap;
};

/**
 * 환경 변수 맵을 파일로 저장합니다.
 * @param filePath 저장할 파일 경로
 * @param envMap 환경 변수 맵
 */
const saveEnvFile = (filePath: string, envMap: Map<string, string>): void => {
  let content = '# 환경 변수 - 자동 생성됨\n';

  for (const [name, value] of envMap.entries()) {
    content += `${name}=${value}\n`;
  }

  fs.writeFileSync(filePath, content);
};

/**
 * 특정 앱의 환경 변수를 동기화합니다.
 * @param appName 앱 이름
 * @param baseEnvMap 기본 환경 변수 맵
 */
const syncAppEnv = (appName: string, baseEnvMap: Map<string, string>): void => {
  const appDir = path.join(APPS_DIR, appName);
  const appEnvFile = path.join(appDir, '.env.local');
  const appEnvExample = path.join(appDir, '.env.example');

  // 앱 전용 .env.example 파일이 있는지 확인
  let appEnvMap = new Map<string, string>();
  if (fs.existsSync(appEnvExample)) {
    appEnvMap = parseEnvFile(appEnvExample);
  }

  // 앱 전용 .env.local 파일이 있는지 확인하고 기존 값 보존
  const existingEnvMap = fs.existsSync(appEnvFile)
    ? parseEnvFile(appEnvFile)
    : new Map<string, string>();

  // 최종 환경 변수 맵 생성
  const finalEnvMap = new Map<string, string>();

  // 기본 환경 변수 추가
  for (const [name, value] of baseEnvMap.entries()) {
    finalEnvMap.set(name, existingEnvMap.has(name) ? existingEnvMap.get(name)! : value);
  }

  // 앱 전용 환경 변수 추가 (기본 변수 덮어쓰기)
  for (const [name, value] of appEnvMap.entries()) {
    finalEnvMap.set(name, existingEnvMap.has(name) ? existingEnvMap.get(name)! : value);
  }

  // 최종 환경 변수 저장
  saveEnvFile(appEnvFile, finalEnvMap);
  console.log(`✅ ${appName}의 환경 변수 동기화 완료`);
};

/**
 * 모든 앱의 환경 변수를 동기화합니다.
 */
const syncAllApps = (baseEnvMap: Map<string, string>): void => {
  const apps = listApps();
  for (const app of apps) {
    syncAppEnv(app, baseEnvMap);
  }
};

const main = async (): Promise<void> => {
  console.log('환경 변수 동기화 도구를 시작합니다...\n');

  // 기본 환경 변수 파일 확인
  if (!fs.existsSync(BASE_ENV_FILE)) {
    console.error(`❌ 기본 환경 변수 파일(${BASE_ENV_FILE})이 존재하지 않습니다.`);
    rl.close();
    return;
  }

  const baseEnvMap = parseEnvFile(BASE_ENV_FILE);
  console.log(`🔍 기본 환경 변수 파일에서 ${baseEnvMap.size}개의 변수를 찾았습니다.\n`);

  const apps = listApps();
  console.log(`💼 모노레포에서 ${apps.length}개의 앱을 발견했습니다: ${apps.join(', ')}\n`);

  const answer = await question('모든 앱의 환경 변수를 동기화하시겠습니까? (y/n, 기본값: y): ');

  if (answer.toLowerCase() === 'n') {
    const appName = await question('동기화할 특정 앱 이름을 입력하세요: ');
    if (apps.includes(appName)) {
      syncAppEnv(appName, baseEnvMap);
    } else {
      console.error(`❌ "${appName}" 앱을 찾을 수 없습니다.`);
    }
  } else {
    syncAllApps(baseEnvMap);
    console.log('\n✅ 모든 앱의 환경 변수 동기화가 완료되었습니다.');
  }

  rl.close();
};

main().catch(error => {
  console.error('❌ 오류 발생:', error);
  process.exit(1);
});
