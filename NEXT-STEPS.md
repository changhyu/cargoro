# Clerk v6 마이그레이션 후속 작업

이 문서는 Clerk v6 마이그레이션 이후 수행해야 할 후속 작업들을 정리한 것입니다.

## 완료된 작업

1. ✅ 모든 앱의 package.json 파일에서 @clerk/clerk-react를 v5.31.8로, @clerk/nextjs를 v6.20.2로 업데이트
2. ✅ 루트 package.json의 pnpm.overrides에서도 동일하게 버전 업데이트
3. ✅ 모든 앱의 layout.tsx 파일에서 ClerkProvider의 dynamic 속성 제거
4. ✅ 모든 앱의 user-details.tsx 파일에 'use server' 지시문 추가
5. ✅ 모든 앱의 user-details.tsx 파일에서 auth() 함수를 비동기적으로 호출하도록 수정
6. ✅ 모든 앱의 middleware.ts 파일이 clerkMiddleware와 createRouteMatcher를 사용하도록 수정
7. ✅ packages/auth/mobile.ts 파일에서 AsyncStorage를 사용하도록 수정
8. ✅ API 클라이언트 모듈 빌드 오류 해결을 위한 webpack 설정 업데이트
9. ✅ packages/auth/mobile.ts를 mobile.tsx로 변경하고 타입 오류 해결
10. ✅ Clerk 호환성을 위한 webpack 설정 수정 (2023-05-31)
    - 모든 앱의 next.config.js 파일에서 IgnorePlugin 대신 resolve.fallback 설정 사용
    - 'next/navigation', 'next/headers', 'next/compat/router' 모듈 로딩 문제 해결

## 남은 작업

1. ⬜ analytics 패키지 테스트 코드 타입 오류 해결

   - `packages/analytics/tests/posthog.test.tsx` 파일의 타입 오류 수정

2. ⬜ 모든 앱에서 dev 모드 테스트

   - 모든 앱(workshop-web, fleet-manager-web, parts-web, superadmin-web)에서 개발 모드가 제대로 작동하는지 확인
   - webpack 설정 변경 후 앱 시작이 정상적으로 되는지 확인

3. ⬜ 전체 앱 빌드 및 배포 확인

   - 모든 앱에서 빌드 오류 해결 후 배포 확인

4. ⬜ 실제 로그인 테스트

   - 각 앱에서 로그인, 로그아웃, 세션 관리 등 인증 관련 기능이 제대로 작동하는지 확인

5. ⬜ 프로덕션 환경에서의 테스트
   - 스테이징 환경에 배포 후 실제 사용자 플로우 테스트

## 알려진 문제점

1. 일부 패키지에서 Babel 관련 경고가 발생하지만 실제 빌드 및 실행에는 영향을 주지 않음

   - `@babel/plugin-proposal-nullish-coalescing-operator`, `@babel/plugin-proposal-optional-chaining` 패키지는 이제 ECMAScript 표준이 되어 더 이상 유지되지 않음
   - 대신 `@babel/plugin-transform-nullish-coalescing-operator`, `@babel/plugin-transform-optional-chaining` 패키지를 사용하는 것이 권장됨

2. webpack 설정에서 fallback을 사용할 때 경고가 발생할 수 있으나 기능에는 영향을 주지 않음
   - 향후 Next.js 버전 업그레이드 시 추가적인 webpack 설정 수정이 필요할 수 있음

## 다음 단계

1. 모든 앱의 개발 모드를 실행하여 webpack 설정 변경이 제대로 적용되었는지 확인
2. 개발 모드가 성공적으로 실행되면 빌드 및 배포를 진행
3. 모든 앱에서 인증 기능을 테스트하여 Clerk v6 업그레이드가 정상적으로 이루어졌는지 확인
4. 문제가 발생하면 단계적으로 해결하며 프로덕션 배포 준비

## 마이그레이션 참고 자료

- [Clerk v6 업그레이드 가이드](https://clerk.com/docs/upgrade-guides/nextjs/v6)
- [Next.js 웹팩 구성 문서](https://nextjs.org/docs/app/api-reference/next-config-js/webpack)
