#!/usr/bin/env python3
"""
파일 이름 교체 스크립트

이 스크립트는 리팩토링된 파일(예: driver_new.py)로 기존 파일(예: driver.py)을 교체합니다.
전환 과정의 마지막 단계에서 사용됩니다.

사용법:
  python rename_files.py --apply [--dry-run] [--verbose]
  python rename_files.py --rollback [--dry-run] [--verbose]

옵션:
  --apply        새 파일로 기존 파일 교체
  --rollback     백업에서 기존 파일 복원
  --dry-run      실제 변경 없이 변경될 내용만 출력
  --verbose      상세 로그 출력
"""

import os
import sys
import argparse
import shutil
from datetime import datetime


# 변환 대상 파일 목록: (원본 파일, 새 파일)
TARGET_FILES = [
    # Fleet API 모델
    ('/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/models/driver.py',
     '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/models/driver_new.py'),
    ('/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/models/vehicle.py',
     '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/models/vehicle_new.py'),
    ('/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/models/driver_performance.py',
     '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/models/driver_performance_new.py'),
    ('/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/models/maintenance.py',
     '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/models/maintenance_new.py'),

    # Fleet API 라우터
    ('/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/routes/driver_routes.py',
     '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/routes/driver_routes_new.py'),
    ('/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/routes/vehicle_routes.py',
     '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/routes/vehicle_routes_new.py'),
    ('/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/routes/driver_performance_routes.py',
     '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/routes/driver_performance_routes_new.py'),
    ('/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/routes/maintenance_routes.py',
     '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/routes/maintenance_routes_new.py'),
    ('/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/routes/driving_record_routes.py',
     '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/routes/driving_record_routes_new.py'),
    ('/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/routes/lease_routes.py',
     '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/fleet_api/lib/routes/lease_routes_new.py'),

    # Parts API
    ('/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/parts_api/lib/models/erp_sync.py',
     '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/parts_api/lib/models/erp_sync_new.py'),
    ('/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/parts_api/lib/routes/erp_sync_routes.py',
     '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend/services/parts_api/lib/routes/erp_sync_routes_new.py'),
]


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


def apply_rename(dry_run=False, verbose=False):
    """
    새 파일로 기존 파일을 교체합니다.

    Args:
        dry_run: 실제 변경 없이 변경될 내용만 출력
        verbose: 상세 로그 출력 여부

    Returns:
        성공적으로 처리된 파일 수
    """
    success_count = 0

    for original_file, new_file in TARGET_FILES:
        if not os.path.exists(new_file):
            print(f"오류: 새 파일 '{new_file}'이 존재하지 않습니다.")
            continue

        # 기존 파일 백업
        if os.path.exists(original_file):
            if dry_run:
                print(f"[DRY RUN] 백업 생성: {original_file}")
            else:
                backup_path = create_backup(original_file, verbose)
                if not backup_path:
                    print(f"경고: '{original_file}' 백업 실패, 이 파일은 건너뜁니다.")
                    continue

        # 파일 교체
        if dry_run:
            print(f"[DRY RUN] 파일 교체: {new_file} → {original_file}")
            success_count += 1
        else:
            try:
                shutil.copy2(new_file, original_file)
                if verbose:
                    print(f"✅ 파일 교체 완료: {new_file} → {original_file}")
                success_count += 1
            except Exception as e:
                print(f"오류: 파일 교체 실패 '{new_file}' → '{original_file}': {str(e)}")

    return success_count


def rollback_rename(dry_run=False, verbose=False):
    """
    백업에서 기존 파일을 복원합니다.

    Args:
        dry_run: 실제 변경 없이 변경될 내용만 출력
        verbose: 상세 로그 출력 여부

    Returns:
        성공적으로 처리된 파일 수
    """
    success_count = 0

    for original_file, _ in TARGET_FILES:
        # 가장 최근 백업 찾기
        backup_path = find_latest_backup(original_file, verbose)
        if not backup_path:
            print(f"경고: '{original_file}'의 백업을 찾을 수 없어 롤백을 건너뜁니다.")
            continue

        # 파일 복원
        if dry_run:
            print(f"[DRY RUN] 파일 복원: {backup_path} → {original_file}")
            success_count += 1
        else:
            try:
                shutil.copy2(backup_path, original_file)
                if verbose:
                    print(f"✅ 파일 복원 완료: {backup_path} → {original_file}")
                success_count += 1
            except Exception as e:
                print(f"오류: 파일 복원 실패 '{backup_path}' → '{original_file}': {str(e)}")

    return success_count


def main():
    parser = argparse.ArgumentParser(description='파일 이름 교체 스크립트')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--apply', action='store_true', help='새 파일로 기존 파일 교체')
    group.add_argument('--rollback', action='store_true', help='백업에서 기존 파일 복원')
    parser.add_argument('--dry-run', action='store_true', help='실제 변경 없이 변경될 내용만 출력')
    parser.add_argument('--verbose', action='store_true', help='상세 로그 출력')

    args = parser.parse_args()

    print(f"{'[DRY RUN] ' if args.dry_run else ''}파일 {'교체' if args.apply else '복원'} 시작...")

    if args.apply:
        success_count = apply_rename(args.dry_run, args.verbose)
    else:
        success_count = rollback_rename(args.dry_run, args.verbose)

    print(f"\n처리 완료:")
    print(f"  성공적으로 처리된 파일: {success_count}/{len(TARGET_FILES)}")
    print(f"  {'테스트 모드로 실행됨 (실제 변경 없음)' if args.dry_run else '모든 변경사항이 적용됨'}")

    if success_count != len(TARGET_FILES):
        print("\n경고: 일부 파일이 처리되지 않았습니다. 로그를 확인하세요.")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
