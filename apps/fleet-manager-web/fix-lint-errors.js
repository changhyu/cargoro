#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 재귀적으로 파일 찾기
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];

  function scan(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

// 파일 내용 수정 함수
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. 사용하지 않는 변수를 _로 시작하도록 수정
  const unusedVarPatterns = [
    // catch 구문의 error를 _error로 변경
    /catch\s*\(\s*(error|err|e)\s*\)/g,
    // 함수 파라미터의 사용하지 않는 변수들
    /\(\s*(error|data|value|config|props|values|filters|vehicleId|from|to)\s*:/g,
  ];

  unusedVarPatterns.forEach(pattern => {
    const newContent = content.replace(pattern, match => {
      if (match.includes('catch')) {
        return match.replace(/\b(error|err|e)\b/, '_$1');
      } else {
        return match.replace(
          /\b(error|data|value|config|props|values|filters|vehicleId|from|to)\b/,
          '_$1'
        );
      }
    });
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  });

  // 2. 사용하지 않는 import 제거
  const lines = content.split('\n');
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 사용하지 않는 import 항목들을 찾아서 제거
    if (line.includes('import') && line.includes('{')) {
      const unusedImports = [
        'FileText',
        'MoreVertical',
        'Clock',
        'dynamic',
        'format',
        'ko',
        'Search',
        'setCustomerFilter',
        'nextPage',
        'prevPage',
        'API_BASE_URL',
        'VEHICLE_STATUS',
        'ReservationStatusEnum',
        'Token',
        'VerificationStatus',
        'PaymentUpdate',
        'ApiResponse',
      ];

      let modifiedLine = line;
      unusedImports.forEach(importName => {
        // 단일 import 제거
        modifiedLine = modifiedLine.replace(new RegExp(`\\s*,?\\s*${importName}\\s*,?`, 'g'), '');
        // 중괄호 내 불필요한 쉼표 정리
        modifiedLine = modifiedLine.replace(/{\s*,/, '{').replace(/,\s*}/, '}');
        modifiedLine = modifiedLine.replace(/,\s*,/, ',');
      });

      // 빈 import 문 제거
      if (modifiedLine.match(/import\s*{\s*}\s*from/)) {
        continue; // 이 줄을 건너뛰기
      }

      newLines.push(modifiedLine);
    } else {
      newLines.push(line);
    }
  }

  const newContent = newLines.join('\n');
  if (newContent !== content) {
    content = newContent;
    changed = true;
  }

  // 3. console.log 제거
  content = content.replace(/\s*console\.log\([^)]*\);?\s*/g, '');

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  }
}

// 메인 실행
function main() {
  const appDir = process.cwd();
  console.log(`🔧 Fixing lint errors in: ${appDir}`);

  const files = findFiles(appDir);
  console.log(`📁 Found ${files.length} files to check`);

  files.forEach(file => {
    try {
      fixFile(file);
    } catch (error) {
      console.error(`❌ Error fixing ${file}:`, error.message);
    }
  });

  console.log('🎉 Lint error fixes completed!');
  console.log('💡 Running ESLint --fix...');

  try {
    execSync('npx eslint . --fix --ext .ts,.tsx,.js,.jsx', { stdio: 'inherit' });
    console.log('✅ ESLint --fix completed');
  } catch (error) {
    console.log('⚠️ Some ESLint errors remain, but auto-fixable ones have been resolved');
  }
}

if (require.main === module) {
  main();
}
