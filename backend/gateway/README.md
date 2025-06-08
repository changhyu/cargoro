# GraphQL Gateway

CarGoro 플랫폼의 마이크로서비스를 통합하는 GraphQL API Gateway입니다.

## 개요

GraphQL Gateway는 다음과 같은 기능을 제공합니다:

- 여러 마이크로서비스를 하나의 GraphQL 엔드포인트로 통합
- 인증 토큰 전파
- 요청 라우팅 및 집계
- 스키마 통합 및 관리

## 기술 스택

- **프레임워크**: FastAPI + Strawberry GraphQL
- **HTTP 클라이언트**: aiohttp
- **인증**: Bearer Token 전파

## GraphQL 스키마

### Types

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  phoneNumber: String
  role: String!
  organizationId: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Workshop {
  id: ID!
  name: String!
  address: String!
  phone: String!
  businessNumber: String!
  description: String
  specialties: [String!]!
  operatingHours: String!
  capacity: Int!
  isActive: Boolean!
  rating: Float!
  reviewCount: Int!
  completedRepairs: Int!
  ownerId: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type RepairRequest {
  id: ID!
  requestNumber: String!
  vehicleId: String!
  customerId: String!
  workshopId: String
  technicianId: String
  description: String!
  urgency: String!
  status: String!
  preferredDate: DateTime
  scheduledDate: DateTime
  completedDate: DateTime
  estimatedDuration: Int
  actualDuration: Int
  symptoms: [String!]!
  diagnosis: String
  repairNotes: String
  totalCost: Float
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Queries

```graphql
type Query {
  # 사용자 관련
  me: User
  user(id: ID!): User
  users(page: Int = 1, pageSize: Int = 20, role: String): [User!]!

  # 정비소 관련
  workshop(id: ID!): Workshop
  workshops(
    page: Int = 1
    pageSize: Int = 20
    keyword: String
    specialty: String
    minRating: Float
  ): [Workshop!]!

  # 정비 요청 관련
  repairRequest(id: ID!): RepairRequest
  repairRequests(
    page: Int = 1
    pageSize: Int = 20
    status: String
    urgency: String
  ): [RepairRequest!]!
}
```

### Mutations

```graphql
type Mutation {
  # 인증 관련
  register(
    email: String!
    password: String!
    name: String!
    phoneNumber: String
    organizationName: String
  ): AuthResponse!

  login(email: String!, password: String!): AuthResponse!
  refreshToken(refreshToken: String!): AuthResponse!

  # 정비 요청 관련
  createRepairRequest(
    vehicleId: String!
    description: String!
    urgency: String = "NORMAL"
    preferredDate: DateTime
    symptoms: [String!] = []
  ): RepairRequest!

  updateRepairRequest(
    id: ID!
    status: String
    workshopId: String
    technicianId: String
    diagnosis: String
    repairNotes: String
    totalCost: Float
  ): RepairRequest!

  # 정비소 관련
  createWorkshop(
    name: String!
    address: String!
    phone: String!
    businessNumber: String!
    description: String
    specialties: [String!] = []
    capacity: Int = 10
  ): Workshop!
}
```

## 설치 및 실행

### 개발 환경

1. 가상환경 생성 및 활성화:

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. 의존성 설치:

```bash
pip install -r requirements.txt
```

3. 환경 변수 설정:

```bash
cp .env.example .env
# .env 파일 편집하여 필요한 값 설정
```

4. 서버 실행:

```bash
python main.py
# 또는
uvicorn main:app --reload --port 8000
```

### Docker 실행

```bash
docker build -t cargoro-gateway .
docker run -p 8000:8000 --env-file .env cargoro-gateway
```

## GraphQL Playground

서버 실행 후 http://localhost:8000/graphql 에서 GraphQL Playground를 사용할 수 있습니다.

### 예제 쿼리

#### 로그인

```graphql
mutation {
  login(email: "user@example.com", password: "password") {
    accessToken
    refreshToken
    tokenType
    user {
      id
      email
      name
      role
    }
  }
}
```

#### 정비소 검색

```graphql
query {
  workshops(keyword: "서울", minRating: 4.0) {
    id
    name
    address
    rating
    reviewCount
    specialties
  }
}
```

#### 정비 요청 생성

```graphql
mutation {
  createRepairRequest(
    vehicleId: "vehicle-123"
    description: "엔진 이상음 발생"
    urgency: "HIGH"
    symptoms: ["시동시 소음", "가속시 진동"]
  ) {
    id
    requestNumber
    status
    urgency
  }
}
```

## 환경 변수

| 변수명             | 설명                    | 기본값                   |
| ------------------ | ----------------------- | ------------------------ |
| `ENV`              | 실행 환경               | development              |
| `DEBUG`            | 디버그 모드             | False                    |
| `ALLOWED_ORIGINS`  | CORS 허용 도메인        | http://localhost:3000    |
| `CORE_API_URL`     | Core API 서비스 URL     | http://core-api:8001     |
| `REPAIR_API_URL`   | Repair API 서비스 URL   | http://repair-api:8002   |
| `PARTS_API_URL`    | Parts API 서비스 URL    | http://parts-api:8003    |
| `DELIVERY_API_URL` | Delivery API 서비스 URL | http://delivery-api:8004 |
| `FLEET_API_URL`    | Fleet API 서비스 URL    | http://fleet-api:8005    |

## 아키텍처

```
┌─────────────┐     ┌──────────────┐
│   Client    │────▶│   Gateway    │
└─────────────┘     └──────┬───────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
   ┌────▼────┐  ┌─────▼─────┐  ┌──────▼──────┐
   │Core API │  │Repair API │  │ Parts API   │
   └─────────┘  └───────────┘  └─────────────┘
```

## 인증 플로우

1. 클라이언트가 Gateway의 `login` mutation 호출
2. Gateway가 Core API의 로그인 엔드포인트 호출
3. Core API가 JWT 토큰 반환
4. Gateway가 토큰을 클라이언트에 전달
5. 이후 요청시 Authorization 헤더에 토큰 포함
6. Gateway가 각 마이크로서비스로 토큰 전파

## 문제 해결

### 서비스 연결 오류

- 각 마이크로서비스의 URL 환경 변수 확인
- Docker 네트워크 설정 확인
- 서비스 헬스 체크 엔드포인트 확인

### GraphQL 스키마 오류

- 타입 정의 확인
- 리졸버 함수 매핑 확인
- Strawberry GraphQL 버전 호환성 확인

### 인증 오류

- 토큰 형식 확인 (Bearer 접두사)
- 토큰 만료 시간 확인
- Core API 서비스 상태 확인
