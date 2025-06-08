# @cargoro/ui

Cargoro 플랫폼용 UI 컴포넌트 라이브러리입니다.

## 주요 의존성

- react: 18.2.0
- react-dom: 18.2.0
- tailwindcss, radix-ui, lucide-react 등

## 테스트 환경

- [Vitest](https://vitest.dev/) (unit test)
- [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)
- [@testing-library/jest-dom](https://github.com/testing-library/jest-dom)
- [jsdom](https://github.com/jsdom/jsdom)

### 실행 방법

```bash
# dev 빌드
pnpm --filter "ui" dev

# 테스트 실행
pnpm --filter "ui" test

# 커버리지 리포트
pnpm --filter "ui" coverage
```

---

React 18.2.0, ReactDOM 18.2.0 버전에 최적화되어 있습니다. 의존성 업데이트 시 반드시 호환성 확인 바랍니다.
