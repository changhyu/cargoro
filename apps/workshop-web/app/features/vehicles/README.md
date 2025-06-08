# 차량 관리 모듈

차량 관리 모듈은 정비소 웹 애플리케이션의 차량 정보 관리 기능을 제공합니다.

## 주요 기능

- 차량 목록 조회 및 필터링
- 차량 상세 정보 조회
- 차량 정보 추가/수정/삭제
- 차량 상태 관리 (정상, 정비중, 비활성)

## API 훅 (React Query v5)

이 모듈은 React Query v5를 사용하여 API 통신을 구현합니다.

### 주요 API 훅 목록

- `useGetVehicles()`: 차량 목록 조회
- `useGetVehicleById(id)`: 특정 차량 상세 정보 조회
- `useUpdateVehicle()`: 차량 정보 업데이트
- `useCreateVehicle()`: 새 차량 등록
- `useDeleteVehicle()`: 차량 삭제

## React Query v5 마이그레이션 가이드

React Query v5로 업그레이드 시 주요 변경사항과 대응 방법에 대한 가이드입니다.

### 주요 변경 사항

1. **쿼리 함수 선언 방식 변경**

   - 이전: `useQuery(queryKey, queryFn, options)`
   - 이후: `useQuery({ queryKey, queryFn, ...options })`

2. **상태 속성 이름 변경**

   - `isIdle`: 제거됨
   - `isLoading`: 유지됨 (초기 로딩 상태)
   - `isFetching`: 유지됨 (백그라운드 로딩 포함)
   - 뮤테이션의 `isLoading`이 `isPending`으로 변경됨

3. **캐시 속성 이름 변경**

   - `cacheTime` → `gcTime` (가비지 컬렉션 시간)

4. **쿼리 무효화 및 관리**

   - `invalidateQueries`: `{ queryKey: [...] }` 형태로 사용
   - `removeQueries`: `{ queryKey: [...] }` 형태로 사용

5. **타입 변경**
   - `UseMutationResult` 타입 구조 변경
   - 제네릭 타입 인자 순서 변경

### 코드 예시

**이전 (v4):**

```tsx
const { data, isLoading, error } = useQuery(['vehicles', filters], fetchVehicles, {
  staleTime: 5000,
});

const mutation = useMutation(updateVehicle, {
  onSuccess: () => {
    queryClient.invalidateQueries(['vehicles']);
  },
});
```

**이후 (v5):**

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['vehicles', filters],
  queryFn: fetchVehicles,
  staleTime: 5000,
});

const mutation = useMutation({
  mutationFn: updateVehicle,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  },
});
```

## 테스트 전략

React Query v5로 마이그레이션 시 테스트 코드 유지 관리 전략입니다.

### 기본 원칙

1. **최소한의 구조 테스트**

   - 기본적인 훅의 구조만 검증하여 마이그레이션 시 테스트 깨짐 방지
   - 예: 훅이 반환하는 속성이 존재하는지만 확인

2. **상태 변화 테스트 분리**

   - 복잡한 상태 변화 테스트는 컴포넌트 통합 테스트로 이동
   - `waitFor`를 사용한 비동기 테스트 보다는 실제 UI 렌더링 테스트로 검증

3. **모킹 전략**
   - axios 등 네트워크 요청은 모킹
   - QueryClient는 각 테스트마다 새로 생성하여 독립성 유지

### 예제 코드

기본적인 API 훅 테스트 예제는 `__tests__/vehicle-api.test.tsx`를 참고하세요.

## 컴포넌트 구조

- `/components`: UI 컴포넌트
- `/hooks`: API 훅 및 커스텀 훅
- `/types`: 타입 정의
- `/__tests__`: 테스트 코드

## 관련 문서

- [React Query v5 공식 마이그레이션 가이드](https://tanstack.com/query/v5/docs/react/guides/migrating-to-v5)
- [React Query v5 API 레퍼런스](https://tanstack.com/query/v5/docs/react/reference/useQuery)
