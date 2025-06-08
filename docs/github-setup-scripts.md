# GitHub 필수 상태 체크 설정 스크립트

## GitHub CLI를 사용한 자동 설정

### 1. GitHub CLI 설치

```bash
# macOS
brew install gh

# 인증
gh auth login
```

### 2. Branch Protection 자동 설정 스크립트

```bash
#!/bin/bash
# save as: setup-branch-protection.sh

REPO="cargoro/monorepo"  # 실제 리포지토리로 변경
MAIN_BRANCH="main"
DEVELOP_BRANCH="develop"

echo "🔐 Setting up branch protection for $REPO..."

# Main 브랜치 보호 규칙
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/$REPO/branches/$MAIN_BRANCH/protection \
  --field required_status_checks='{"strict":true,"contexts":["test-and-coverage (18.x)","test-and-coverage (20.x)","lint-and-format","security-check","codecov/project","codecov/patch"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"require_last_push_approval":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field block_creations=false \
  --field required_conversation_resolution=true \
  --field lock_branch=false \
  --field allow_fork_syncing=false

echo "✅ Main branch protection set!"

# Develop 브랜치 보호 규칙
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/$REPO/branches/$DEVELOP_BRANCH/protection \
  --field required_status_checks='{"strict":true,"contexts":["test-and-coverage (18.x)","lint-and-format"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

echo "✅ Develop branch protection set!"

# 자동 머지 설정
gh api \
  --method PATCH \
  -H "Accept: application/vnd.github+json" \
  /repos/$REPO \
  --field allow_auto_merge=true \
  --field delete_branch_on_merge=true \
  --field allow_squash_merge=true \
  --field allow_merge_commit=false \
  --field allow_rebase_merge=true

echo "✅ Repository settings updated!"
```

### 3. 실행

```bash
chmod +x setup-branch-protection.sh
./setup-branch-protection.sh
```

## CODEOWNERS 파일 설정

```bash
# .github/CODEOWNERS
# 전체 코드베이스
* @team-leads

# 프론트엔드
/apps/ @frontend-team
/packages/ui/ @frontend-team @design-team

# 백엔드
/backend/ @backend-team
/packages/api-client/ @backend-team @frontend-team

# 인프라
/infra/ @devops-team
/.github/ @devops-team

# 문서
/docs/ @all-contributors

# 중요 설정 파일
package.json @team-leads
pnpm-lock.yaml @team-leads
tsconfig.json @team-leads
.env.example @team-leads @security-team
```

## GitHub Actions 권한 설정

```yaml
# .github/workflows/permissions.yml
name: Workflow Permissions

permissions:
  contents: read
  issues: write
  pull-requests: write
  actions: read
  checks: write
  statuses: write
  security-events: write
```

## Dependabot 설정

```yaml
# .github/dependabot.yml
version: 2
updates:
  # npm 의존성
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
      time: '04:00'
    open-pull-requests-limit: 10
    reviewers:
      - 'team-leads'
    labels:
      - 'dependencies'
      - 'npm'
    groups:
      production-dependencies:
        dependency-type: 'production'
      development-dependencies:
        dependency-type: 'development'
        patterns:
          - '*'
        exclude-patterns:
          - 'eslint*'
          - 'prettier*'

  # GitHub Actions
  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
    reviewers:
      - 'devops-team'
    labels:
      - 'dependencies'
      - 'github-actions'

  # Docker
  - package-ecosystem: 'docker'
    directory: '/infra/docker'
    schedule:
      interval: 'weekly'
    reviewers:
      - 'devops-team'
```

## Security 정책

```markdown
# .github/SECURITY.md

# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

보안 취약점을 발견하셨다면:

1. **공개 이슈를 생성하지 마세요**
2. security@cargoro.com으로 이메일 보내주세요
3. 48시간 내에 응답드립니다
4. 해결 후 기여자로 인정해드립니다

## Security Measures

- 의존성 자동 업데이트 (Dependabot)
- 코드 스캔 (CodeQL)
- Secret 스캔
- Container 스캔
```

## 알림 설정

### Slack 통합

```
Settings → Integrations → Slack
- PR 생성/머지 알림
- CI/CD 실패 알림
- 보안 알림
```

### 이메일 알림

```
Settings → Notifications
- Security alerts: ✅
- Vulnerability alerts: ✅
- CI/CD failures: ✅
```
