#!/usr/bin/env python3
"""
파이썬 파일의 camelCase를 snake_case로 변환하는 스크립트
"""
import os
import re
import argparse
import subprocess
from typing import List, Set, Tuple


def camel_to_snake(name: str) -> str:
    """camelCase 변수명을 snake_case로 변환합니다."""
    name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()


def find_camel_case_vars(content: str) -> Set[str]:
    """Python 파일에서 camelCase 변수를 찾습니다."""
    # 클래스 속성, 변수 선언, 함수 파라미터 등에서 camelCase 패턴 찾기
    camel_pattern = r'\b[a-z][a-z0-9]*[A-Z][a-zA-Z0-9]*\b'
    camel_vars = set(re.findall(camel_pattern, content))

    # 일부 특수 문자열 제외 (로깅, 예약어 등)
    exclude_list = {
        'hasattr', 'getattr', 'setattr', 'isinstance', 'issubclass',
        'TypeError', 'ValueError', 'IndexError', 'KeyError', 'ImportError',
        'assertEqual', 'assertTrue', 'assertFalse', 'assertRaises',
        'setUp', 'tearDown', 'getLogger', 'fromtimestamp', 'fromordinal',
        'datetime', 'timedelta', 'strftime', 'strptime'
    }

    return {v for v in camel_vars if v not in exclude_list}


def process_file(file_path: str, output_path: str = None, dry_run: bool = False) -> Tuple[int, List[str]]:
    """
    Python 파일의 camelCase 변수를 snake_case로 변환합니다.

    Args:
        file_path: 처리할 파일 경로
        output_path: 출력 파일 경로 (None이면 '_new' 접미사 추가)
        dry_run: True면 변경사항을 적용하지 않고 출력만 함

    Returns:
        변경된 변수 수와 변경된 변수 목록의 튜플
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        print(f"ERROR: {file_path} 파일을 읽을 수 없습니다 (인코딩 오류)")
        return 0, []

    # camelCase 변수 찾기
    camel_vars = find_camel_case_vars(content)
    if not camel_vars:
        print(f"No camelCase variables found in {file_path}")
        return 0, []

    # 변수명 변환 매핑 생성
    conversion_map = {var: camel_to_snake(var) for var in camel_vars}

    # 변경사항 적용
    new_content = content
    for camel, snake in conversion_map.items():
        # 단순 치환 방지를 위한 패턴 (변수명 앞뒤에 경계가 있는지 확인)
        pattern = r'\b' + re.escape(camel) + r'\b'
        new_content = re.sub(pattern, snake, new_content)

    if dry_run:
        print(f"\nFound {len(camel_vars)} camelCase variables in {file_path}:")
        for camel, snake in conversion_map.items():
            print(f"  {camel} -> {snake}")
        return len(camel_vars), list(conversion_map.keys())

    # 출력 파일 경로 결정
    if not output_path:
        name, ext = os.path.splitext(file_path)
        output_path = f"{name}_new{ext}"

    # 변환된 내용 저장
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Converted {len(camel_vars)} variables in {file_path}")
    print(f"Output saved to {output_path}")

    return len(camel_vars), list(conversion_map.keys())


def process_directory(directory: str, extensions: List[str] = None, recursive: bool = True,
                      output_dir: str = None, dry_run: bool = False) -> Tuple[int, int]:
    """
    디렉토리 내의 모든 Python 파일을 처리합니다.

    Args:
        directory: 처리할 디렉토리 경로
        extensions: 처리할 파일 확장자 목록 (기본값: ['.py'])
        recursive: 하위 디렉토리까지 처리할지 여부
        output_dir: 출력 디렉토리 경로 (None이면 원본 위치에 '_new' 접미사 추가)
        dry_run: True면 변경사항을 적용하지 않고 출력만 함

    Returns:
        처리된 파일 수와 변경된 변수 수의 튜플
    """
    if extensions is None:
        extensions = ['.py']

    total_files = 0
    total_vars = 0

    for root, dirs, files in os.walk(directory):
        if not recursive and root != directory:
            continue

        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                file_path = os.path.join(root, file)

                # 출력 파일 경로 결정
                if output_dir:
                    rel_path = os.path.relpath(file_path, directory)
                    output_path = os.path.join(output_dir, rel_path)
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                else:
                    output_path = None

                # 파일 처리
                num_vars, _ = process_file(file_path, output_path, dry_run)
                if num_vars > 0:
                    total_files += 1
                    total_vars += num_vars

    return total_files, total_vars


def main():
    parser = argparse.ArgumentParser(description='Python 파일의 camelCase를 snake_case로 변환합니다.')
    parser.add_argument('path', help='처리할 파일 또는 디렉토리 경로')
    parser.add_argument('-o', '--output', help='출력 파일 또는 디렉토리 경로')
    parser.add_argument('-r', '--recursive', action='store_true', help='하위 디렉토리까지 처리')
    parser.add_argument('-e', '--extensions', nargs='+', default=['.py'], help='처리할 파일 확장자 (기본값: .py)')
    parser.add_argument('-d', '--dry-run', action='store_true', help='변경사항을 적용하지 않고 출력만 함')

    args = parser.parse_args()

    if os.path.isfile(args.path):
        process_file(args.path, args.output, args.dry_run)
    elif os.path.isdir(args.path):
        total_files, total_vars = process_directory(
            args.path, args.extensions, args.recursive, args.output, args.dry_run
        )
        print(f"\n총 {total_files}개 파일에서 {total_vars}개 변수 변환됨")
    else:
        print(f"ERROR: {args.path}는 유효한 파일 또는 디렉토리가 아닙니다.")


if __name__ == "__main__":
    main()
