#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import * as dotenv from 'dotenv';
import inquirer from 'inquirer';

interface EnvFile {
  name: string;
  path: string;
  variables: Record<string, string>;
}

async function syncEnv() {
  console.log(chalk.blue('🔄 환경 변수 동기화 도구\n'));

  try {
    // 1. 모든 .env 파일 찾기
    console.log(chalk.yellow('1. 환경 변수 파일 검색 중...'));
    const envFiles = findEnvFiles();
    console.log(chalk.gray(`찾은 파일: ${envFiles.length}개\n`));

    // 2. 환경 변수 분석
    console.log(chalk.yellow('2. 환경 변수 분석 중...'));
    const analysis = analyzeEnvFiles(envFiles);

    // 3. 불일치 항목 표시
    console.log(chalk.yellow('3. 불일치 항목 확인\n'));
    displayInconsistencies(analysis);

    // 4. 동기화 옵션 선택
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '수행할 작업을 선택하세요:',
        choices: [
          { name: '모든 파일에 누락된 변수 추가', value: 'add-missing' },
          { name: '마스터 파일 기준으로 동기화', value: 'sync-from-master' },
          { name: '환경별 템플릿 생성', value: 'create-templates' },
          { name: '보고서만 생성', value: 'report-only' },
          { name: '종료', value: 'exit' },
        ],
      },
    ]);

    // 5. 선택한 작업 수행
    switch (action) {
      case 'add-missing':
        await addMissingVariables(envFiles, analysis);
        break;
      case 'sync-from-master':
        await syncFromMaster(envFiles);
        break;
      case 'create-templates':
        await createTemplates(envFiles);
        break;
      case 'report-only':
        generateReport(analysis);
        break;
      case 'exit':
        console.log(chalk.gray('종료합니다.'));
        process.exit(0);
    }

    console.log(chalk.green('\n✅ 작업이 완료되었습니다!'));
  } catch (error) {
    console.error(chalk.red('❌ 오류가 발생했습니다:'), error);
    process.exit(1);
  }
}

function findEnvFiles(): EnvFile[] {
  const envFiles: EnvFile[] = [];
  const patterns = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.staging',
    '.env.production',
    '.env.example',
  ];

  // 루트 디렉토리
  patterns.forEach(pattern => {
    const filePath = path.join(process.cwd(), pattern);
    if (fs.existsSync(filePath)) {
      const variables = dotenv.parse(fs.readFileSync(filePath));
      envFiles.push({
        name: pattern,
        path: filePath,
        variables,
      });
    }
  });

  // apps 디렉토리
  const appsDir = path.join(process.cwd(), 'apps');
  if (fs.existsSync(appsDir)) {
    const apps = fs
      .readdirSync(appsDir)
      .filter(f => fs.statSync(path.join(appsDir, f)).isDirectory());

    apps.forEach(app => {
      patterns.forEach(pattern => {
        const filePath = path.join(appsDir, app, pattern);
        if (fs.existsSync(filePath)) {
          const variables = dotenv.parse(fs.readFileSync(filePath));
          envFiles.push({
            name: `apps/${app}/${pattern}`,
            path: filePath,
            variables,
          });
        }
      });
    });
  }

  // backend 디렉토리
  const backendDir = path.join(process.cwd(), 'backend');
  if (fs.existsSync(backendDir)) {
    patterns.forEach(pattern => {
      const filePath = path.join(backendDir, pattern);
      if (fs.existsSync(filePath)) {
        const variables = dotenv.parse(fs.readFileSync(filePath));
        envFiles.push({
          name: `backend/${pattern}`,
          path: filePath,
          variables,
        });
      }
    });
  }

  return envFiles;
}

interface EnvAnalysis {
  allVariables: Set<string>;
  commonVariables: Set<string>;
  fileSpecificVariables: Map<string, Set<string>>;
  missingVariables: Map<string, Set<string>>;
}

function analyzeEnvFiles(envFiles: EnvFile[]): EnvAnalysis {
  const allVariables = new Set<string>();
  const variablesByFile = new Map<string, Set<string>>();

  // 모든 변수 수집
  envFiles.forEach(file => {
    const vars = new Set(Object.keys(file.variables));
    variablesByFile.set(file.name, vars);
    vars.forEach(v => allVariables.add(v));
  });

  // 공통 변수 찾기
  const commonVariables = new Set<string>();
  allVariables.forEach(variable => {
    const count = Array.from(variablesByFile.values()).filter(vars => vars.has(variable)).length;
    if (count === envFiles.length) {
      commonVariables.add(variable);
    }
  });

  // 파일별 고유 변수 찾기
  const fileSpecificVariables = new Map<string, Set<string>>();
  variablesByFile.forEach((vars, fileName) => {
    const specific = new Set([...vars].filter(v => !commonVariables.has(v)));
    if (specific.size > 0) {
      fileSpecificVariables.set(fileName, specific);
    }
  });

  // 누락된 변수 찾기
  const missingVariables = new Map<string, Set<string>>();
  envFiles.forEach(file => {
    const missing = new Set<string>();
    allVariables.forEach(variable => {
      if (!file.variables[variable]) {
        missing.add(variable);
      }
    });
    if (missing.size > 0) {
      missingVariables.set(file.name, missing);
    }
  });

  return {
    allVariables,
    commonVariables,
    fileSpecificVariables,
    missingVariables,
  };
}

function displayInconsistencies(analysis: EnvAnalysis) {
  console.log(chalk.cyan('📊 환경 변수 분석 결과:\n'));

  console.log(chalk.white(`총 변수 개수: ${analysis.allVariables.size}`));
  console.log(chalk.white(`공통 변수 개수: ${analysis.commonVariables.size}\n`));

  if (analysis.missingVariables.size > 0) {
    console.log(chalk.yellow('⚠️  누락된 변수:'));
    analysis.missingVariables.forEach((vars, fileName) => {
      console.log(chalk.gray(`  ${fileName}:`));
      vars.forEach(v => console.log(chalk.red(`    - ${v}`)));
    });
    console.log();
  }

  if (analysis.fileSpecificVariables.size > 0) {
    console.log(chalk.blue('📝 파일별 고유 변수:'));
    analysis.fileSpecificVariables.forEach((vars, fileName) => {
      console.log(chalk.gray(`  ${fileName}:`));
      vars.forEach(v => console.log(chalk.cyan(`    - ${v}`)));
    });
    console.log();
  }
}

async function addMissingVariables(envFiles: EnvFile[], analysis: EnvAnalysis) {
  console.log(chalk.yellow('\n누락된 변수 추가 중...'));

  for (const [fileName, missingVars] of analysis.missingVariables) {
    const file = envFiles.find(f => f.name === fileName);
    if (!file) continue;

    console.log(chalk.gray(`\n${fileName} 처리 중...`));

    const additions: string[] = [];

    for (const variable of missingVars) {
      // 다른 파일에서 값 찾기
      let defaultValue = '';
      for (const otherFile of envFiles) {
        if (otherFile.variables[variable]) {
          defaultValue = otherFile.variables[variable];
          break;
        }
      }

      const { value } = await inquirer.prompt([
        {
          type: 'input',
          name: 'value',
          message: `${variable}의 값을 입력하세요:`,
          default: defaultValue || '',
        },
      ]);

      additions.push(`${variable}=${value}`);
    }

    // 파일에 추가
    if (additions.length > 0) {
      const currentContent = fs.readFileSync(file.path, 'utf8');
      const newContent = currentContent + '\n' + additions.join('\n');
      fs.writeFileSync(file.path, newContent);
      console.log(chalk.green(`✓ ${additions.length}개의 변수를 추가했습니다.`));
    }
  }
}

async function syncFromMaster(envFiles: EnvFile[]) {
  const { masterFile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'masterFile',
      message: '마스터 파일로 사용할 파일을 선택하세요:',
      choices: envFiles.map(f => f.name),
    },
  ]);

  const master = envFiles.find(f => f.name === masterFile);
  if (!master) return;

  console.log(chalk.yellow(`\n${masterFile}을 기준으로 동기화 중...`));

  envFiles.forEach(file => {
    if (file.name === masterFile) return;

    // 마스터의 모든 변수를 현재 파일에 병합
    const merged = { ...master.variables, ...file.variables };

    const content = Object.entries(merged)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(file.path, content);
    console.log(chalk.green(`✓ ${file.name} 동기화 완료`));
  });
}

async function createTemplates(envFiles: EnvFile[]) {
  const templates = ['development', 'staging', 'production'];

  console.log(chalk.yellow('\n환경별 템플릿 생성 중...'));

  // 모든 변수 수집
  const allVars = new Set<string>();
  envFiles.forEach(file => {
    Object.keys(file.variables).forEach(v => allVars.add(v));
  });

  templates.forEach(env => {
    const templatePath = path.join(process.cwd(), `.env.${env}.template`);
    const content = Array.from(allVars)
      .sort()
      .map(variable => {
        // 환경별 기본값 설정
        let defaultValue = '';
        if (variable.includes('URL') || variable.includes('HOST')) {
          defaultValue = env === 'production' ? 'https://api.cargoro.com' : 'http://localhost:8000';
        }

        return `# ${variable}\n${variable}=${defaultValue}`;
      })
      .join('\n\n');

    fs.writeFileSync(templatePath, content);
    console.log(chalk.green(`✓ ${templatePath} 생성 완료`));
  });
}

function generateReport(analysis: EnvAnalysis) {
  const reportPath = path.join(process.cwd(), 'env-sync-report.md');

  let report = '# 환경 변수 동기화 보고서\n\n';
  report += `생성 시간: ${new Date().toLocaleString('ko-KR')}\n\n`;

  report += '## 요약\n\n';
  report += `- 총 변수 개수: ${analysis.allVariables.size}\n`;
  report += `- 공통 변수 개수: ${analysis.commonVariables.size}\n`;
  report += `- 불일치 파일 수: ${analysis.missingVariables.size}\n\n`;

  report += '## 공통 변수 목록\n\n';
  Array.from(analysis.commonVariables)
    .sort()
    .forEach(v => {
      report += `- ${v}\n`;
    });

  report += '\n## 누락된 변수\n\n';
  analysis.missingVariables.forEach((vars, fileName) => {
    report += `### ${fileName}\n\n`;
    Array.from(vars)
      .sort()
      .forEach(v => {
        report += `- ${v}\n`;
      });
    report += '\n';
  });

  report += '## 파일별 고유 변수\n\n';
  analysis.fileSpecificVariables.forEach((vars, fileName) => {
    report += `### ${fileName}\n\n`;
    Array.from(vars)
      .sort()
      .forEach(v => {
        report += `- ${v}\n`;
      });
    report += '\n';
  });

  fs.writeFileSync(reportPath, report);
  console.log(chalk.green(`\n✅ 보고서가 생성되었습니다: ${reportPath}`));
}

// 실행
syncEnv();
