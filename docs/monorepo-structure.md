# 모노레포 구조 개선 가이드

## 개요

이 문서는 CarGoro 모노레포의 구조 개선 사항과 베스트 프랙티스를 설명합니다.

## 1. 플랫폼별 코드 분리

### 패키지 구조

```
packages/
├── auth/
│   ├── index.ts          # 공통 진입점
│   ├── web.ts           # 웹 전용 코드
│   ├── mobile.tsx       # 모바일 전용 코드
│   ├── server.ts        # 서버 전용 코드
│   ├── tsconfig.json    # 기본 타입스크립트 설정
│   ├── tsconfig.web.json    # 웹 전용 타입 설정
│   └── tsconfig.mobile.json # 모바일 전용 타입 설정
```

### 타입체크 전략

- 각 패키지는 플랫폼별 tsconfig 파일 보유
- 웹과 모바일 코드를 별도로 타입체크
- CI/CD에서 각 플랫폼별로 독립적 빌드

## 2. 공통 패키지 작성 가이드

### 브라우저 API 사용 시

```typescript
// ❌ 잘못된 예
export const saveData = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

// ✅ 올바른 예
export const saveData = (key: string, value: string) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  } else {
    // React Native 또는 서버 환경 처리
    console.warn('localStorage is not available');
  }
};
```

### 플랫폼별 구현 제공

```typescript
// storage.web.ts
export const storage = {
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
};

// storage.mobile.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  get: (key: string) => AsyncStorage.getItem(key),
  set: (key: string, value: string) => AsyncStorage.setItem(key, value),
};

// storage.ts (조건부 export)
export const storage =
  typeof window !== 'undefined'
    ? require('./storage.web').storage
    : require('./storage.mobile').storage;
```

## 3. 앱별 독립성 유지

### 앱 구조

```
apps/
├── delivery-driver/
│   ├── tsconfig.json        # 앱 전용 설정
│   ├── tsconfig.app.json    # 앱 파일만 체크
│   ├── .eslintrc.json       # 앱 전용 린트 규칙
│   └── package.json         # 앱 전용 의존성
```

### 의존성 관리

- 각 앱은 필요한 패키지만 의존
- 플랫폼별 패키지는 명시적으로 분리
- peerDependencies 활용하여 버전 충돌 방지

## 4. CI/CD 파이프라인

### 병렬 처리

- 패키지 타입체크는 병렬로 실행
- 앱별 빌드는 독립적으로 진행
- 변경된 파일에 따라 선택적 빌드

### 스크립트 구조

```bash
scripts/
├── typecheck-packages.sh    # 패키지 타입체크
├── build-all.sh             # 전체 빌드
└── deploy-app.sh            # 앱별 배포
```

## 5. 개발 워크플로우

### 1. 패키지 개발

```bash
# 패키지 타입체크
cd packages/auth
pnpm run typecheck:web
pnpm run typecheck:mobile
```

### 2. 앱 개발

```bash
# 앱 전용 타입체크
cd apps/delivery-driver
pnpm run typecheck

# 앱 린트
pnpm run lint app/
```

### 3. 전체 검증

```bash
# 루트에서 전체 빌드
cd monorepo-root
./scripts/build-all.sh --with-tests
```

## 6. 트러블슈팅

### 타입 오류

1. 패키지의 플랫폼별 타입 확인
2. tsconfig 경로 설정 확인
3. 의존성 버전 호환성 확인

### 빌드 오류

1. 캐시 삭제: `pnpm clean`
2. 의존성 재설치: `pnpm install --force`
3. 플랫폼별 코드 분리 확인

## 7. 베스트 프랙티스

### 코드 공유

- 비즈니스 로직은 플랫폼 중립적으로
- UI 컴포넌트는 플랫폼별로 분리
- 유틸리티는 조건부 구현 제공

### 타입 안정성

- strict 모드 사용
- any 타입 사용 금지
- 플랫폼별 타입 정의 분리

### 성능 최적화

- 번들 크기 모니터링
- 불필요한 의존성 제거
- 플랫폼별 최적화 적용
