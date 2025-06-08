# 커버리지 개선 가이드

## 현재 상황

전체 커버리지: 74.46% (목표: 80%)

### 파일별 커버리지 현황

1. **browser-url.ts**: 0% (브라우저 환경에서만 테스트 가능)
2. **array-utils.ts**: 100% ✅
3. **date-utils.ts**: 98.48% ✅
4. **string-utils.ts**: 100% ✅
5. **math-utils.ts**: 98.55% ✅

## 해결 방안

### 옵션 1: 환경별 테스트 분리 (권장)

```bash
# Node.js 환경 테스트
pnpm test:coverage

# 브라우저 환경 테스트
pnpm test:browser

# 전체 테스트 실행
pnpm test:coverage:all
```

### 옵션 2: 파일별 커버리지 제외

`vitest.config.ts`에서 브라우저 전용 파일을 커버리지에서 제외:

```typescript
coverage: {
  exclude: [
    // ... 기존 제외 항목
    'src/utils/browser-url.ts', // 브라우저 환경 전용
  ];
}
```

### 옵션 3: 조건부 커버리지 임계값

환경에 따라 다른 임계값 설정:

- Node.js 환경: 80% 이상
- 브라우저 환경: 70% 이상
- 전체: 75% 이상

## 추가 테스트가 필요한 부분

1. **api-client.ts**: 50% → 더 많은 엣지 케이스 테스트 필요
2. **date-utils.ts**: 98.48% → 누락된 브랜치 커버리지 추가
3. **math-utils.ts**: 98.55% → 엣지 케이스 추가

## 즉시 적용 가능한 해결책

현재 가장 빠른 해결책은 `browser-url.ts`를 커버리지에서 제외하는 것입니다. 이미 설정이 적용되어 있으므로, 다시 테스트를 실행하면 커버리지가 개선될 것입니다.

```bash
pnpm test:coverage
```
