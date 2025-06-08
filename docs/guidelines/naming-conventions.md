# 네이밍 컨벤션 가이드라인

이 문서는 CarGoro 프로젝트의 코드 일관성을 위한 네이밍 컨벤션 가이드라인을 제공합니다.

## 일반 원칙

- 모든 코드는 의미가 명확하고 일관된 네이밍 패턴을 따라야 합니다.
- 약어 사용은 최소화하고, 사용할 경우 널리 알려진 약어만 사용합니다.
- 네이밍은 한국어 발음이 아닌 영문으로 작성합니다.
- 설명적인 이름을 선택하되, 지나치게 길지 않게 합니다.

## 언어별 네이밍 컨벤션

### Python

- **파일명**: snake_case (예: `user_routes.py`, `auth_service.py`)
- **변수/함수명**: snake_case (예: `user_id`, `get_user_by_id()`)
- **클래스명**: PascalCase (예: `UserModel`, `AuthService`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`)
- **패키지/모듈명**: snake_case (예: `user_management`, `auth_utils`)

### TypeScript/JavaScript

- **파일명**: kebab-case (예: `user-service.ts`, `auth-utils.ts`)
- **변수/함수명**: camelCase (예: `userId`, `getUserById()`)
- **클래스/인터페이스/타입명**: PascalCase (예: `UserModel`, `AuthService`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`)
- **컴포넌트 파일명**: PascalCase (예: `UserProfile.tsx`, `LoginForm.tsx`)

### HTML/CSS

- **CSS 클래스**: kebab-case (예: `user-profile`, `login-form`)
- **ID**: camelCase (예: `userId`, `loginForm`)

## 도메인별 네이밍 접두사/접미사

일관성을 위해 다음과 같은 접두사/접미사 규칙을 따릅니다:

- **API 라우터**: `{리소스명}_routes.py` / `{리소스명}-routes.ts`
- **서비스**: `{기능명}_service.py` / `{기능명}-service.ts`
- **모델**: `{엔티티명}_model.py` / `{엔티티명}-model.ts`
- **유틸리티**: `{기능명}_utils.py` / `{기능명}-utils.ts`
- **훅**: `use{기능명}.ts` (예: `useAuth.ts`, `useUser.ts`)
- **컨텍스트**: `{기능명}Context.tsx` (예: `AuthContext.tsx`)

## 네이밍 금지 사항

- **인터페이스 접두사 'I' 사용 금지**: `IUser` 대신 `User` 사용
- **타입 접두사 'T' 사용 금지**: `TConfig` 대신 `Config` 사용
- **불필요한 접미사 사용 금지**: `UserObject`, `PersonClass` 등 피하기
- **의미 없는 약어 사용 금지**: `u`, `usr` 대신 `user` 사용

## 단위 테스트 네이밍

- **테스트 파일명**: `{테스트대상}.test.ts` 또는 `test_{테스트대상}.py`
- **테스트 함수/메서드**:
  - Python: `test_should_{예상동작}_when_{조건}` (예: `test_should_return_user_when_valid_id_provided`)
  - TypeScript: `should {예상동작} when {조건}` (예: `should return user when valid id provided`)
