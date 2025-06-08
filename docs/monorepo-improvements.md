# 모노레포 구조 개선 로그

## 날짜: 2025년 6월 6일

## 개선 사항 요약

1. **보고서(reporting) 패키지 빌드 설정 개선**

   - `main` 및 `types` 필드를 `dist` 디렉토리를 가리키도록 수정
   - 적절한 `exports` 설정 추가
   - TypeScript 빌드 스크립트 최적화

2. **모바일 앱 포트 설정 최적화**

   - 각 모바일 앱마다 고유한 포트 할당:
     - customer-mobile: 19001
     - technician-mobile: 19002
     - workshop-mobile: 19003
     - smart-car-assistant: 19004
     - delivery-driver: 19005

3. **Metro 번들러 설정 개선**

   - 공통 Metro 설정 헬퍼 모듈 생성 (`metro-config-helper.js`)
   - 모든 모바일 앱의 Metro 설정 일관성 확보
   - Haste 모듈 이름 충돌 문제 해결 (백엔드 디렉토리 제외 등)
   - 패키지 의존성 경로 명시적 설정

4. **TypeScript 버전 통일**

   - 프로젝트 전체에서 TypeScript ^5.3.0 버전으로 통일
   - workshop-mobile 앱의 TypeScript 버전 업데이트 (4.9.4 → 5.3.0)

5. **프론트엔드 앱 관리 스크립트 개선**
   - 모든 프론트엔드 앱을 동시에 실행하는 `start_all_frontends.sh` 스크립트 생성
   - 모든 프론트엔드 앱을 중지하는 `stop_all_frontends.sh` 스크립트 생성
   - 루트 package.json의 그룹 실행 스크립트 업데이트 (mobile 앱 포함)

## 다음 단계

1. **패키지 및 앱 설치 테스트**

   - `pnpm install` 명령으로 모든 의존성이 제대로 설치되는지 확인
   - 공유 패키지가 올바르게 빌드되는지 확인

2. **모바일 앱 동시 실행 테스트**

   - `./start_all_frontends.sh` 스크립트로 모든 앱 동시 실행 테스트
   - 각 모바일 앱이 지정된 포트에서 충돌 없이 실행되는지 확인

3. **빌드 출력 검사**

   - utils 및 reporting 패키지가 올바른 출력 파일을 생성하는지 확인
   - 빌드 경고가 해결되었는지 확인

4. **웹 앱과 모바일 앱 통합 테스트**
   - 공유 패키지 사용 시 웹 앱과 모바일 앱이 올바르게 작동하는지 테스트
   - 의존성 버전 충돌 없는지 확인

## 주의 사항

1. 모바일 앱은 각각 다른 포트를 사용하며, 이는 package.json 스크립트와 metro.config.js 파일에 설정되어 있습니다.
2. 모든 모바일 앱에서 공통으로 사용하는 Metro 설정은 `packages/utils/metro-config-helper.js`에 있습니다.
3. 각 모바일 앱에 필요한 추가 모듈 매핑은 해당 앱의 metro.config.js 파일에서 추가하면 됩니다.
