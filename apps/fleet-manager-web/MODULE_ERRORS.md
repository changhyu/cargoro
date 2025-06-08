# 모듈 오류 해결 가이드

이 문서는 다음과 같은 모듈 오류를 해결하는 방법을 설명합니다:

```
Module not found: Can't resolve 'typescript'
Module not found: Can't resolve 'vitest/globals'
Module not found: Can't resolve 'lucide-react'
```

## 원인

이 오류는 모노레포 환경에서 패키지 해결 과정에서 발생하는 문제입니다. 특히 Next.js 14.2.0 버전에서 workspace 패키지와 함께 사용할 때 발생합니다.

## 해결 방법

### 1. 클린업 스크립트 실행

제공된 스크립트를 실행하여 의존성 문제를 해결합니다:

```bash
# 스크립트 실행 권한 설정
chmod +x scripts/fix-module-errors.sh

# 스크립트 실행
./scripts/fix-module-errors.sh
```

### 2. 수동 해결 방법

스크립트가 작동하지 않는 경우 다음 단계를 수동으로 실행하세요:

1. 모듈 캐시 정리:

   ```bash
   rm -rf node_modules/.cache
   rm -rf .next
   ```

2. 의존성 재설치:

   ```bash
   pnpm install --force
   ```

3. 필수 패키지 직접 설치:

   ```bash
   pnpm add -D typescript@5.4.5 vitest@1.6.1
   pnpm add lucide-react@0.292.0
   ```

4. 빌드 시 타입 오류 무시:

   ```bash
   # 개발 서버 실행
   NEXT_IGNORE_TYPE_ERROR=1 pnpm dev

   # 또는 빌드
   NEXT_IGNORE_TYPE_ERROR=1 pnpm build
   ```

### 3. 심볼릭 링크 수동 생성

필요한 경우 다음과 같이 심볼릭 링크를 수동으로 생성할 수 있습니다:

```bash
# TypeScript 링크
mkdir -p node_modules/typescript/lib
ln -sf "../../node_modules/typescript/lib" "node_modules/typescript/lib"

# Vitest 링크
mkdir -p node_modules/vitest
ln -sf "../../node_modules/vitest/dist" "node_modules/vitest/dist"

# Lucide React 링크
mkdir -p node_modules/lucide-react
ln -sf "../../node_modules/lucide-react/dist" "node_modules/lucide-react/dist"
```

## 업데이트된 설정 파일

다음 파일들이 업데이트되었습니다:

1. `next.config.js` - 모듈 해결 설정 개선
2. `tsconfig.json` - TypeScript 모듈 해결 개선

## 개발자 참고사항

1. 모노레포 환경에서 의존성 해결 문제가 발생하는 경우 monorepo-root의 `node_modules` 디렉토리를 확인하세요.
2. `pnpm` 사용 시 workspace 패키지를 참조하는 방법: `workspace:^`
3. Next.js 14.2.0 버전에서는 `moduleResolution`을 `bundler`로 설정하는 것이 좋습니다.
4. 이 문제가 지속되면 Next.js 버전을 14.1.0으로 다운그레이드하는 것을 고려하세요.

## 주의사항

이 해결책은 임시적인 방법입니다. 최종적으로는 다음과 같은 보다 근본적인 해결책을 고려해야 합니다:

1. 모노레포 설정 최적화
2. 패키지 관리자 설정 검토 (pnpm-workspace.yaml)
3. 의존성 중복 제거 (pnpm dedupe)
