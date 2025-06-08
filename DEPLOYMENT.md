# 배포 안내 (2024-05-24)

## 개발 완료 내역

2024-05-24에 진행된 개발 작업으로 다음 기능이 구현되었습니다:

1. **차량 관리 기능**

   - 차량 유형별 필터링 기능 (차량, 트럭, 밴 탭)
   - 차량 삭제 기능
   - 차량 수정 기능
   - 차량 배정 이력 관리

2. **시스템 감사 기능**

   - 실제 API 연동 기능 (폴백 로직 포함)
   - 로그 내보내기 기능 (CSV/JSON 형식)

3. **UI 컴포넌트 구조 개선**
   - UI 컴포넌트 임포트 경로 표준화
   - 날짜 선택기 컴포넌트 수정
   - toast 컴포넌트 오류 수정

## 배포 준비 사항

### 환경 설정

1. 환경 변수 설정

   ```
   # .env 파일에 다음 환경 변수 추가
   NEXT_PUBLIC_API_URL=http://api.example.com
   NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

2. 의존성 설치
   ```bash
   pnpm install
   ```

### 빌드 및 배포

1. 개발 환경 실행

   ```bash
   pnpm dev
   ```

2. 프로덕션 빌드

   ```bash
   pnpm build
   ```

3. 프로덕션 배포

   ```bash
   # 수동 배포 방법
   pnpm deploy

   # 또는 CI/CD 파이프라인 트리거
   git push origin main
   ```

## 주의 사항

1. **API 서버 연동**

   - 아직 백엔드 API가 개발 중이므로 임시 목업 데이터로 폴백됩니다.
   - API 서버가 준비되면 자동으로 실제 데이터를 사용합니다.

2. **테스트 계정**

   - 테스트용 관리자 계정: admin@example.com / password123
   - 테스트용 사용자 계정: user@example.com / password123

3. **알려진 이슈**
   - 차량 유형별 통계 데이터는 실시간으로 업데이트되지 않을 수 있습니다.
   - 대량의 감사 로그를 내보낼 때 지연이 발생할 수 있습니다.

## 롤백 절차

문제 발생 시 다음 절차에 따라 롤백할 수 있습니다:

1. 이전 안정 버전으로 체크아웃

   ```bash
   git checkout v1.2.3
   ```

2. 롤백 빌드 및 배포
   ```bash
   pnpm build
   pnpm deploy
   ```

## 모니터링

배포 후 다음 도구를 통해 모니터링할 수 있습니다:

1. **Sentry**: 오류 및 성능 모니터링

   - https://sentry.io/organizations/your-org/

2. **PostHog**: 사용자 행동 분석

   - https://app.posthog.com/dashboard

3. **Grafana**: 시스템 모니터링
   - https://grafana.your-domain.com
