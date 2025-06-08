# 모노레포 오류 해결 가이드

이 문서는 카고로(CarGoro) 모노레포 프로젝트에서 발생할 수 있는 일반적인 오류와 그 해결 방법을 설명합니다.

## 목차

1. [모듈을 찾을 수 없음 오류](#1-모듈을-찾을-수-없음-오류)
2. [TypeScript 타입 오류](#2-typescript-타입-오류)
3. [빌드 오류](#3-빌드-오류)
4. [테스트 오류](#4-테스트-오류)
5. [의존성 충돌](#5-의존성-충돌)

---

## 1. 모듈을 찾을 수 없음 오류

### 1.1 "Module not found: Can't resolve 'xxx'" 오류

#### 증상

```
Module not found: Can't resolve 'lucide-react'
Module not found: Can't resolve 'typescript'
Module not found: Can't resolve 'vitest/globals'
```

#### 해결 방법

1. 해당 패키지 설치 확인:

```bash
pnpm add xxx --filter @cargoro/[app-name]
```

2. 버전 충돌 확인 (특히 lucide-react):

```bash
# 특정 버전 설치 (lucide-react는 0.263.1 버전 권장)
pnpm add lucide-react@0.263.1 --filter @cargoro/[app-name]
```

3. 루트 의존성 확인:

```bash
pnpm add xxx -w
```

4. 심각한 경우 모든 node_modules 삭제 후 재설치:

```bash
# 스크립트 실행
./scripts/fix-dependencies.sh
```

### 1.2 내부 패키지 모듈 해결 오류

#### 증상

```
Cannot find module '@cargoro/ui' or its corresponding type declarations.
```

#### 해결 방법

1. tsconfig.json의 경로 매핑 확인:

```json
{
  "compilerOptions": {
    "paths": {
      "@cargoro/ui": ["../../packages/ui"],
      "@cargoro/ui/*": ["../../packages/ui/*"]
    }
  }
}
```

2. 패키지가 올바르게 빌드되었는지 확인:

```bash
pnpm build:packages
```

3. 종속성 그래프 확인:

```bash
pnpm turbo run build --dry=json | jq
```

## 2. TypeScript 타입 오류

### 2.1 "Cannot find name 'xxx'" 타입 오류

#### 증상

```
Cannot find name 'describe', 'it', 'expect', etc.
```

#### 해결 방법

1. tsconfig.json에 타입 정의 추가:

```json
{
  "compilerOptions": {
    "types": ["node", "vitest/globals", "@testing-library/jest-dom"]
  }
}
```

2. 테스트 설정 파일(vitest.setup.ts) 확인

3. `@types/xxx` 패키지 설치:

```bash
pnpm add -D @types/node @types/react @types/react-dom --filter @cargoro/[app-name]
```

### 2.2 "any 타입" 관련 오류

#### 증상

```
eslint: '@typescript-eslint/no-explicit-any': 'error'
```

#### 해결 방법

1. any 타입을 더 구체적인 타입으로 교체:

```typescript
// 나쁜 예
function process(data: any) { ... }

// 좋은 예
interface DataType { id: string; value: number }
function process(data: DataType) { ... }

// unknown과 타입 가드 활용
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'id' in data) {
    // data를 안전하게 처리
  }
}
```

2. 타입 정의 참조:

```typescript
// packages/types/examples/no-any-examples.ts 파일 참조
```

## 3. 빌드 오류

### 3.1 Next.js 빌드 오류

#### 증상

```
Error occurred prerendering page "/xxx"
```

#### 해결 방법

1. 서버/클라이언트 컴포넌트 확인:

```typescript
// 클라이언트 컴포넌트에 'use client' 지시어 추가
'use client';
```

2. 빌드 캐시 제거:

```bash
rm -rf .next
```

3. 의존성 확인:

```bash
pnpm build --filter @cargoro/[app-name] --verbose
```

### 3.2 Turborepo 캐시 문제

#### 증상

```
스타일이나 기능이 업데이트되지 않음
```

#### 해결 방법

1. Turborepo 캐시 정리:

```bash
pnpm exec turbo clean
```

2. 전체 빌드 재실행:

```bash
pnpm build
```

## 4. 테스트 오류

### 4.1 Vitest 실행 오류

#### 증상

```
Cannot find module 'vitest/globals'
```

#### 해결 방법

1. vitest 종속성 설치:

```bash
pnpm add -D vitest @vitest/globals --filter @cargoro/[app-name]
```

2. vitest 구성 확인:

```bash
# vitest.config.ts 확인
```

3. 테스트 파일 명명 규칙 준수:

```
component-name.test.tsx  # 단위 테스트
feature-name.integration.test.ts  # 통합 테스트
```

## 5. 의존성 충돌

### 5.1 버전 충돌

#### 증상

```
Conflicting peer dependency: xxx@x.y.z
```

#### 해결 방법

1. package.json의 peerDependencies 확인

2. pnpm의 overrides 사용:

```json
"pnpm": {
  "overrides": {
    "react": "18.2.0",
    "lucide-react": "0.263.1"
  }
}
```

3. 의존성 중복 제거:

```bash
pnpm dedupe
```

---

## 공통 문제 해결 절차

모든 오류에 공통적으로 적용할 수 있는 단계별 문제 해결 절차:

1. **정확한 오류 메시지 확인**

   - 오류 메시지와 스택 추적 기록
   - 특정 파일, 라인, 모듈 참고

2. **의존성 확인**

   - 필요한 패키지가 설치되어 있는지 확인
   - 패키지 버전이 호환되는지 확인

3. **캐시 삭제 및 재설치**

   - `scripts/fix-dependencies.sh` 실행

4. **구성 파일 확인**

   - tsconfig.json, turbo.json, package.json 확인
   - 경로 매핑 및 설정 확인

5. **문서 참고**

   - README.md 및 문제 해결 가이드 참조
   - 관련 패키지 문서 확인

6. **도움 요청**
   - 이슈 생성: 오류 메시지, 재현 단계, 환경 정보 포함
   - 팀 채널에서 문의
