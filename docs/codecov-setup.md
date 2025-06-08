# Codecov 설정 가이드

## 🚀 빠른 설정

### 1. Codecov 계정 설정

1. [Codecov.io](https://codecov.io) 방문
2. GitHub으로 로그인
3. 리포지토리 연결

### 2. 토큰 설정

1. Codecov 대시보드에서 리포지토리 선택
2. Settings → General → Repository Upload Token 복사
3. GitHub 리포지토리 → Settings → Secrets → New repository secret
   - Name: `CODECOV_TOKEN`
   - Value: 복사한 토큰

### 3. README 배지 업데이트

README.md 파일에서 다음 부분을 실제 값으로 변경:

- `[YOUR-GITHUB-USERNAME]` → 실제 GitHub 사용자명
- `[YOUR-REPO-NAME]` → 실제 리포지토리 이름
- `YOUR-TOKEN` → Codecov 토큰 (선택사항)

예시:

```markdown
[![codecov](https://codecov.io/gh/cargoro/monorepo-root/branch/main/graph/badge.svg)](https://codecov.io/gh/cargoro/monorepo-root)
```

### 4. 첫 푸시

```bash
git add .
git commit -m "ci: Codecov 통합 설정"
git push origin main
```

## 📊 Codecov 기능 활용

### Pull Request 코멘트

- PR마다 자동으로 커버리지 변화 리포트
- 라인별 커버리지 표시
- 커버리지 감소 시 경고

### 커버리지 트렌드

- 시간별 커버리지 변화 추적
- 파일별 상세 분석
- 팀 성과 대시보드

### 설정 커스터마이징

`.codecov.yml` 파일에서:

- 커버리지 목표 조정
- 특정 파일 제외
- 알림 설정

## 🔍 문제 해결

### 커버리지가 표시되지 않을 때

1. GitHub Actions 로그 확인
2. lcov.info 파일 생성 여부 확인
3. 토큰이 올바르게 설정되었는지 확인

### 브라우저 테스트 커버리지

현재 브라우저 테스트는 선택사항으로 설정되어 있습니다.
필요시 `continue-on-error: true` 제거 가능

## 📚 추가 자료

- [Codecov 문서](https://docs.codecov.com)
- [Vitest 커버리지 가이드](https://vitest.dev/guide/coverage.html)
- [GitHub Actions + Codecov](https://github.com/codecov/codecov-action)
