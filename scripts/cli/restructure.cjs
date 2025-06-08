#!/usr/bin/env node

/**
 * 프로젝트 구조 정리 스크립트
 *
 * 사용법:
 * - 루트 디렉터리에서 실행: `node scripts/cli/restructure.js`
 * - 특정 앱 정리: `node scripts/cli/restructure.js --app=workshop-web`
 * - 패키지 정리: `node scripts/cli/restructure.js --package=ui`
 * - 백엔드 정리: `node scripts/cli/restructure.js --backend`
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// 명령행 인수 파싱
const args = process.argv.slice(2);
const options = {
  app: args.find(arg => arg.startsWith('--app='))?.split('=')[1],
  package: args.find(arg => arg.startsWith('--package='))?.split('=')[1],
  backend: args.includes('--backend'),
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose'),
};

const MONOREPO_ROOT = path.resolve(__dirname, '../..');

// 로그 헬퍼 함수
const log = {
  info: msg => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: msg => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: msg => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: msg => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  verbose: msg => options.verbose && console.log(`\x1b[90m[VERBOSE]\x1b[0m ${msg}`),
};

// 파일/폴더 관련 유틸리티 함수
const fileUtils = {
  // 디렉터리 존재 확인 또는 생성
  ensureDir: dir => {
    if (!fs.existsSync(dir)) {
      if (!options.dryRun) {
        fs.mkdirSync(dir, { recursive: true });
      }
      log.verbose(`Created directory: ${dir}`);
    }
  },

  // 폴더 이동
  moveFolder: (src, dest) => {
    if (fs.existsSync(src)) {
      if (!options.dryRun) {
        fileUtils.ensureDir(path.dirname(dest));
        fs.renameSync(src, dest);
      }
      log.verbose(`Moved ${src} to ${dest}`);
    } else {
      log.verbose(`Source folder not found: ${src}`);
    }
  },

  // 불필요한 폴더/파일 삭제
  cleanupItems: items => {
    items.forEach(item => {
      if (fs.existsSync(item)) {
        if (!options.dryRun) {
          if (fs.lstatSync(item).isDirectory()) {
            fs.rmdirSync(item, { recursive: true });
          } else {
            fs.unlinkSync(item);
          }
        }
        log.verbose(`Removed: ${item}`);
      }
    });
  },

  // 파일 내용 복사
  copyFile: (src, dest) => {
    if (fs.existsSync(src)) {
      if (!options.dryRun) {
        fileUtils.ensureDir(path.dirname(dest));
        fs.copyFileSync(src, dest);
      }
      log.verbose(`Copied ${src} to ${dest}`);
    } else {
      log.verbose(`Source file not found: ${src}`);
    }
  },

  // 표준 폴더 구조 생성
  createStandardFolderStructure: (baseDir, folderList) => {
    folderList.forEach(folder => {
      const fullPath = path.join(baseDir, folder);
      fileUtils.ensureDir(fullPath);
    });
  },

  // index 파일 생성
  createIndexFile: (dir, content) => {
    const indexPath = path.join(dir, 'index.ts');
    if (!fs.existsSync(indexPath) && !options.dryRun) {
      fs.writeFileSync(indexPath, content || `// Export all from this directory\n`);
      log.verbose(`Created index file: ${indexPath}`);
    }
  },

  // tsconfig 표준화
  standardizeTsConfig: dir => {
    const tsConfigPath = path.join(dir, 'tsconfig.json');
    if (!fs.existsSync(tsConfigPath)) {
      // 표준 tsconfig 복사
      const baseTsConfigPath = path.join(MONOREPO_ROOT, 'tsconfig.base.json');
      if (fs.existsSync(baseTsConfigPath) && !options.dryRun) {
        const baseTsConfig = JSON.parse(fs.readFileSync(baseTsConfigPath, 'utf8'));
        const projectTsConfig = {
          extends: '../../tsconfig.base.json',
          compilerOptions: {
            outDir: './dist',
            rootDir: './src',
          },
          include: ['src/**/*'],
          exclude: ['node_modules', 'dist', 'coverage', '**/*.test.ts', '**/*.spec.ts'],
        };
        fs.writeFileSync(tsConfigPath, JSON.stringify(projectTsConfig, null, 2));
        log.verbose(`Created tsconfig: ${tsConfigPath}`);
      }
    }
  },
};

// 앱 구조 정리
const restructureApp = appName => {
  const appDir = path.join(MONOREPO_ROOT, 'apps', appName);
  if (!fs.existsSync(appDir)) {
    log.error(`App directory not found: ${appDir}`);
    return;
  }

  log.info(`Restructuring app: ${appName}`);

  // 표준 폴더 구조 확인 및 생성
  const standardFolders = [
    'app/components',
    'app/constants',
    'app/features',
    'app/hooks',
    'app/pages',
    'app/providers',
    'app/services',
    'app/state',
    'app/utils',
    'tests/features',
    'tests/mocks',
    'tests/providers',
    'tests/utils',
    'i18n',
    'public',
  ];

  // Next.js 앱인 경우 추가 폴더 구조
  if (appName.endsWith('-web')) {
    standardFolders.push('app/(auth)', 'app/(dashboard)', 'app/(features)', 'e2e/flows');
  }
  // 모바일 앱인 경우 추가 폴더 구조
  else if (
    appName.endsWith('-mobile') ||
    appName === 'delivery-driver' ||
    appName === 'smart-car-assistant'
  ) {
    standardFolders.push('app/navigation', 'assets/images', 'assets/fonts', 'assets/animations');
  }

  fileUtils.createStandardFolderStructure(appDir, standardFolders);

  // src 폴더가 있으면 app 폴더로 이동
  const srcDir = path.join(appDir, 'src');
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(appDir, 'app', file);
      fileUtils.moveFolder(srcPath, destPath);
    });
    if (!options.dryRun) {
      fs.rmdirSync(srcDir, { recursive: true });
    }
    log.verbose(`Moved src contents to app folder`);
  }

  // 표준 index 파일 생성
  standardFolders.forEach(folder => {
    if (folder.startsWith('app/')) {
      fileUtils.createIndexFile(path.join(appDir, folder));
    }
  });

  // tsconfig 표준화
  fileUtils.standardizeTsConfig(appDir);

  log.success(`App ${appName} restructured successfully`);
};

// 패키지 구조 정리
const restructurePackage = packageName => {
  const packageDir = path.join(MONOREPO_ROOT, 'packages', packageName);
  if (!fs.existsSync(packageDir)) {
    log.error(`Package directory not found: ${packageDir}`);
    return;
  }

  log.info(`Restructuring package: ${packageName}`);

  // 표준 폴더 구조
  const standardFolders = ['lib', 'tests', 'types'];

  fileUtils.createStandardFolderStructure(packageDir, standardFolders);

  // src 폴더가 있으면 lib 폴더로 이동
  const srcDir = path.join(packageDir, 'src');
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(packageDir, 'lib', file);
      fileUtils.moveFolder(srcPath, destPath);
    });
    if (!options.dryRun) {
      fs.rmdirSync(srcDir, { recursive: true });
    }
    log.verbose(`Moved src contents to lib folder`);
  }

  // app 폴더가 있으면 lib 폴더로 이동
  const appDir = path.join(packageDir, 'app');
  if (fs.existsSync(appDir)) {
    const files = fs.readdirSync(appDir);
    files.forEach(file => {
      const srcPath = path.join(appDir, file);
      const destPath = path.join(packageDir, 'lib', file);
      fileUtils.moveFolder(srcPath, destPath);
    });
    if (!options.dryRun) {
      fs.rmdirSync(appDir, { recursive: true });
    }
    log.verbose(`Moved app contents to lib folder`);
  }

  // 인덱스 파일 생성
  fileUtils.createIndexFile(packageDir, `export * from './lib';\n`);
  fileUtils.createIndexFile(path.join(packageDir, 'lib'));

  // tsconfig 표준화
  fileUtils.standardizeTsConfig(packageDir);

  log.success(`Package ${packageName} restructured successfully`);
};

// 백엔드 구조 정리
const restructureBackend = () => {
  const backendDir = path.join(MONOREPO_ROOT, 'backend');
  if (!fs.existsSync(backendDir)) {
    log.error(`Backend directory not found: ${backendDir}`);
    return;
  }

  log.info(`Restructuring backend`);

  // 표준 백엔드 폴더 구조
  const standardFolders = [
    'gateway/app/config',
    'gateway/graphql',
    'gateway/lib/middleware',
    'gateway/lib/resolvers',
    'gateway/routes',
    'gateway/tests/integration',
    'gateway/tests/unit',
    'database/lib/prisma',
    'database/lib/repositories',
    'database/tests/integration',
    'database/tests/unit',
    'jobs/lib/app',
    'jobs/lib/tasks',
    'jobs/tests/integration',
    'jobs/tests/unit',
    'services/core-api/lib',
    'services/core-api/tests',
    'services/repair-api/lib',
    'services/repair-api/tests',
    'services/delivery-api/lib',
    'services/delivery-api/tests',
    'services/fleet-api/lib',
    'services/fleet-api/tests',
    'services/parts-api/lib',
    'services/parts-api/tests',
    'services/admin-api/lib',
    'services/admin-api/tests',
    'shared/config',
    'shared/utils',
    'shared/testing',
    'tests/fixtures',
    'tests/integration',
    'tests/unit',
  ];

  fileUtils.createStandardFolderStructure(backendDir, standardFolders);

  // Prisma 설정 확인
  const prismaDir = path.join(backendDir, 'database/lib/prisma');
  const prismaSchemaPath = path.join(prismaDir, 'schema.prisma');
  if (!fs.existsSync(prismaSchemaPath)) {
    log.warning(`Prisma schema not found at ${prismaSchemaPath}`);
  }

  // conftest.py 표준화
  const conftestPaths = [
    path.join(backendDir, 'tests/conftest.py'),
    path.join(backendDir, 'services/core-api/tests/conftest.py'),
    path.join(backendDir, 'services/repair-api/tests/conftest.py'),
    path.join(backendDir, 'services/delivery-api/tests/conftest.py'),
    path.join(backendDir, 'services/fleet-api/tests/conftest.py'),
    path.join(backendDir, 'services/parts-api/tests/conftest.py'),
    path.join(backendDir, 'services/admin-api/tests/conftest.py'),
  ];

  conftestPaths.forEach(conftestPath => {
    if (!fs.existsSync(conftestPath)) {
      const conftestContent = `
import pytest
from pathlib import Path
import sys

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

# Add shared test fixtures
from backend.shared.testing.fixtures import *

@pytest.fixture
def app_client():
    # App client fixture for testing
    from fastapi.testclient import TestClient
    # Import your FastAPI app here
    # from .app import app
    # return TestClient(app)
    pass
`;
      if (!options.dryRun) {
        fileUtils.ensureDir(path.dirname(conftestPath));
        fs.writeFileSync(conftestPath, conftestContent.trim());
      }
      log.verbose(`Created conftest: ${conftestPath}`);
    }
  });

  log.success(`Backend restructured successfully`);
};

// 메인 실행 부분
const main = () => {
  if (options.dryRun) {
    log.warning('Running in dry-run mode - no changes will be made');
  }

  // 특정 앱 정리
  if (options.app) {
    restructureApp(options.app);
  }
  // 특정 패키지 정리
  else if (options.package) {
    restructurePackage(options.package);
  }
  // 백엔드 정리
  else if (options.backend) {
    restructureBackend();
  }
  // 모든 앱과 패키지 정리
  else {
    // 모든 앱 정리
    const appsDir = path.join(MONOREPO_ROOT, 'apps');
    if (fs.existsSync(appsDir)) {
      const apps = fs.readdirSync(appsDir).filter(file => {
        const filePath = path.join(appsDir, file);
        return fs.statSync(filePath).isDirectory() && !file.startsWith('.');
      });

      apps.forEach(app => restructureApp(app));
    }

    // 모든 패키지 정리
    const packagesDir = path.join(MONOREPO_ROOT, 'packages');
    if (fs.existsSync(packagesDir)) {
      const packages = fs.readdirSync(packagesDir).filter(file => {
        const filePath = path.join(packagesDir, file);
        return fs.statSync(filePath).isDirectory() && !file.startsWith('.');
      });

      packages.forEach(pkg => restructurePackage(pkg));
    }

    // 백엔드 정리
    restructureBackend();
  }

  log.success('Project restructuring completed successfully!');
};

main();
