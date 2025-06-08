/**
 * 모노레포 전체 코드 커버리지 리포트를 병합하는 스크립트
 *
 * 이 스크립트는 모든 앱과 패키지에서 생성된 커버리지 결과를
 * 하나의 통합된 보고서로 병합합니다.
 *
 * 실행 방법: pnpm coverage:report
 *
 * 주의: 이 파일은 ES 모듈로 실행됩니다. 스크립트 폴더에 package.json 파일을 생성하고
 * {"type": "module"} 설정을 추가해주세요.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import glob from 'glob';
import { createCoverageMap } from 'istanbul-lib-coverage';
import { createContext } from 'istanbul-lib-report';
import { create as createReport } from 'istanbul-reports';

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 루트 디렉토리
const rootDir = path.resolve(__dirname, '..');

// 앱과 패키지 디렉토리
const appsDir = path.join(rootDir, 'apps');
const packagesDir = path.join(rootDir, 'packages');
const backendDir = path.join(rootDir, 'backend');

// 결과 저장 디렉토리
const coverageDir = path.join(rootDir, 'coverage');

// 커버리지 파일 경로
const coverageFiles = [];

// 커버리지 임계값 설정 (%) - 낮은 커버리지에 대한 경고를 제공
const COVERAGE_THRESHOLDS = {
  global: {
    statements: 70,
    branches: 60,
    functions: 70,
    lines: 70,
  },
  packages: {
    ui: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    'api-client': {
      statements: 75,
      branches: 65,
      functions: 75,
      lines: 75,
    },
    // 필요에 따라 다른 패키지에 대한 임계값 추가
  },
  backend: {
    statements: 75,
    branches: 65,
    functions: 75,
    lines: 75,
  },
};

// 앱 디렉토리에서 커버리지 파일 찾기
if (fs.existsSync(appsDir)) {
  const apps = fs.readdirSync(appsDir);
  apps.forEach(app => {
    const appCoverageFile = path.join(appsDir, app, 'coverage', 'coverage-final.json');
    if (fs.existsSync(appCoverageFile)) {
      console.log(`✓ 앱 커버리지 발견: ${app}`);
      coverageFiles.push(appCoverageFile);
    } else {
      console.log(`⚠️ 앱 커버리지 없음: ${app}`);
    }
  });
}

// 패키지 디렉토리에서 커버리지 파일 찾기
if (fs.existsSync(packagesDir)) {
  const packages = fs.readdirSync(packagesDir);
  packages.forEach(pkg => {
    const pkgCoverageFile = path.join(packagesDir, pkg, 'coverage', 'coverage-final.json');
    if (fs.existsSync(pkgCoverageFile)) {
      console.log(`✓ 패키지 커버리지 발견: ${pkg}`);
      coverageFiles.push(pkgCoverageFile);
    } else {
      console.log(`⚠️ 패키지 커버리지 없음: ${pkg}`);
    }
  });
}

// 백엔드 디렉토리에서 커버리지 파일 찾기
if (fs.existsSync(backendDir)) {
  // 백엔드 메인 커버리지
  const backendCoverageFile = path.join(backendDir, '.coverage');
  const backendJsonCoverageFile = path.join(backendDir, 'coverage.json');

  // pytest-cov에서 생성된 .coverage 파일이 있는지 확인
  if (fs.existsSync(backendCoverageFile)) {
    console.log(`✓ 백엔드 커버리지 발견 (.coverage)`);

    // Python coverage.py를 사용하여 JSON 포맷으로 변환
    try {
      console.log('📊 백엔드 커버리지 JSON 변환 중...');
      execSync(`cd ${backendDir} && python -m coverage json`, { stdio: 'inherit' });

      if (fs.existsSync(backendJsonCoverageFile)) {
        console.log(`✓ 백엔드 JSON 커버리지 생성 완료`);
        coverageFiles.push(backendJsonCoverageFile);
      }
    } catch (error) {
      console.error('❌ 백엔드 커버리지 변환 중 오류:', error);
    }
  } else {
    console.log(`⚠️ 백엔드 커버리지 파일 없음 (.coverage)`);
  }

  // 서비스별 커버리지 파일 찾기
  const servicesDir = path.join(backendDir, 'services');
  if (fs.existsSync(servicesDir)) {
    const services = fs.readdirSync(servicesDir);
    services.forEach(service => {
      const serviceCoverageFile = path.join(servicesDir, service, '.coverage');
      const serviceJsonCoverageFile = path.join(servicesDir, service, 'coverage.json');

      if (fs.existsSync(serviceCoverageFile)) {
        console.log(`✓ 서비스 커버리지 발견: ${service}`);

        // JSON 포맷으로 변환
        try {
          console.log(`📊 ${service} 서비스 커버리지 JSON 변환 중...`);
          execSync(`cd ${path.join(servicesDir, service)} && python -m coverage json`, {
            stdio: 'inherit',
          });

          if (fs.existsSync(serviceJsonCoverageFile)) {
            console.log(`✓ ${service} JSON 커버리지 생성 완료`);
            coverageFiles.push(serviceJsonCoverageFile);
          }
        } catch (error) {
          console.error(`❌ ${service} 커버리지 변환 중 오류:`, error);
        }
      }
    });
  }
}

// 커버리지 디렉토리 생성
if (!fs.existsSync(coverageDir)) {
  fs.mkdirSync(coverageDir, { recursive: true });
}

// 커버리지 결과 요약 생성 함수
function generateCoverageSummary(reportPath) {
  try {
    if (fs.existsSync(path.join(reportPath, 'coverage-summary.json'))) {
      const summary = JSON.parse(
        fs.readFileSync(path.join(reportPath, 'coverage-summary.json'), 'utf8')
      );

      console.log('\n📊 커버리지 요약:');
      console.log(
        '│ 구분        │ 라인 커버리지 │ 함수 커버리지 │ 브랜치 커버리지 │ 구문 커버리지 │'
      );
      console.log('├─────────────┼──────────────┼──────────────┼────────────────┼──────────────┤');

      const total = summary.total;

      // 전체 통계
      console.log(
        `│ 전체        │ ${formatCoverage(total.lines.pct)} │ ${formatCoverage(total.functions.pct)} │ ${formatCoverage(total.branches.pct)} │ ${formatCoverage(total.statements.pct)} │`
      );

      // 임계값 기준 확인
      checkThresholds(total, COVERAGE_THRESHOLDS.global);

      return summary;
    }
    return null;
  } catch (error) {
    console.error('요약 생성 중 오류 발생:', error);
    return null;
  }
}

// 커버리지 포맷팅 (예: 75.5% -> "75.5%")
function formatCoverage(value) {
  const coverage = typeof value === 'number' ? value.toFixed(1) : 'N/A';
  const paddedCoverage = coverage.toString().padStart(6, ' ');
  return `${paddedCoverage}%`;
}

// 임계값 확인 함수
function checkThresholds(coverage, thresholds) {
  console.log('\n🔍 임계값 기준 검사:');

  const checks = [
    { type: '라인', actual: coverage.lines.pct, threshold: thresholds.lines },
    { type: '함수', actual: coverage.functions.pct, threshold: thresholds.functions },
    { type: '브랜치', actual: coverage.branches.pct, threshold: thresholds.branches },
    { type: '구문', actual: coverage.statements.pct, threshold: thresholds.statements },
  ];

  checks.forEach(check => {
    const icon = check.actual >= check.threshold ? '✅' : '❌';
    const status = check.actual >= check.threshold ? '충족' : '미달';
    console.log(
      `${icon} ${check.type} 커버리지: ${check.actual.toFixed(1)}% (목표: ${check.threshold}%) - ${status}`
    );
  });
}

// 백엔드 Python 커버리지 실행 함수
function runBackendCoverage() {
  console.log('\n🐍 백엔드 Python 테스트 커버리지 실행 중...');

  try {
    // 기본 백엔드 테스트 커버리지 실행
    execSync(
      'cd ./backend && python -m pytest --cov=. --cov-report=term --cov-report=xml:coverage.xml tests/',
      {
        stdio: 'inherit',
      }
    );
    console.log('✅ 백엔드 기본 테스트 커버리지 완료');

    // 서비스별 테스트 커버리지 실행
    const servicesDir = path.join(rootDir, 'backend', 'services');
    if (fs.existsSync(servicesDir)) {
      const services = fs
        .readdirSync(servicesDir)
        .filter(
          dir =>
            fs.existsSync(path.join(servicesDir, dir, 'tests')) &&
            fs.statSync(path.join(servicesDir, dir, 'tests')).isDirectory()
        );

      for (const service of services) {
        const serviceTestDir = path.join(servicesDir, service, 'tests');
        if (fs.existsSync(serviceTestDir)) {
          console.log(`🧪 ${service} 서비스 테스트 커버리지 실행 중...`);
          try {
            execSync(
              `cd ${path.join(servicesDir, service)} && python -m pytest --cov=. --cov-report=term --cov-report=xml:coverage.xml tests/`,
              {
                stdio: 'inherit',
              }
            );
            console.log(`✅ ${service} 서비스 테스트 커버리지 완료`);
          } catch (error) {
            console.error(`❌ ${service} 서비스 테스트 실패:`, error.message);
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('❌ 백엔드 테스트 커버리지 실행 실패:', error.message);
    return false;
  }
}

// 프론트엔드 Vitest 커버리지 실행 함수
function runFrontendCoverage() {
  console.log('\n🧪 프론트엔드 테스트 커버리지 실행 중...');

  try {
    execSync('pnpm turbo run test:coverage', { stdio: 'inherit' });
    console.log('✅ 프론트엔드 테스트 커버리지 완료');
    return true;
  } catch (error) {
    console.error('❌ 프론트엔드 테스트 커버리지 실행 실패:', error.message);
    return false;
  }
}

// 커버리지 실행 및 병합
console.log('🚀 테스트 커버리지 실행 시작...');

// 백엔드 커버리지 실행
const backendSuccess = runBackendCoverage();

// 프론트엔드 커버리지 실행
const frontendSuccess = runFrontendCoverage();

// 커버리지 파일이 있으면 병합 수행
if (coverageFiles.length > 0) {
  console.log('🔍 커버리지 파일 탐색 중...');
  console.log(`✅ ${coverageFiles.length}개의 커버리지 파일을 찾았습니다.`);

  // 커버리지 병합을 위한 Vitest 명령어 생성
  try {
    // 임시 병합 설정 파일 생성
    const configContent = `
    export default {
      reporter: ['json', 'json-summary', 'html', 'text', 'lcov'],
      reportsDirectory: './coverage'
    }
    `;

    fs.writeFileSync(path.join(rootDir, 'vitest.coverage.config.js'), configContent);

    console.log('💼 커버리지 보고서 병합 중...');

    // 모든 커버리지 파일 내용 읽기
    const mergedCoverage = {};

    coverageFiles.forEach(file => {
      try {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        Object.entries(content).forEach(([key, value]) => {
          mergedCoverage[key] = value;
        });
      } catch (error) {
        console.error(`${file} 파일 처리 중 오류:`, error.message);
      }
    });

    // 병합된 커버리지 저장
    fs.writeFileSync(
      path.join(coverageDir, 'coverage-final.json'),
      JSON.stringify(mergedCoverage, null, 2)
    );

    // 커버리지 맵 생성
    const coverageMap = createCoverageMap(mergedCoverage);

    // 보고서 생성 컨텍스트 설정
    const context = createContext({
      dir: coverageDir,
      coverageMap,
    });

    // 다양한 포맷의 보고서 생성
    ['json-summary', 'text-summary', 'html'].forEach(reporter => {
      console.log(`${reporter} 보고서 생성 중...`);
      const report = createReport(reporter);
      report.execute(context);
    });

    // 임시 설정 파일 삭제
    fs.unlinkSync(path.join(rootDir, 'vitest.coverage.config.js'));

    // 커버리지 요약 생성
    const summary = generateCoverageSummary(path.join(rootDir, 'coverage'));

    console.log('\n✨ 통합 코드 커버리지 보고서가 생성되었습니다.');
    console.log(`📊 보고서 위치: ${path.join(rootDir, 'coverage')}`);
    console.log('🔗 HTML 보고서를 브라우저에서 확인하려면: open coverage/index.html');

    // 개선이 필요한 영역 식별
    console.log('\n🚀 개선이 필요한 패키지:');
    if (summary) {
      // 커버리지가 낮은 패키지 찾기 (75% 미만)
      const LOW_COVERAGE_THRESHOLD = 75;
      let improvementNeeded = false;

      for (const [key, value] of Object.entries(summary)) {
        if (
          key !== 'total' &&
          typeof value === 'object' &&
          value.lines &&
          value.lines.pct < LOW_COVERAGE_THRESHOLD
        ) {
          improvementNeeded = true;
          console.log(
            `⚠️  ${key}: 라인 커버리지 ${value.lines.pct.toFixed(1)}% (목표: ${LOW_COVERAGE_THRESHOLD}%)`
          );
        }
      }

      if (!improvementNeeded) {
        console.log('✅ 모든 패키지가 최소 커버리지 기준을 충족합니다!');
      }
    }
  } catch (error) {
    console.error('❌ 커버리지 병합 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
} else {
  console.log('⚠️ 커버리지 파일을 찾을 수 없습니다. 먼저 테스트를 실행하세요: pnpm test:coverage');
  process.exit(0);
}
