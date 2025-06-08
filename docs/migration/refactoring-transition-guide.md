# 카고로 백엔드 코드베이스 리팩토링 전환 가이드

이 문서는 카고로 백엔드 코드베이스의 리팩토링된 파일을 실제 운영 환경에 적용하기 위한 단계적 전환 가이드입니다.

## 1. 전환 전략 개요

리팩토링 작업은 코드 품질 향상과 유지보수성 개선을 위해 진행되었으나, 운영 중인 시스템에 영향을 최소화하며 안전하게 적용하는 것이 중요합니다. 이를 위해 다음과 같은 단계적 전환 전략을 사용합니다:

1. **점진적 전환**: 모든 파일을 한 번에 교체하지 않고 서비스별, 모듈별로 점진적으로 전환
2. **병행 운영**: 기존 파일과 새 파일을 일정 기간 병행 운영하여 문제 발생 시 빠르게 롤백
3. **테스트 우선**: 각 전환 단계마다 자동화된 테스트를 통해 기능 검증

## 2. 전환 준비사항

### 필수 체크리스트

- [ ] 모든 단위 테스트 통과 확인
- [ ] 통합 테스트 통과 확인
- [ ] 코드 리뷰 완료
- [ ] 롤백 계획 준비
- [ ] 모니터링 강화 설정

### 변환된 파일 목록

**모델 파일:**

- `/backend/services/fleet_api/lib/models/driver_new.py` (driver.py)
- `/backend/services/fleet_api/lib/models/vehicle_new.py` (vehicle.py)
- `/backend/services/fleet_api/lib/models/driver_performance_new.py` (driver_performance.py)
- `/backend/services/fleet_api/lib/models/maintenance_new.py` (maintenance.py)
- `/backend/services/parts_api/lib/models/erp_sync_new.py` (erp_sync.py)

**라우터 파일:**

- `/backend/services/fleet_api/lib/routes/driver_routes_new.py` (driver_routes.py)
- `/backend/services/fleet_api/lib/routes/vehicle_routes_new.py` (vehicle_routes.py)
- `/backend/services/fleet_api/lib/routes/driver_performance_routes_new.py` (driver_performance_routes.py)
- `/backend/services/fleet_api/lib/routes/maintenance_routes_new.py` (maintenance_routes.py)
- `/backend/services/fleet_api/lib/routes/driving_record_routes_new.py` (driving_record_routes.py)
- `/backend/services/fleet_api/lib/routes/lease_routes_new.py` (lease_routes.py)
- `/backend/services/parts_api/lib/routes/erp_sync_routes_new.py` (erp_sync_routes.py)

## 3. 전환 단계

### 3.1 테스트 환경 적용 (Day 1)

1. 테스트 환경에 모든 변환된 파일 배포
2. 서비스 초기화 파일 (`__init__.py`) 수정하여 새 모듈 사용
3. 24시간 동안 모니터링하며 문제 없음 확인

### 3.2 Fleet API 서비스 전환 (Day 2-3)

1. 임포트 참조 업데이트 스크립트 실행

   ```python
   # 예: 임포트 참조 업데이트 스크립트
   import os
   import re

   def update_imports(file_path):
       with open(file_path, 'r') as file:
           content = file.read()

       # 임포트 패턴 업데이트 (예: driver.py -> driver_new.py)
       patterns = [
           (r'from \.\.models\.driver import', 'from ..models.driver_new import'),
           (r'from \.\.models\.vehicle import', 'from ..models.vehicle_new import'),
           # 추가 패턴...
       ]

       for old, new in patterns:
           content = re.sub(old, new, content)

       with open(file_path, 'w') as file:
           file.write(content)

   # 모든 Python 파일에 대해 실행
   for root, _, files in os.walk('/path/to/backend'):
       for file in files:
           if file.endswith('.py'):
               update_imports(os.path.join(root, file))
   ```

2. Fleet API 서비스 재시작 및 검증
3. 문제 발생 시 즉시 롤백

### 3.3 Parts API 서비스 전환 (Day 4)

1. 임포트 참조 업데이트
2. Parts API 서비스 재시작 및 검증
3. 문제 발생 시 즉시 롤백

### 3.4 파일 이름 교체 (Day 5-6)

모든 서비스가 새 모듈을 사용하고 있음을 확인한 후:

1. 백업 생성

   ```bash
   cp /backend/services/fleet_api/lib/models/driver.py /backend/services/fleet_api/lib/models/driver.py.bak
   ```

2. 파일 이름 교체

   ```bash
   mv /backend/services/fleet_api/lib/models/driver_new.py /backend/services/fleet_api/lib/models/driver.py
   ```

3. 임포트 참조 복원

   ```python
   # 임포트 참조 복원 스크립트
   # driver_new.py -> driver.py로 변경된 후 실행
   ```

4. 서비스 재시작 및 검증

## 4. 롤백 계획

문제 발생 시 다음 롤백 절차를 따릅니다:

1. **빠른 롤백**: 기존 파일로 즉시 복원

   ```bash
   mv /backend/services/fleet_api/lib/models/driver.py.bak /backend/services/fleet_api/lib/models/driver.py
   ```

2. **임포트 참조 복원**: 원래 임포트 참조로 복원

   ```bash
   # 원래 참조로 복원하는 스크립트 실행
   ```

3. **서비스 재시작**: 영향받은 서비스 재시작
   ```bash
   # 서비스 재시작 명령
   ```

## 5. 모니터링 및 검증

전환 과정 전반에 걸쳐 다음 항목을 모니터링합니다:

1. **오류율**: API 엔드포인트별 오류율 모니터링
2. **응답 시간**: 성능 저하 여부 확인
3. **로그 분석**: 예외 및 경고 메시지 모니터링
4. **사용자 피드백**: 사용자 경험 영향 확인

## 6. 완료 체크리스트

모든 전환이 완료된 후 다음 체크리스트를 확인합니다:

- [ ] 모든 백업 파일 정리
- [ ] 문서 업데이트 완료
- [ ] 모든 테스트 통과 확인
- [ ] 코드 품질 검증 완료
- [ ] 전환 완료 보고서 작성
