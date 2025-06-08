# 모노레포 테스트 가이드

이 디렉토리는 모노레포 루트 레벨의 테스트를 포함합니다.

## 📁 디렉토리 구조

```
tests/
├── unit/              # 단위 테스트
├── integration/       # 통합 테스트
├── helpers/          # 테스트 헬퍼 유틸리티
│   ├── render.tsx    # React 컴포넌트 렌더링 헬퍼
│   └── mocks.ts      # 공통 모킹 유틸리티
├── setup.ts          # 기본 테스트 설정
├── setup.react.ts    # React 테스트 설정
├── setup.node.ts     # Node.js 테스트 설정
└── README.md         # 이 파일
```

## 🚀 테스트 실행 방법

### 모든 테스트 실행

```bash
pnpm test
```

### 단위 테스트만 실행

```bash
pnpm test:unit
```

### 통합 테스트만 실행

```bash
pnpm test:integration
```

### Watch 모드로 실행

```bash
pnpm test:watch
```

### 커버리지 확인

```bash
pnpm test:coverage
```

### UI 모드로 실행

```bash
pnpm test:ui
```

### 워크스페이스 전체 테스트

```bash
pnpm test:all
```

## 📝 테스트 작성 가이드

### 1. 단위 테스트 (Unit Tests)

단위 테스트는 개별 함수나 컴포넌트의 독립적인 동작을 검증합니다.

```typescript
// tests/unit/example.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '../src/myFunction';

describe('myFunction', () => {
  it('올바른 결과를 반환해야 함', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### 2. 통합 테스트 (Integration Tests)

통합 테스트는 여러 모듈이 함께 작동하는 것을 검증합니다.

```typescript
// tests/integration/api.test.ts
import { describe, it, expect } from 'vitest';
import { apiClient } from '../src/apiClient';

describe('API 통합 테스트', () => {
  it('API 엔드포인트가 올바르게 응답해야 함', async () => {
    const response = await apiClient.get('/users');
    expect(response.status).toBe(200);
  });
});
```

### 3. React 컴포넌트 테스트

React 컴포넌트 테스트는 커스텀 렌더링 헬퍼를 사용합니다.

```typescript
// tests/unit/Button.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../helpers/render'
import { Button } from '@cargoro/ui/components/Button'

describe('Button 컴포넌트', () => {
  it('클릭 이벤트가 동작해야 함', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>클릭</Button>)

    fireEvent.click(screen.getByText('클릭'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## 🔧 테스트 헬퍼

### render 헬퍼

모든 필요한 Provider를 포함한 커스텀 render 함수:

```typescript
import { render } from '../helpers/render'

// 기본 사용
render(<MyComponent />)

// 옵션과 함께 사용
render(<MyComponent />, {
  initialRouterEntry: '/dashboard'
})
```

### 모킹 헬퍼

자주 사용되는 모킹 유틸리티:

```typescript
import { mockRouter, mockUser, createMockResponse, mockLocalStorage } from '../helpers/mocks';

// Next.js 라우터 모킹
vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// API 응답 모킹
global.fetch = vi.fn(() => Promise.resolve(createMockResponse({ data: 'test' })));
```

## ⚙️ 설정 파일

### vitest.config.ts

- 루트 레벨 Vitest 설정
- 공통 설정은 `vitest.config.shared.ts`에서 import

### vitest.workspace.ts

- 워크스페이스 전체 테스트 설정
- 각 프로젝트별 테스트 구성 정의

### tsconfig.json

- Vitest 글로벌 타입 포함
- `@testing-library/jest-dom` 타입 포함

## 🎯 베스트 프랙티스

1. **테스트 격리**: 각 테스트는 독립적으로 실행 가능해야 함
2. **명확한 테스트 이름**: 한글로 무엇을 테스트하는지 명확히 작성
3. **AAA 패턴**: Arrange(준비) - Act(실행) - Assert(검증) 패턴 사용
4. **모킹 최소화**: 꼭 필요한 경우에만 모킹 사용
5. **테스트 커버리지**: 80% 이상 유지 목표

## 🐛 디버깅

### 특정 테스트만 실행

```typescript
it.only('이 테스트만 실행', () => {
  // ...
});
```

### 테스트 스킵

```typescript
it.skip('이 테스트는 스킵', () => {
  // ...
});
```

### 디버깅 출력

```typescript
it('디버깅이 필요한 테스트', () => {
  console.log('디버깅 정보');
  // screen.debug() // React Testing Library
});
```

## 📊 커버리지 리포트

커버리지 리포트는 다음 위치에 생성됩니다:

- HTML 리포트: `coverage/index.html`
- JSON 리포트: `coverage/coverage-final.json`
- LCOV 리포트: `coverage/lcov.info`

## 🔗 관련 문서

- [Vitest 공식 문서](https://vitest.dev)
- [Testing Library 문서](https://testing-library.com)
- [MSW 문서](https://mswjs.io)
