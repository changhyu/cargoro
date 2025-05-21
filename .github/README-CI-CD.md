# CI/CD 파이프라인 가이드

카고로 플랫폼은 다음과 같은 GitHub Actions 워크플로우를 통해 CI/CD를 자동화합니다:

## 1. 지속적 통합 (CI)

**워크플로우 파일:** `.github/workflows/ci.yml`

주요 기능:
- 코드 품질 검사 (ESLint)
- 타입스크립트 타입 검사
- 유닛 테스트 실행 (Vitest)
- E2E 테스트 실행 (Playwright)
- 백엔드 테스트 실행 (Pytest)
- 프로젝트 빌드

실행 조건:
- `main` 또는 `develop` 브랜치에 푸시
- `main` 또는 `develop` 브랜치로의 PR

### 테스트 커버리지

모든 테스트는 커버리지 리포트를 생성하며, GitHub Actions에서 아티팩트로 제공됩니다. 목표 커버리지는 80% 이상입니다.

## 2. 지속적 배포 (CD)

**워크플로우 파일:** `.github/workflows/cd.yml`

주요 기능:
- Docker 이미지 빌드 및 GitHub Container Registry 푸시
- Helm 차트를 이용한 Kubernetes 배포
- 배포 후 상태 확인

실행 조건:
- `main` 브랜치에 푸시
- 수동 실행(환경 선택 가능):
  - development
  - staging
  - production

### 환경별 배포

각 환경별로 다음과 같이 배포됩니다:

```
<환경명> 환경
- 네임스페이스: cargoro-<환경명>
- Helm 릴리스: cargoro-<환경명>
- 설정 파일: values-<환경명>.yaml (없으면 values.yaml 사용)
```

## 3. Terraform 인프라 관리

**워크플로우 파일:** `.github/workflows/terraform.yml`

주요 기능:
- AWS 인프라 변경 검증(plan)
- 인프라 변경 적용(apply)
- 인프라 삭제(destroy)

실행 조건:
- `infra/terraform/**` 경로의 파일 변경 시
- 수동 실행 (작업 및 환경 선택)

## 4. 의존성 보안 검사

**워크플로우 파일:** `.github/workflows/dependency-check.yml`

주요 기능:
- JavaScript 패키지 취약점 검사 (pnpm audit)
- Python 패키지 취약점 검사 (safety)
- Docker 이미지 취약점 검사 (Trivy)

실행 조건:
- 매주 월요일 자동 실행
- 의존성 관련 파일 변경 시

## 필요한 GitHub Secrets

워크플로우 실행을 위해 다음 시크릿이 필요합니다:

### CD 배포용
- `KUBECONFIG`: Kubernetes 클러스터 접근 설정
- `GITHUB_TOKEN`: GitHub Container Registry 접근용

### Terraform용
- `AWS_ACCESS_KEY_ID`: AWS 액세스 키
- `AWS_SECRET_ACCESS_KEY`: AWS 시크릿 키
- `AWS_REGION`: AWS 리전
- `TF_API_TOKEN`: Terraform Cloud 토큰 (선택사항)

## 워크플로우 수동 실행 방법

1. GitHub 저장소에서 "Actions" 탭으로 이동
2. 원하는 워크플로우 선택 (CD 또는 Terraform)
3. "Run workflow" 버튼 클릭
4. 필요한 매개변수 입력 (환경, 작업 등)
5. "Run workflow" 버튼으로 실행

## 주의사항

- `main` 브랜치는 프로덕션 환경 배포 용도로 사용되므로 PR 리뷰와 테스트를 통과한 코드만 머지해야 합니다.
- Terraform `destroy` 작업은 인프라를 완전히 삭제하므로 매우 주의해서 사용해야 합니다.
- 시크릿 값은 절대 로그나 코드에 하드코딩하지 마세요.

## 문제 해결

배포 실패 시 다음을 확인하세요:

1. GitHub Actions 로그 확인
2. Kubernetes 로그 확인: `kubectl logs -n cargoro-<환경> <pod-name>`
3. Helm 상태 확인: `helm list -n cargoro-<환경>`

더 자세한 문제 해결은 [Kubernetes 배포 가이드](../infra/k8s/README.md)를 참조하세요. 