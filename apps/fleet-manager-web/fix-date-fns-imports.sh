#!/bin/bash

# date-fns import 수정 스크립트
# import { format , ko } from 'date-fns'; -> import { format } from 'date-fns'; import { ko } from 'date-fns/locale';

echo "Fixing date-fns imports..."

# 모든 TypeScript/JavaScript 파일에서 date-fns import 수정
find . -name "*.ts" -o -name "*.tsx" | while read file; do
  # format , ko 패턴 수정
  if grep -q "import.*format.*,.*ko.*from 'date-fns'" "$file"; then
    echo "Fixing: $file"
    # macOS sed 사용
    sed -i '' "s/import { format , ko } from 'date-fns';/import { format } from 'date-fns';\nimport { ko } from 'date-fns\/locale';/g" "$file"
  fi
  
  # format, ko 패턴 수정 (공백 없음)
  if grep -q "import.*format.*,ko.*from 'date-fns'" "$file"; then
    echo "Fixing: $file"
    sed -i '' "s/import { format, ko } from 'date-fns';/import { format } from 'date-fns';\nimport { ko } from 'date-fns\/locale';/g" "$file"
  fi
  
  # parseISO , ko 패턴 수정
  if grep -q "import.*parseISO.*,.*ko.*from 'date-fns'" "$file"; then
    echo "Fixing: $file"
    sed -i '' "s/import { format, parseISO , ko } from 'date-fns';/import { format, parseISO } from 'date-fns';\nimport { ko } from 'date-fns\/locale';/g" "$file"
  fi
done

echo "Date-fns imports fixed!"
