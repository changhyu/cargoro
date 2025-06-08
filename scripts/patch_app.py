#!/usr/bin/env python3
"""
App 파일 패치 스크립트

이 스크립트는 각 서비스의 app.py 또는 서비스 초기화 파일을 수정하여
리팩토링된 새 모듈을 사용하도록 업데이트합니다.

사용법:
  python patch_app.py --apply [--dry-run] [--verbose]
  python patch_app.py --rollback [--dry-run] [--verbose]

옵션:
  --apply        새 모듈을 사용하도록 패치 적용
  --rollback     기존 모듈을 사용하도록 롤백
  --dry-run      실제 변경 없이 변경될 내용만 출력
  --verbose      상세 로그 출력
"""

import os
import re
import sys
import argparse
import shutil
from datetime import datetime
from typing import Dict, List, Tuple


# 패치 대상 파일
TARGET_FILES = [
    '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/server.py',
    '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/parts_api/lib/server.py',
]

# 라우터 등록 패턴
ROUTER_PATTERNS = {
    # Fleet API 라우터
    'fleet_api': [
        (r'from\s+lib\.routes\s+import\s+\([\s\S]*?vehicle_routes,[\s\S]*?contract_routes,[\s\S]*?location_routes,[\s\S]*?driver_routes,[\s\S]*?maintenance_routes,[\s\S]*?driver_performance_routes,[\s\S]*?driving_record_routes,[\s\S]*?lease_routes,[\s\S]*?\)',
         'from lib.routes import (\n    vehicle_routes_new as vehicle_routes,\n    contract_routes,\n    location_routes,\n    driver_routes_new as driver_routes,\n    maintenance_routes_new as maintenance_routes,\n    driver_performance_routes_new as driver_performance_routes,\n    driving_record_routes_new as driving_record_routes,\n    lease_routes_new as lease_routes,\n)'),
    ],
    # Parts API 라우터
    'parts_api': [
        (r'from\s+\.routes\s+import\s+part_router,\s+supplier_router,\s+erp_sync_router',
         'from .routes import part_router, supplier_router\nfrom .routes.erp_sync_routes_new import router as erp_sync_router'),
    ]
}

# 롤백 패턴
ROLLBACK_PATTERNS = {
    # Fleet API 라우터
    'fleet_api': [
        (r'from\s+lib\.routes\s+import\s+\([\s\S]*?vehicle_routes_new\s+as\s+vehicle_routes,[\s\S]*?driver_routes_new\s+as\s+driver_routes,[\s\S]*?maintenance_routes_new\s+as\s+maintenance_routes,[\s\S]*?driver_performance_routes_new\s+as\s+driver_performance_routes,[\s\S]*?driving_record_routes_new\s+as\s+driving_record_routes,[\s\S]*?lease_routes_new\s+as\s+lease_routes,[\s\S]*?\)',
         'from lib.routes import (\n    vehicle_routes,\n    contract_routes,\n    location_routes,\n    driver_routes,\n    maintenance_routes,\n    driver_performance_routes,\n    driving_record_routes,\n    lease_routes,\n)'),
    ],
    # Parts API 라우터
    'parts_api': [
        (r'from\s+\.routes\s+import\s+part_router,\s+supplier_router\nfrom\s+\.routes\.erp_sync_routes_new\s+import\s+router\s+as\s+erp_sync_router',
         'from .routes import part_router, supplier_router, erp_sync_router'),
    ]
}


def create_backup(file_path, verbose=False):
    """
    파일의 백업을 생성합니다.

    Args:
        file_path: 백업할 파일 경로
        verbose: 상세 로그 출력 여부

    Returns:
        백업 파일 경로 또는 None (백업 실패 시)
    """
    if not os.path.exists(file_path):
        if verbose:
            print(f"경고: '{file_path}'가 존재하지 않아 백업을 생성할 수 없습니다.")
        return None

    backup_path = f"{file_path}.bak.{datetime.now().strftime('%Y%m%d%H%M%S')}"
    try:
        shutil.copy2(file_path, backup_path)
        if verbose:
            print(f"백업 생성: {file_path} → {backup_path}")
        return backup_path
    except Exception as e:
        print(f"오류: '{file_path}' 백업 생성 실패: {str(e)}")
        return None


def find_latest_backup(file_path, verbose=False):
    """
    파일의 가장 최근 백업을 찾습니다.

    Args:
        file_path: 원본 파일 경로
        verbose: 상세 로그 출력 여부

    Returns:
        가장 최근 백업 파일 경로 또는 None (백업 없을 시)
    """
    backup_dir = os.path.dirname(file_path)
    file_name = os.path.basename(file_path)

    # 백업 파일 패턴: {original_name}.bak.{timestamp}
    backup_prefix = f"{file_name}.bak."

    backups = []
    for f in os.listdir(backup_dir):
        if f.startswith(backup_prefix):
            backups.append(os.path.join(backup_dir, f))

    if not backups:
        if verbose:
            print(f"경고: '{file_path}'의 백업 파일을 찾을 수 없습니다.")
        return None

    # 가장 최근 백업 파일 반환
    latest_backup = max(backups, key=os.path.getctime)
    if verbose:
        print(f"최근 백업 발견: {latest_backup}")

    return latest_backup


def patch_file(file_path, patterns, dry_run=False, verbose=False):
    """
    파일에 패치를 적용합니다.

    Args:
        file_path: 패치할 파일 경로
        patterns: (검색 패턴, 교체 패턴) 목록
        dry_run: 실제 변경 없이 변경될 내용만 출력
        verbose: 상세 로그 출력 여부

    Returns:
        변경된 패턴 수
    """
    if not os.path.exists(file_path):
        print(f"오류: 파일 '{file_path}'이 존재하지 않습니다.")
        return 0

    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
    except Exception as e:
        print(f"오류: '{file_path}' 파일을 읽을 수 없습니다: {str(e)}")
        return 0

    original_content = content
    changes_count = 0

    for search_pattern, replace_pattern in patterns:
        # 패턴 매칭 횟수 확인
        matches = re.findall(search_pattern, content)
        if matches:
            # 변경사항 있음
            changes_count += len(matches)
            if verbose:
                for match in matches:
                    print(f"  {file_path}: '{match}' → '{replace_pattern}'")

            # 패턴 교체
            content = re.sub(search_pattern, replace_pattern, content)

    # 변경사항이 있고 dry_run이 아니면 파일 업데이트
    if content != original_content and not dry_run:
        # 백업 생성
        backup_path = create_backup(file_path, verbose)
        if not backup_path:
            print(f"경고: '{file_path}' 백업 생성 실패, 패치를 적용하지 않습니다.")
            return 0

        try:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            if verbose:
                print(f"✅ {file_path} 파일 패치 적용 완료 ({changes_count}개 변경)")
        except Exception as e:
            print(f"오류: '{file_path}' 파일을 쓸 수 없습니다: {str(e)}")
            return 0

    return changes_count


def apply_patches(dry_run=False, verbose=False):
    """
    모든 대상 파일에 패치를 적용합니다.

    Args:
        dry_run: 실제 변경 없이 변경될 내용만 출력
        verbose: 상세 로그 출력 여부

    Returns:
        성공적으로 처리된 파일 수
    """
    success_count = 0

    for file_path in TARGET_FILES:
        # 서비스 식별
        if 'fleet_api' in file_path:
            service = 'fleet_api'
        elif 'parts_api' in file_path:
            service = 'parts_api'
        else:
            print(f"경고: '{file_path}'의 서비스를 식별할 수 없습니다.")
            continue

        # 적절한 패턴 목록 선택
        patterns = ROUTER_PATTERNS.get(service, [])
        if not patterns:
            print(f"경고: '{service}'에 대한 패턴이 정의되지 않았습니다.")
            continue

        if dry_run:
            print(f"[DRY RUN] 파일 패치: {file_path}")
            success_count += 1
        else:
            changes = patch_file(file_path, patterns, dry_run, verbose)
            if changes > 0:
                success_count += 1
                if verbose:
                    print(f"'{file_path}' 패치 성공 ({changes}개 변경)")
            else:
                if verbose:
                    print(f"'{file_path}' 패치 없음 (변경 필요 없음)")

    return success_count


def rollback_patches(dry_run=False, verbose=False):
    """
    모든 대상 파일에 롤백을 적용합니다.

    Args:
        dry_run: 실제 변경 없이 변경될 내용만 출력
        verbose: 상세 로그 출력 여부

    Returns:
        성공적으로 처리된 파일 수
    """
    success_count = 0

    for file_path in TARGET_FILES:
        # 서비스 식별
        if 'fleet_api' in file_path:
            service = 'fleet_api'
        elif 'parts_api' in file_path:
            service = 'parts_api'
        else:
            print(f"경고: '{file_path}'의 서비스를 식별할 수 없습니다.")
            continue

        # 적절한 패턴 목록 선택
        patterns = ROLLBACK_PATTERNS.get(service, [])
        if not patterns:
            print(f"경고: '{service}'에 대한 롤백 패턴이 정의되지 않았습니다.")
            continue

        if dry_run:
            print(f"[DRY RUN] 파일 롤백: {file_path}")
            success_count += 1
        else:
            changes = patch_file(file_path, patterns, dry_run, verbose)
            if changes > 0:
                success_count += 1
                if verbose:
                    print(f"'{file_path}' 롤백 성공 ({changes}개 변경)")
            else:
                if verbose:
                    print(f"'{file_path}' 롤백 없음 (변경 필요 없음)")

    return success_count


def main():
    parser = argparse.ArgumentParser(description='App 파일 패치 스크립트')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--apply', action='store_true', help='새 모듈을 사용하도록 패치 적용')
    group.add_argument('--rollback', action='store_true', help='기존 모듈을 사용하도록 롤백')
    parser.add_argument('--dry-run', action='store_true', help='실제 변경 없이 변경될 내용만 출력')
    parser.add_argument('--verbose', action='store_true', help='상세 로그 출력')

    args = parser.parse_args()

    print(f"{'[DRY RUN] ' if args.dry_run else ''}App 파일 {'패치' if args.apply else '롤백'} 시작...")

    if args.apply:
        success_count = apply_patches(args.dry_run, args.verbose)
    else:
        success_count = rollback_patches(args.dry_run, args.verbose)

    print(f"\n처리 완료:")
    print(f"  성공적으로 처리된 파일: {success_count}/{len(TARGET_FILES)}")
    print(f"  {'테스트 모드로 실행됨 (실제 변경 없음)' if args.dry_run else '모든 변경사항이 적용됨'}")

    if success_count != len(TARGET_FILES):
        print("\n경고: 일부 파일이 처리되지 않았습니다. 로그를 확인하세요.")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
