#!/usr/bin/env python3

import os
import re

def fix_file(filepath):
    """파일의 문법 오류를 수정합니다."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. statusColors 객체 수정
    if 'statusColors' in content and '@cargoro/ui/' in content:
        content = re.sub(
            r"const statusColors = \{[^}]*\}",
            """const statusColors = {
  pending: 'bg-yellow-500',
  accepted: 'bg-blue-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-green-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-gray-500',
}""",
            content,
            flags=re.DOTALL
        )
    
    # 2. @cargoro/ui/components/* → @cargoro/ui 수정
    content = re.sub(r"from '@cargoro/ui/[^']*'", "from '@cargoro/ui'", content)
    
    # 3. import 문 뒤의 숨은 문자 제거
    # } from '...'; 다음에 바로 문자가 오는 경우
    content = re.sub(r"(}\s*from\s*['\"][^'\"]+['\"];)([^\n\s])", r"\1\n\2", content)
    
    # 4. 특수 문자 제거 (특히 0x01 같은 제어 문자)
    content = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', content)
    
    # 5. /button'; 같은 잘못된 줄 제거
    content = re.sub(r"^/[^/\n]*';\s*$", "", content, flags=re.MULTILINE)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ 수정됨: {filepath}")
        return True
    return False

def process_directory(directory):
    """디렉토리의 모든 TypeScript 파일을 처리합니다."""
    fixed_count = 0
    
    for root, dirs, files in os.walk(directory):
        # node_modules와 .next 폴더는 제외
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.next' in dirs:
            dirs.remove('.next')
        
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    fixed_count += 1
    
    return fixed_count

if __name__ == "__main__":
    print("🔧 Workshop-web 문법 오류 수정 중...")
    
    app_dir = "app"
    if os.path.exists(app_dir):
        fixed = process_directory(app_dir)
        print(f"\n✅ 총 {fixed}개 파일 수정 완료!")
    else:
        print(f"❌ {app_dir} 디렉토리를 찾을 수 없습니다.")
