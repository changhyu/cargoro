# React Query v5 마이그레이션 및 테스트 가이드

## 개요

이 문서는 React Query v5로 마이그레이션 시 발생할 수 있는 테스트 코드 관련 문제와 해결 방법을 안내합니다.

## 주요 테스트 마이그레이션 이슈

React Query v5로 업그레이드 시 다음과 같은 테스트 관련 문제가 발생할 수 있습니다:

1. **초기 상태 변경**: v5에서는 초기 로딩 상태가 v4와 다르게 동작합니다.
2. **상태 속성명 변경**: 뮤테이션의 `isLoading`이 `isPending`으로 변경되었습니다.
3. **타입 변경**: `UseMutationResult` 타입 구조가 변경되었습니다.

## 테스트 코드 마이그레이션 전략

1. **기본 구조 테스트로 간소화**

   - 복잡한 상태 변화 테스트 대신 기본 구조만 확인하는 간단한 테스트로 변경
   - 훅의 주요 속성이 존재하는지 여부만 확인 (`toHaveProperty` 사용)

2. **상태 테스트는 UI 통합 테스트로 이동**

   - 로딩 상태, 에러 상태 등 복잡한 상태 변화는 UI 컴포넌트 통합 테스트에서 검증
   - React Testing Library의 `render` 함수로 실제 컴포넌트를 렌더링하여 UI 변화 테스트

3. **테스트 유틸리티 업데이트**
   - `test-utils.tsx`의 `createTestQueryClient` 함수 수정
   - `cacheTime` → `gcTime`으로 변경
   - `logger` 옵션 제거

## 예제 코드 위치

- `apps/workshop-web/app/features/vehicles/__tests__/vehicle-api.test.tsx`: API 훅 기본 테스트 예제
- `apps/workshop-web/app/features/vehicles/README.md`: 마이그레이션 상세 가이드

## 유의사항

1. 기존 상세 테스트가 모두 실패할 수 있으니 단계적으로 마이그레이션
2. 먼저 기본 구조 테스트로 간소화 후, 필요에 따라 상세 테스트 추가
3. `waitFor` 사용 시 실제 API 호출이 발생하는지 항상 확인
4. QueryClient 설정 시 `retry: false`와 `gcTime: 0` 설정으로 예측 가능한 테스트 환경 구성

---

작성자: 차량 관리 모듈 개발팀
최종 업데이트: 2025.05.29
