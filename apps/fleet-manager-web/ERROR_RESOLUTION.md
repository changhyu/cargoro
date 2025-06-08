# 시스템 문제 해결 안내

현재 차량 위치 지도 기능에서 다음 오류가 발생하고 있습니다:

```
TypeError: Cannot read properties of undefined (reading 'clientModules')
```

## 문제 원인

이 오류는 Next.js 14.2.0 버전에서 지도 라이브러리(Mapbox, Leaflet 등)를 사용할 때 서버 컴포넌트와 클라이언트 컴포넌트 간의 로딩 충돌로 인해 발생합니다.

## 임시 해결 방법

현재 지도 페이지는 임시로 단순화된 버전으로 대체되었습니다. 다음 단계를 통해 시스템을 복구할 수 있습니다:

1. 제공된 클린업 스크립트 실행:

   ```bash
   cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/apps/fleet-manager-web
   chmod +x scripts/cleanup.sh
   ./scripts/cleanup.sh
   ```

2. 개발 서버 재시작:

   ```bash
   NEXT_IGNORE_TYPE_ERROR=1 pnpm dev
   ```

3. 브라우저에서 진단 페이지 방문:
   ```
   http://localhost:3001/diagnose
   ```

진단 페이지에서는 시스템 상태를 확인하고 자동으로 대시보드로 리디렉션됩니다.

## 개발팀 참고사항

1. 지도 관련 기능을 포함한 모든 UI 컴포넌트를 클라이언트 컴포넌트로 분리
2. Next.js 캐시와 노드 모듈 캐시 정리
3. 복잡한 컴포넌트 트리를 단순화하고 컴포넌트 간 의존성 줄이기
4. 루트 패키지에서 공유 의존성 버전 확인 및 충돌 해결

## 더 많은 정보

자세한 내용은 다음 문서를 참조하세요:

- README.md: 프로젝트 개요 및 개발 규칙
- TROUBLESHOOTING.md: 추가 문제 해결 단계

문제가 지속되면 개발팀에 문의하세요.
