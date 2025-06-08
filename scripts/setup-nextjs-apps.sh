#!/bin/bash

# Next.js 앱의 모듈 경로 설정 스크립트
MONOREPO_ROOT="$(pwd)"

echo "🔧 Next.js 앱 설정 스크립트 시작..."
echo "📂 모노레포 루트: $MONOREPO_ROOT"

# 모든 Next.js 앱에 대해 설정 파일 생성
for app_dir in $MONOREPO_ROOT/apps/*-web/; do
  if [ -d "$app_dir" ]; then
    app_name=$(basename "$app_dir")
    
    echo "⚙️ $app_name 앱 설정 중..."
    
    # module-paths.js 파일 생성
    MODULE_PATHS_FILE="$app_dir/module-paths.js"
    
    cat > "$MODULE_PATHS_FILE" << EOF
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
  'typescript': path.resolve(monorepoRoot, 'node_modules/typescript'),
  'vitest': path.resolve(monorepoRoot, 'node_modules/vitest'),
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
EOF
    
    echo "✅ $app_name 모듈 경로 설정 파일 생성 완료"

    # next.config.js 확인 및 업데이트
    NEXT_CONFIG_FILE="$app_dir/next.config.js"
    
    if grep -q "lucide-react" "$NEXT_CONFIG_FILE"; then
      echo "✅ $app_name lucide-react 설정 확인 완료"
    else
      echo "🔄 $app_name next.config.js 업데이트 중..."
      # 여기서는 실제로 파일을 변경하지 않고 안내만 제공
      echo "⚠️ $app_name next.config.js 파일에 'lucide-react' 설정을 확인하세요."
      echo "  - transpilePackages 배열에 'lucide-react'를 추가하세요."
      echo "  - webpack 설정에서 'lucide-react' 모듈 경로를 설정하세요."
      echo "  - module-paths.js 파일을 사용하도록 설정하세요."
    fi
  fi
done

echo "✨ 모든 Next.js 앱 설정 완료!"
