/**
 * 정확한 모듈 경로를 지정하는 설정 파일
 * next.config.js에서 사용됨
 */
const path = require('path');

// 프로젝트 경로 설정
const projectRoot = path.resolve(__dirname);
const monorepoRoot = path.resolve(projectRoot, '../../');

// 모듈 경로 정의
module.exports = {
  // 핵심 의존성
  typescript: path.resolve(monorepoRoot, 'node_modules/typescript'),
  vitest: path.resolve(monorepoRoot, 'node_modules/vitest'),
  'vitest/globals': path.resolve(monorepoRoot, 'node_modules/vitest/dist/index.js'),
  'lucide-react': path.resolve(monorepoRoot, 'node_modules/lucide-react'),
  'date-fns': path.resolve(monorepoRoot, 'node_modules/date-fns'),
  'date-fns/locale': path.resolve(monorepoRoot, 'node_modules/date-fns/locale'),

  // 내부 패키지
  '@cargoro/ui': path.resolve(monorepoRoot, 'packages/ui'),
  '@cargoro/auth': path.resolve(monorepoRoot, 'packages/auth'),
  '@cargoro/api-client': path.resolve(monorepoRoot, 'packages/api-client'),
  '@cargoro/analytics': path.resolve(monorepoRoot, 'packages/analytics'),
  '@cargoro/types': path.resolve(monorepoRoot, 'packages/types'),
  '@cargoro/utils': path.resolve(monorepoRoot, 'packages/utils'),
  '@cargoro/i18n': path.resolve(monorepoRoot, 'packages/i18n'),

  // UI 컴포넌트
  '@cargoro/ui/components': path.resolve(monorepoRoot, 'packages/ui/components'),
  '@cargoro/ui/utils': path.resolve(monorepoRoot, 'packages/ui/utils'),
  '@cargoro/ui/lib/utils': path.resolve(monorepoRoot, 'packages/ui/lib/utils'),
};
