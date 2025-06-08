# CarGoro 렌터카/리스 관리 시스템 - 보안 가이드

## 개요

이 문서는 CarGoro 시스템의 보안 기능과 모범 사례를 설명합니다.

## 구현된 보안 기능

### 1. 인증 및 권한 관리

#### JWT 기반 인증

- **액세스 토큰**: 30분 유효
- **리프레시 토큰**: 7일 유효
- **토큰 자동 갱신**: 만료 시 자동 갱신
- **안전한 토큰 저장**: HttpOnly 쿠키 사용 권장

#### 역할 기반 접근 제어 (RBAC)

- **USER**: 기본 사용자 권한
- **MANAGER**: 관리자 권한
- **ADMIN**: 시스템 관리자 권한

#### 계정 보안

- **비밀번호 정책**:
  - 최소 8자 이상
  - 숫자, 문자 포함 필수
  - bcrypt 해싱 (12 rounds)
- **로그인 시도 제한**: 5회 실패 시 30분 계정 잠금
- **비밀번호 변경 시 복잡도 검증**

### 2. Rate Limiting

#### 엔드포인트별 제한

```python
# 인증 관련
- 로그인: 5회/분
- 회원가입: 3회/시간
- 비밀번호 변경: 3회/시간

# 결제 관련
- 결제 처리: 10회/분
- 환불: 5회/시간

# 일반 API
- 기본: 100회/분
- 검색: 30회/분
- 내보내기: 10회/시간
```

#### IP 차단

- 자동 차단: 10분 내 10회 이상 로그인 실패
- 의심스러운 활동 감지 시 차단
- 임시/영구 차단 지원

### 3. 입력 검증 및 소독

#### SQL Injection 방어

- 파라미터화된 쿼리 사용
- ORM (SQLAlchemy) 사용
- 입력값 패턴 검사
- 위험한 SQL 키워드 차단

#### XSS 방어

- HTML 이스케이프
- 위험한 태그 제거
- Content-Type 헤더 검증
- CSP 헤더 설정

#### Path Traversal 방어

- 파일 경로 검증
- 상대 경로 차단
- 허용된 디렉토리만 접근

### 4. 보안 헤더

```python
# HTTPS 강제
Strict-Transport-Security: max-age=31536000; includeSubDomains

# XSS 보호
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff

# 클릭재킹 방지
X-Frame-Options: DENY

# CSP (Content Security Policy)
Content-Security-Policy: default-src 'self'; ...

# Referrer 정책
Referrer-Policy: strict-origin-when-cross-origin
```

### 5. CORS 설정

#### 개발 환경

- 모든 도메인 허용 (개발 편의성)

#### 프로덕션 환경

```python
allowed_origins = [
    "https://cargoro.com",
    "https://www.cargoro.com",
    "https://app.cargoro.com"
]
```

### 6. 파일 업로드 보안

#### 파일 검증

- **확장자 검사**: 위험한 확장자 차단
- **MIME 타입 검증**: Magic Number 확인
- **파일 크기 제한**: 기본 10MB
- **이미지 검증**: 크기 및 포맷 확인
- **EXIF 데이터 제거**: 개인정보 보호

#### 허용된 파일 형식

- 이미지: JPG, PNG, GIF, WebP
- 문서: PDF, DOC, DOCX, XLS, XLSX
- 텍스트: TXT, CSV

### 7. 로깅 및 감사

#### 감사 로그

- 인증 이벤트 (로그인, 로그아웃)
- 접근 제어 (허용/거부)
- 데이터 변경 (생성/수정/삭제)
- 보안 이벤트 (차단, 의심스러운 활동)

#### 민감 정보 마스킹

- 이메일: abc\*\*\*@example.com
- 전화번호: 010-\*\*\*\*-5678
- 토큰: Bearer [MASKED_TOKEN]
- 카드번호: 1234-\***\*-\*\***-5678

### 8. 세션 관리

- **세션 타임아웃**: 24시간
- **보안 쿠키 설정**:
  - HttpOnly: true
  - Secure: true (HTTPS)
  - SameSite: Strict

### 9. 에러 처리

- **프로덕션**: 일반적인 에러 메시지만 노출
- **개발**: 상세 에러 정보 표시
- **스택 트레이스**: 로그에만 기록

## 보안 모범 사례

### 1. 환경 변수 관리

```bash
# .env 파일 (절대 커밋하지 않음)
SECRET_KEY=your-very-secure-secret-key-min-32-chars
DATABASE_URL=postgresql://user:pass@localhost/db
```

### 2. HTTPS 사용

- 프로덕션 환경에서는 반드시 HTTPS 사용
- HTTP → HTTPS 자동 리다이렉트
- HSTS 헤더 설정

### 3. 정기적인 보안 업데이트

```bash
# 의존성 보안 검사
pip list --outdated
pip-audit

# 업데이트
pip install --upgrade [package]
```

### 4. 최소 권한 원칙

- 각 사용자에게 필요한 최소한의 권한만 부여
- 서비스 계정은 별도 관리
- 정기적인 권한 검토

### 5. 보안 테스트

#### 자동화된 테스트

- SQL Injection 테스트
- XSS 테스트
- 인증/권한 테스트
- Rate Limiting 테스트

#### 수동 테스트

- 침투 테스트
- 코드 리뷰
- 보안 감사

## 사고 대응

### 1. 보안 사고 감지

- 실시간 로그 모니터링
- 이상 패턴 감지
- 알림 시스템 구축

### 2. 대응 절차

1. **격리**: 영향받은 시스템 격리
2. **분석**: 로그 분석 및 원인 파악
3. **복구**: 시스템 복구 및 패치
4. **보고**: 관련자 통보 및 보고서 작성
5. **개선**: 재발 방지 대책 수립

### 3. 백업 및 복구

- 정기적인 데이터 백업
- 백업 데이터 암호화
- 복구 절차 테스트

## 체크리스트

### 개발 시

- [ ] 입력값 검증 구현
- [ ] 적절한 인증/권한 확인
- [ ] 민감 정보 로깅 금지
- [ ] 에러 메시지 적절성 확인
- [ ] SQL 쿼리 파라미터화

### 배포 전

- [ ] 환경 변수 설정 확인
- [ ] HTTPS 설정 확인
- [ ] 보안 헤더 설정 확인
- [ ] Rate Limiting 설정 확인
- [ ] 로깅 설정 확인

### 운영 중

- [ ] 정기적인 보안 패치
- [ ] 로그 모니터링
- [ ] 비정상 접근 패턴 확인
- [ ] 백업 상태 확인
- [ ] 인증서 만료일 확인

## 문의

보안 관련 문의나 취약점 제보:

- 이메일: security@cargoro.com
- 긴급 연락처: 010-XXXX-XXXX

---

마지막 업데이트: 2024년 12월
