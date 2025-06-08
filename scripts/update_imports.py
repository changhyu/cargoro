#!/usr/bin/env python3
"""
임포트 참조 업데이트 스크립트

이 스크립트는 리팩토링된 모듈에 대한 임포트 참조를 업데이트합니다.
기존 모듈(예: driver.py)에서 새 모듈(예: driver_new.py)로 임포트 참조를 변경합니다.

사용법:
  python update_imports.py --dir=/path/to/backend [--dry-run] [--verbose]
  python update_imports.py --file=/path/to/specific/file.py [--dry-run] [--verbose]
  python update_imports.py --restore --dir=/path/to/backend [--dry-run] [--verbose]

옵션:
  --dir         대상 디렉토리 경로 (재귀적으로 모든 .py 파일 처리)
  --file        특정 파일 경로 (단일 파일만 처리)
  --dry-run     실제 변경 없이 변경될 내용만 출력
  --restore     원래 임포트 참조로 복원 (파일명 교체 후 실행)
  --verbose     상세 로그 출력
"""

import os
import re
import argparse
import sys
from typing import List, Tuple, Dict


# 변환 규칙 정의: (검색 패턴, 교체 패턴)
IMPORT_PATTERNS = [
    # Fleet API 모델
    (r'from\s+\.\.models\.driver\s+import', r'from ..models.driver_new import'),
    (r'from\s+\.\.models\.vehicle\s+import', r'from ..models.vehicle_new import'),
    (r'from\s+\.\.models\.driver_performance\s+import', r'from ..models.driver_performance_new import'),
    (r'from\s+\.\.models\.maintenance\s+import', r'from ..models.maintenance_new import'),

    # Fleet API 라우터
    (r'from\s+\.\.routes\.driver_routes\s+import', r'from ..routes.driver_routes_new import'),
    (r'from\s+\.\.routes\.vehicle_routes\s+import', r'from ..routes.vehicle_routes_new import'),
    (r'from\s+\.\.routes\.driver_performance_routes\s+import', r'from ..routes.driver_performance_routes_new import'),
    (r'from\s+\.\.routes\.maintenance_routes\s+import', r'from ..routes.maintenance_routes_new import'),
    (r'from\s+\.\.routes\.driving_record_routes\s+import', r'from ..routes.driving_record_routes_new import'),
    (r'from\s+\.\.routes\.lease_routes\s+import', r'from ..routes.lease_routes_new import'),

    # Parts API
    (r'from\s+\.\.models\.erp_sync\s+import', r'from ..models.erp_sync_new import'),
    (r'from\s+\.\.routes\.erp_sync_routes\s+import', r'from ..routes.erp_sync_routes_new import'),

    # 절대 경로 임포트
    (r'from\s+backend\.services\.fleet_api\.lib\.models\.driver\s+import', r'from backend.services.fleet_api.lib.models.driver_new import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.models\.vehicle\s+import', r'from backend.services.fleet_api.lib.models.vehicle_new import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.models\.driver_performance\s+import', r'from backend.services.fleet_api.lib.models.driver_performance_new import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.models\.maintenance\s+import', r'from backend.services.fleet_api.lib.models.maintenance_new import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.routes\.driver_routes\s+import', r'from backend.services.fleet_api.lib.routes.driver_routes_new import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.routes\.vehicle_routes\s+import', r'from backend.services.fleet_api.lib.routes.vehicle_routes_new import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.routes\.driver_performance_routes\s+import', r'from backend.services.fleet_api.lib.routes.driver_performance_routes_new import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.routes\.maintenance_routes\s+import', r'from backend.services.fleet_api.lib.routes.maintenance_routes_new import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.routes\.driving_record_routes\s+import', r'from backend.services.fleet_api.lib.routes.driving_record_routes_new import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.routes\.lease_routes\s+import', r'from backend.services.fleet_api.lib.routes.lease_routes_new import'),
    (r'from\s+backend\.services\.parts_api\.lib\.models\.erp_sync\s+import', r'from backend.services.parts_api.lib.models.erp_sync_new import'),
    (r'from\s+backend\.services\.parts_api\.lib\.routes\.erp_sync_routes\s+import', r'from backend.services.parts_api.lib.routes.erp_sync_routes_new import'),
]

# 복원 패턴: 전환 완료 후 사용
RESTORE_PATTERNS = [
    # Fleet API 모델
    (r'from\s+\.\.models\.driver_new\s+import', r'from ..models.driver import'),
    (r'from\s+\.\.models\.vehicle_new\s+import', r'from ..models.vehicle import'),
    (r'from\s+\.\.models\.driver_performance_new\s+import', r'from ..models.driver_performance import'),
    (r'from\s+\.\.models\.maintenance_new\s+import', r'from ..models.maintenance import'),

    # Fleet API 라우터
    (r'from\s+\.\.routes\.driver_routes_new\s+import', r'from ..routes.driver_routes import'),
    (r'from\s+\.\.routes\.vehicle_routes_new\s+import', r'from ..routes.vehicle_routes import'),
    (r'from\s+\.\.routes\.driver_performance_routes_new\s+import', r'from ..routes.driver_performance_routes import'),
    (r'from\s+\.\.routes\.maintenance_routes_new\s+import', r'from ..routes.maintenance_routes import'),
    (r'from\s+\.\.routes\.driving_record_routes_new\s+import', r'from ..routes.driving_record_routes import'),
    (r'from\s+\.\.routes\.lease_routes_new\s+import', r'from ..routes.lease_routes import'),

    # Parts API
    (r'from\s+\.\.models\.erp_sync_new\s+import', r'from ..models.erp_sync import'),
    (r'from\s+\.\.routes\.erp_sync_routes_new\s+import', r'from ..routes.erp_sync_routes import'),

    # 절대 경로 임포트
    (r'from\s+backend\.services\.fleet_api\.lib\.models\.driver_new\s+import', r'from backend.services.fleet_api.lib.models.driver import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.models\.vehicle_new\s+import', r'from backend.services.fleet_api.lib.models.vehicle import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.models\.driver_performance_new\s+import', r'from backend.services.fleet_api.lib.models.driver_performance import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.models\.maintenance_new\s+import', r'from backend.services.fleet_api.lib.models.maintenance import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.routes\.driver_routes_new\s+import', r'from backend.services.fleet_api.lib.routes.driver_routes import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.routes\.vehicle_routes_new\s+import', r'from backend.services.fleet_api.lib.routes.vehicle_routes import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.routes\.driver_performance_routes_new\s+import', r'from backend.services.fleet_api.lib.routes.driver_performance_routes import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.routes\.maintenance_routes_new\s+import', r'from backend.services.fleet_api.lib.routes.maintenance_routes import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.routes\.driving_record_routes_new\s+import', r'from backend.services.fleet_api.lib.routes.driving_record_routes import'),
    (r'from\s+backend\.services\.fleet_api\.lib\.routes\.lease_routes_new\s+import', r'from backend.services.fleet_api.lib.routes.lease_routes import'),
    (r'from\s+backend\.services\.parts_api\.lib\.models\.erp_sync_new\s+import', r'from backend.services.parts_api.lib.models.erp_sync import'),
    (r'from\s+backend\.services\.parts_api\.lib\.routes\.erp_sync_routes_new\s+import', r'from backend.services.parts_api.lib.routes.erp_sync_routes import'),
]


def update_file_imports(file_path: str, patterns: List[Tuple[str, str]],
                        dry_run: bool = False, verbose: bool = False) -> Dict[str, int]:
    """
    파일의 임포트 참조를 업데이트합니다.

    Args:
        file_path: 업데이트할 파일 경로
        patterns: (검색 패턴, 교체 패턴) 목록
        dry_run: True이면 실제 변경 없이 변경될 내용만 출력
        verbose: True이면 상세 로그 출력

    Returns:
        변경 통계 딕셔너리 {'updated_files': int, 'total_changes': int}
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
    except Exception as e:
        print(f"오류: {file_path} 파일을 읽을 수 없습니다. {str(e)}")
        return {'updated_files': 0, 'total_changes': 0}

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
        try:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            if verbose:
                print(f"✅ {file_path} 파일 업데이트 완료 ({changes_count}개 변경)")
        except Exception as e:
            print(f"오류: {file_path} 파일을 쓸 수 없습니다. {str(e)}")
            return {'updated_files': 0, 'total_changes': 0}

    # 변경사항 통계 반환
    return {
        'updated_files': 1 if changes_count > 0 else 0,
        'total_changes': changes_count
    }


def process_directory(directory: str, patterns: List[Tuple[str, str]],
                     dry_run: bool = False, verbose: bool = False) -> Dict[str, int]:
    """
    디렉토리 내의 모든 Python 파일을 처리합니다.

    Args:
        directory: 처리할 디렉토리 경로
        patterns: (검색 패턴, 교체 패턴) 목록
        dry_run: True이면 실제 변경 없이 변경될 내용만 출력
        verbose: True이면 상세 로그 출력

    Returns:
        변경 통계 딕셔너리 {'updated_files': int, 'total_changes': int}
    """
    if not os.path.isdir(directory):
        print(f"오류: 디렉토리 '{directory}'가 존재하지 않습니다.")
        return {'updated_files': 0, 'total_changes': 0}

    stats = {'updated_files': 0, 'total_changes': 0}

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                file_stats = update_file_imports(file_path, patterns, dry_run, verbose)
                stats['updated_files'] += file_stats['updated_files']
                stats['total_changes'] += file_stats['total_changes']

    return stats


def main():
    parser = argparse.ArgumentParser(description='임포트 참조 업데이트 스크립트')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--dir', help='대상 디렉토리 경로')
    group.add_argument('--file', help='특정 파일 경로')
    parser.add_argument('--dry-run', action='store_true', help='실제 변경 없이 변경될 내용만 출력')
    parser.add_argument('--restore', action='store_true', help='원래 임포트 참조로 복원')
    parser.add_argument('--verbose', action='store_true', help='상세 로그 출력')

    args = parser.parse_args()

    # 사용할 패턴 선택
    patterns = RESTORE_PATTERNS if args.restore else IMPORT_PATTERNS

    print(f"{'[DRY RUN] ' if args.dry_run else ''}임포트 참조 {'복원' if args.restore else '업데이트'} 시작...")

    stats = {'updated_files': 0, 'total_changes': 0}

    if args.file:
        if not os.path.isfile(args.file):
            print(f"오류: 파일 '{args.file}'이 존재하지 않습니다.")
            return 1

        print(f"파일 처리 중: {args.file}")
        stats = update_file_imports(args.file, patterns, args.dry_run, args.verbose)
    else:
        print(f"디렉토리 처리 중: {args.dir}")
        stats = process_directory(args.dir, patterns, args.dry_run, args.verbose)

    print(f"\n처리 완료:")
    print(f"  업데이트된 파일: {stats['updated_files']}")
    print(f"  총 변경 횟수: {stats['total_changes']}")
    print(f"  {'테스트 모드로 실행됨 (실제 변경 없음)' if args.dry_run else '모든 변경사항이 적용됨'}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
