/**
 * Cargoro Monorepo Metro 설정 도우미
 *
 * 모든 모바일 앱에서 사용할 수 있는 공통 Metro 번들러 설정입니다.
 * Haste 모듈 이름 충돌을 방지하고 모노레포 구조에서 패키지 공유를 쉽게 합니다.
 */
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/**
 * 공통 Metro 설정 생성
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @param {number} port - 앱의 Metro 서버 포트
 * @param {string[]} additionalExtraModules - 추가적인 모듈 매핑
 * @returns {object} Metro 설정 객체
 */
function createMetroConfig(projectRoot, port = 8081, additionalExtraModules = {}) {
  const workspaceRoot = path.resolve(projectRoot, '../..');
  const config = getDefaultConfig(projectRoot);

  // Metro 서버 포트 설정
  config.server = {
    ...config.server,
    port: port,
  };

  // 모노레포의 모든 파일 감시
  config.watchFolders = [
    path.resolve(workspaceRoot, 'packages'),
    path.resolve(projectRoot, 'node_modules'),
  ];

  // 노드 모듈 경로 설정
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ];

  // 충돌하는 파일 제외하기
  config.resolver.blockList = [
    // 백엔드 디렉토리 내 충돌 파일들 제외
    new RegExp(`${path.resolve(workspaceRoot, 'backend').replace(/[/\\]/g, '[/\\\\]')}/.*`),
    // 중복된 node_modules 제외
    /.*\/node_modules\/.*\/node_modules\/@cargoro\/.*/,
    // dist 폴더의 package.json 제외하여 중복 방지
    /.*\/packages\/.*\/dist\/package\.json$/,
    // 다른 모바일 앱 디렉토리 제외 (필요한 경우)
    /.*\/apps\/(?!.*\-mobile\/(?!node_modules)).*$/,
  ];

  // 기본 패키지 매핑
  const defaultExtraModules = {
    '@cargoro/analytics': path.resolve(workspaceRoot, 'packages/analytics'),
    '@cargoro/api-client': path.resolve(workspaceRoot, 'packages/api-client'),
    '@cargoro/auth': path.resolve(workspaceRoot, 'packages/auth'),
    '@cargoro/ui': path.resolve(workspaceRoot, 'packages/ui'),
    '@cargoro/utils': path.resolve(workspaceRoot, 'packages/utils'),
    '@cargoro/realtime': path.resolve(workspaceRoot, 'packages/realtime'),
    '@cargoro/reporting': path.resolve(workspaceRoot, 'packages/reporting'),
    '@cargoro/gps-obd-lib': path.resolve(workspaceRoot, 'packages/gps-obd-lib'),
    react: path.resolve(projectRoot, 'node_modules/react'),
    'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
    expo: path.resolve(projectRoot, 'node_modules/expo'),
  };

  // 패키지 매핑 결합
  config.resolver.extraNodeModules = {
    ...defaultExtraModules,
    ...additionalExtraModules,
  };

  // 모듈 캐시 재설정 (필요한 경우 활성화)
  // config.resetCache = true;

  return config;
}

module.exports = { createMetroConfig };
