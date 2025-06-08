# CarGoro 플랫폼 테스트 가이드라인

이 문서는 CarGoro 플랫폼의 코드 품질과 안정성을 보장하기 위한 테스트 가이드라인을 제공합니다.

## 목차

1. [테스트 유형](#테스트-유형)
2. [테스트 구조](#테스트-구조)
3. [테스트 커버리지 목표](#테스트-커버리지-목표)
4. [모킹 및 스텁 가이드라인](#모킹-및-스텁-가이드라인)
5. [모범 사례](#모범-사례)

## 테스트 유형

### 단위 테스트

- **목적**: 개별 함수, 컴포넌트 또는 모듈의 기능을 검증
- **도구**: Vitest, Testing Library
- **대상**: 모든 패키지와 앱의 개별 기능 단위
- **예시 위치**: `/packages/ui/components/Button.test.tsx`

### 통합 테스트

- **목적**: 다양한 컴포넌트와 서비스 간의 상호작용 검증
- **도구**: Vitest, Testing Library, MSW(Mock Service Worker)
- **대상**: API 호출을 포함한 복잡한 컴포넌트 및 페이지
- **예시 위치**: `/apps/workshop-web/tests/integration/job-creation.test.tsx`

### 스냅샷 테스트

- **목적**: UI 컴포넌트의 렌더링 일관성 검증
- **도구**: Vitest, Testing Library
- **대상**: UI 컴포넌트
- **예시 위치**: `/packages/ui/components/Button.test.tsx` (스냅샷 테스트 섹션)

### E2E 테스트

- **목적**: 애플리케이션의 전체 흐름과 사용자 경로를 검증
- **도구**: Playwright
- **대상**: 주요 사용자 시나리오
- **예시 위치**: `/apps/workshop-web/e2e/workshop-flow.spec.ts`

## 테스트 구조

테스트는 다음과 같은 구조를 따릅니다:

```typescript
describe('[컴포넌트/기능 이름]', () => {
  // 테스트 설정
  beforeEach(() => {
    // 테스트 전 설정
  });

  afterEach(() => {
    // 테스트 후 정리
  });

  // 기능별로 그룹화된 테스트
  describe('[특정 기능/상태]', () => {
    it('[특정 조건에서 예상되는 결과]', () => {
      // 테스트 로직
      // 1. 준비 (Arrange)
      // 2. 실행 (Act)
      // 3. 검증 (Assert)
    });
  });
});
```

## 테스트 커버리지 목표

CarGoro 플랫폼은 다음과 같은 코드 커버리지 목표를 설정합니다:

| 항목   | 최소 목표 | 권장 목표 |
| ------ | --------- | --------- |
| 라인   | 70%       | 85%       |
| 함수   | 70%       | 90%       |
| 브랜치 | 60%       | 80%       |
| 구문   | 70%       | 85%       |

### 패키지별 커버리지 목표

| 패키지             | 라인 | 함수 | 브랜치 | 구문 |
| ------------------ | ---- | ---- | ------ | ---- |
| UI                 | 80%  | 80%  | 70%    | 80%  |
| API 클라이언트     | 75%  | 75%  | 65%    | 75%  |
| 인증               | 80%  | 80%  | 70%    | 80%  |
| GPS-OBD 라이브러리 | 75%  | 75%  | 65%    | 75%  |

## 모킹 및 스텁 가이드라인

### API 호출 모킹

- MSW(Mock Service Worker)를 사용하여 API 엔드포인트 모킹
- API 클라이언트의 모킹 기능 활용
- 테스트 데이터는 `/packages/test-utils/app/mocks` 에 정의

### 외부 서비스 모킹

- 자체 모킹 모듈 생성 (예: `__mocks__/firebase.ts`)
- Vitest의 `vi.mock()` 활용
- 테스트에 필요한 응답만 모킹하여 불필요한 복잡성 방지

### 모킹 예시

```typescript
// 외부 모듈 모킹
vi.mock('@cargoro/api-client', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

// API 응답 모킹
const mockVehicle = {
  id: 'test-vehicle-id',
  make: 'Hyundai',
  model: 'Sonata',
  year: 2022,
};

const useQueryMock = vi.mocked(useQuery);
useQueryMock.mockReturnValue({
  data: mockVehicle,
  isLoading: false,
  error: null,
});
```

## 모범 사례

### 일반적인 모범 사례

1. **테스트 가능한 코드 작성**: 의존성 주입, 순수 함수, 관심사 분리 원칙 준수
2. **테스트 파일 위치**: 테스트 대상과 동일한 디렉토리에 `*.test.ts(x)` 또는 `*.spec.ts(x)` 형식으로 배치
3. **테스트 이름 명명**: 테스트가 검증하는 내용을 명확히 표현 (`it('사용자가 로그인하면 대시보드로 리디렉션된다')`)
4. **데이터 테스트 ID**: DOM 요소 선택 시 `data-testid` 속성 사용

### UI 컴포넌트 테스트

1. **사용자 관점에서 테스트**: 사용자가 보고 상호작용하는 방식으로 테스트
2. **접근성 고려**: `getByRole`, `getByLabelText` 등 접근성 친화적인 쿼리 사용
3. **스냅샷 테스트**: 컴포넌트의 모든 주요 상태(variant, size 등)에 대해 스냅샷 테스트 구현

### 비동기 코드 테스트

1. **적절한 대기**: `waitFor`, `findBy*` 등을 사용하여 비동기 작업 완료 대기
2. **타임아웃 관리**: 적절한 타임아웃 설정으로 테스트 안정성 확보
3. **로딩 상태 테스트**: 데이터 로딩 중 UI 상태도 테스트

### E2E 테스트

1. **핵심 사용자 경로 집중**: 모든 기능이 아닌 주요 사용자 경로에 집중
2. **독립적인 테스트**: 각 테스트는 독립적으로 실행 가능해야 함
3. **테스트 데이터 관리**: 테스트 데이터 설정 및 정리를 위한 헬퍼 함수 구현

## 테스트 실행 및 커버리지

### 로컬 테스트 실행

```bash
# 모든 테스트 실행
pnpm test

# 특정 앱/패키지 테스트 실행
pnpm --filter @cargoro/ui test

# 커버리지 보고서 생성
pnpm test:coverage

# 커버리지 보고서 병합
pnpm coverage:report
```

### CI/CD 통합

- PR 생성 시 자동으로 테스트 실행
- 커버리지 보고서 생성 및 임계값 미달 시 PR 차단
- PR 댓글로 커버리지 정보 표시
