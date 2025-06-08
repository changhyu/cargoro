# 신규 개발자 온보딩 가이드 - 테스트 편

## 🎯 목표

이 가이드는 신규 팀원이 우리의 테스트 문화와 프로세스를 빠르게 이해하고 적용할 수 있도록 돕습니다.

## 📚 필수 학습 자료

### 1. 테스트 기초

- [ ] [테스트 전략 문서](./test-strategy.md) 읽기
- [ ] TDD 개념 이해하기
- [ ] 테스트 피라미드 이해하기

### 2. 도구 학습

- [ ] Vitest 기본 사용법
- [ ] Testing Library 패턴
- [ ] MSW를 사용한 API 모킹

## 🚀 첫 주 체크리스트

### Day 1: 환경 설정

```bash
# 프로젝트 클론
git clone <repository-url>
cd monorepo-root

# 의존성 설치
pnpm install

# 테스트 실행 확인
pnpm test
pnpm test:coverage
```

### Day 2: 기존 테스트 분석

1. `tests/unit` 디렉토리의 테스트 파일 5개 읽기
2. 테스트 구조와 패턴 파악
3. 커버리지 리포트 확인

### Day 3: 첫 테스트 작성

1. 간단한 유틸리티 함수 선택
2. TDD 방식으로 새 기능 추가
   - 실패하는 테스트 작성
   - 테스트 통과하는 코드 작성
   - 리팩토링

### Day 4: PR 프로세스

1. 브랜치 생성: `feat/your-first-test`
2. 커밋 메시지 규칙 따르기
3. PR 생성 및 리뷰 요청

### Day 5: 통합 테스트

1. API 통합 테스트 작성
2. MSW 핸들러 추가
3. 비동기 테스트 패턴 연습

## 💡 팁과 트릭

### 테스트 작성 시 주의사항

```typescript
// ❌ 피해야 할 패턴
it('works', () => {
  const result = calculate(2, 2);
  expect(result).toBe(4);
});

// ✅ 권장 패턴
it('두 숫자를 더해 올바른 결과를 반환해야 함', () => {
  // Arrange
  const num1 = 2;
  const num2 = 2;
  const expected = 4;

  // Act
  const result = calculate(num1, num2);

  // Assert
  expect(result).toBe(expected);
});
```

### 디버깅 팁

```bash
# 특정 테스트만 실행
pnpm test math-utils

# 테스트 감시 모드
pnpm test:watch

# UI로 테스트 확인
pnpm test:ui
```

### VS Code 확장 프로그램

- Vitest Extension
- Test Explorer UI
- Coverage Gutters

## 📋 체크리스트

### 테스트 작성 전

- [ ] 요구사항을 명확히 이해했는가?
- [ ] 엣지 케이스를 고려했는가?
- [ ] 테스트 시나리오를 작성했는가?

### 테스트 작성 중

- [ ] AAA 패턴을 따르고 있는가?
- [ ] 한 테스트는 하나만 검증하는가?
- [ ] 테스트가 독립적인가?

### 테스트 작성 후

- [ ] 커버리지가 80% 이상인가?
- [ ] 모든 브랜치가 테스트되었는가?
- [ ] 테스트가 빠르게 실행되는가?

## 🆘 도움 받기

### 문서

- [Vitest 공식 문서](https://vitest.dev)
- [Testing Library 문서](https://testing-library.com)
- [MSW 문서](https://mswjs.io)

### 팀 내 전문가

- 단위 테스트: @팀원1
- 통합 테스트: @팀원2
- E2E 테스트: @팀원3

### 슬랙 채널

- #dev-testing
- #help-testing

## 🎓 심화 학습

### 2주차

- 컴포넌트 테스트
- 커스텀 훅 테스트
- 스냅샷 테스트

### 3주차

- E2E 테스트 작성
- 성능 테스트
- 시각적 회귀 테스트

### 4주차

- 테스트 리팩토링
- 테스트 성능 최적화
- CI/CD 파이프라인 이해

## 📈 성장 지표

### Junior (0-3개월)

- [ ] 단위 테스트 50개 이상 작성
- [ ] 커버리지 80% 유지
- [ ] PR 리뷰 참여

### Mid-level (3-6개월)

- [ ] 통합 테스트 설계
- [ ] 테스트 전략 개선 제안
- [ ] 신규 팀원 멘토링

### Senior (6개월+)

- [ ] 테스트 아키텍처 설계
- [ ] 테스트 자동화 도구 개발
- [ ] 팀 테스트 문화 리드
