# GitHub Branch Protection 설정 가이드

## 1. Branch Protection Rules 설정 경로

```
리포지토리 → Settings → Branches → Add rule
```

## 2. Main 브랜치 보호 규칙

### Branch name pattern

```
main
```

### 필수 설정 ✅

#### Require a pull request before merging

- ✅ Require approvals: 2 (최소 2명의 리뷰어 승인)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from CODEOWNERS
- ✅ Require approval of the most recent reviewable push

#### Require status checks to pass before merging

- ✅ Require branches to be up to date before merging
- 필수 상태 체크 추가:
  - `test-and-coverage (18.x)`
  - `test-and-coverage (20.x)`
  - `lint-and-format`
  - `security-check`
  - `codecov/project`
  - `codecov/patch`

#### Require conversation resolution before merging

- ✅ 모든 코멘트가 해결되어야 머지 가능

#### Require signed commits

- ✅ (선택사항) 커밋 서명 필수

#### Require linear history

- ✅ Squash and merge만 허용

#### Include administrators

- ✅ 관리자도 규칙을 따라야 함

#### Restrict who can push to matching branches

- 특정 팀/사용자만 직접 푸시 가능하도록 제한

## 3. Develop 브랜치 보호 규칙

### Branch name pattern

```
develop
```

### 설정 (Main보다 완화된 규칙)

- ✅ Require pull request: 1명 승인
- ✅ Require status checks
- ✅ Require up-to-date branches
- ❌ Require signed commits (선택사항)

## 4. 추가 브랜치 패턴

### Feature 브랜치

```
feature/*
```

- 보호 규칙 없음 (자유로운 개발)

### Hotfix 브랜치

```
hotfix/*
```

- ✅ Require status checks
- ✅ 긴급 수정을 위해 승인 요구사항 완화

## 5. 자동 삭제 설정

```
Settings → General → Pull Requests
✅ Automatically delete head branches
```

## 6. 머지 옵션 설정

```
Settings → General → Pull Requests
✅ Allow squash merging (기본)
❌ Allow merge commits
✅ Allow rebase merging
```
