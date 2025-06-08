# CarGoro API Client

이 패키지는 CarGoro 백엔드 API와 통신하기 위한 타입스크립트 클라이언트를 제공합니다.

## 주요 기능

- React Query 기반 API 클라이언트
- 타입 안전성을 위한 Zod 스키마 통합
- 다양한 API 엔드포인트에 대한 훅 제공

## 사용 방법

```tsx
import { useVehicles, useVehicle } from '@cargoro/api-client/hooks/useVehicleApi';

// 차량 목록 조회
const VehicleList = () => {
  const { data, isLoading, isError } = useVehicles();

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>오류 발생</div>;

  return (
    <ul>
      {data?.map(vehicle => (
        <li key={vehicle.id}>
          {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
        </li>
      ))}
    </ul>
  );
};

// 단일 차량 조회
const VehicleDetail = ({ id }) => {
  const { data, isLoading, isError } = useVehicle(id);

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>오류 발생</div>;

  return (
    <div>
      <h2>
        {data.make} {data.model}
      </h2>
      <p>번호판: {data.licensePlate}</p>
      <p>연식: {data.year}</p>
      <p>주행거리: {data.mileage}km</p>
    </div>
  );
};
```

## 모듈 구조

- `core/`: API 클라이언트 코어 기능
  - `api-client.ts`: 기본 API 클라이언트 클래스
  - `vehicle-api.ts`: 차량 관련 API 기능
  - `contract-api.ts`: 계약 관련 API 기능
- `hooks/`: React Query 기반 훅
  - `useVehicleApi.ts`: 차량 관련 훅
  - `useContractApi.ts`: 계약 관련 훅
- `utils/`: 유틸리티 함수
  - `api-error.ts`: 에러 처리 유틸리티

## 중요 변경 사항

- v0.2.0: @cargoro/types 패키지의 타입 사용으로 타입 중복 해결
- v0.1.0: 초기 릴리스

## 타입 참조

이 패키지는 `@cargoro/types` 패키지에서 정의된 타입을 사용합니다. API 응답 및 요청 본문에 대한 타입 정의는 해당 패키지를 참조하세요.

## 설치

```bash
pnpm add @cargoro/api-client
```

## 사용 예시

### REST API 사용

```tsx
// 클라이언트 직접 사용
import { api-client } from '@cargoro/api-client/core';

const api-client = new api-client({
  baseURL: 'https://api.example.com',
});

// GET 요청
const data = await api-client.get('/users');

// POST 요청
const newUser = await api-client.post('/users', { name: '홍길동' });
```

### React Query 훅 사용

```tsx
import { useQuery, useQueryById, usePost } from '@cargoro/api-client/hooks';

// 컴포넌트 내부
function UserList() {
  // 목록 조회
  const { data, isLoading } = useQuery('/users');

  // ID로 조회
  const { data: user } = useQueryById('/users', userId);

  // 생성 mutation
  const { mutate, isSuccess } = usePost('/users');

  const handleCreate = () => {
    mutate({ name: '새 사용자' });
  };

  return (/* JSX 코드 */);
}
```

### GraphQL 사용

```tsx
import { useGraphQLQuery, useGraphQLMutation } from '@cargoro/api-client/hooks';

const GET_USERS = `
  query GetUsers {
    users {
      id
      name
    }
  }
`;

function UserList() {
  const { data } = useGraphQLQuery(GET_USERS);

  return (/* JSX 코드 */);
}
```

## 구조

```
packages/api-client/
├── core/                       # 핵심 클라이언트 모듈
│   ├── api-client.ts           # REST API 클라이언트 (Axios)
│   └── graphql-client.ts       # GraphQL 클라이언트
├── hooks/                      # React Query 기반 훅
│   ├── use-query.ts            # GET 요청용 훅
│   ├── use-mutation.ts         # POST/PUT/DELETE 등 요청용 훅
│   └── use-graphql.ts          # GraphQL 요청용 훅
└── index.ts                    # 주요 기능 export
```

## 테스트

```bash
# 단위 테스트 실행
pnpm --filter "api-client" test

# 커버리지 리포트
pnpm --filter "api-client" coverage
```

React 18.2.0, React Query v5 기반으로 테스트되었습니다.

---

## 기여하기

버그 신고 및 기능 요청은 GitHub 이슈로 제출해 주세요.
