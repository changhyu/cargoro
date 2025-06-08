# 기능(Features) 디렉토리

이 폴더는 CarGoro 플랫폼 표준화 작업의 일환으로 기존 `modules/` 폴더의 내용이 이동된 디렉토리입니다.

## 사용 가이드라인

- 비즈니스 로직과 기능별로 구분된 컴포넌트, 훅, 유틸리티 등을 관리합니다.
- 각 기능은 독립적인 하위 디렉토리로 구성하여 관리합니다.

### 권장 구조

```
feature-name/
  ├── components/     # 이 기능에서만 사용되는 UI 컴포넌트
  ├── hooks/          # 이 기능에서만 사용되는 훅
  ├── utils/          # 이 기능에서만 사용되는 유틸리티 함수
  ├── types.ts        # 타입 정의
  └── index.ts        # 내보내기
```

이 폴더는 앱 표준 구조 가이드라인에 따라 정렬되었습니다:
`pages/ → components/ → features/ → hooks/ → state/ → services/ → constants/`
