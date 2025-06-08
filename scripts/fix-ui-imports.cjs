#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 파일 확장자
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// 제외할 디렉토리
const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'coverage'];

// 건식 실행 모드 (테스트용)
const DRY_RUN = process.argv.includes('--dry-run');

// 파일을 찾는 함수
function findFiles(dir, files = []) {
  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);

      try {
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!excludeDirs.includes(item)) {
            findFiles(fullPath, files);
          }
        } else if (extensions.some(ext => fullPath.endsWith(ext))) {
          files.push(fullPath);
        }
      } catch (error) {
        console.warn(`⚠️  Cannot access ${fullPath}: ${error.message}`);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Cannot read directory ${dir}: ${error.message}`);
  }

  return files;
}

// import 구문을 분석하고 통합하는 함수
function consolidateImports(content) {
  const lines = content.split('\n');
  const cargoroUiImports = new Set();
  const filteredLines = [];
  let hasChanges = false;

  for (const line of lines) {
    // @cargoro/ui로 시작하는 모든 import 구문 찾기 (더 정확한 패턴)
    const importMatch = line.match(
      /import\s+({[^}]+}|[^{}\s]+|\*\s+as\s+\w+)\s+from\s+['"]@cargoro\/ui['"];?/
    );

    if (importMatch) {
      hasChanges = true;
      const importPart = importMatch[1].trim();

      if (importPart.startsWith('{') && importPart.endsWith('}')) {
        // Named imports: { Button, Card }
        const imports = importPart
          .slice(1, -1)
          .split(',')
          .map(imp => imp.trim())
          .filter(imp => imp);
        imports.forEach(imp => cargoroUiImports.add(imp));
      } else if (importPart.includes('*')) {
        // Namespace import: * as UI
        filteredLines.push(`import * as UI from '@cargoro/ui';`);
        continue;
      } else {
        // Default import
        filteredLines.push(`import ${importPart} from '@cargoro/ui';`);
        continue;
      }
    } else {
      filteredLines.push(line);
    }
  }

  // 통합된 import 구문 생성
  if (cargoroUiImports.size > 0) {
    const sortedImports = Array.from(cargoroUiImports).sort();
    let consolidatedImport;

    if (sortedImports.length <= 3) {
      consolidatedImport = `import { ${sortedImports.join(', ')} } from '@cargoro/ui';`;
    } else {
      consolidatedImport = `import {\n  ${sortedImports.join(',\n  ')}\n} from '@cargoro/ui';`;
    }

    // React import 다음에 삽입하거나 맨 앞에 삽입
    const reactImportIndex = filteredLines.findIndex(
      line =>
        line.includes('import React') ||
        (line.includes('import {') && line.includes("} from 'react'"))
    );

    if (reactImportIndex !== -1) {
      filteredLines.splice(reactImportIndex + 1, 0, consolidatedImport);
    } else {
      // 첫 번째 import 구문 위치 찾기
      const firstImportIndex = filteredLines.findIndex(line => line.trim().startsWith('import '));
      if (firstImportIndex !== -1) {
        filteredLines.splice(firstImportIndex, 0, consolidatedImport);
      } else {
        filteredLines.unshift(consolidatedImport);
      }
    }
  }

  return {
    content: filteredLines.join('\n'),
    hasChanges,
  };
}

// 파일 내용을 변경하는 함수
function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');

    // @cargoro/ui 관련 내용이 없으면 스킵
    if (!originalContent.includes('@cargoro/ui')) {
      return false;
    }

    let content = originalContent;
    let changed = false;

    // 1단계: 잘못된 패턴들을 먼저 수정 (더 정확한 패턴 사용)
    const patterns = [
      // 깨진 형태들 수정 (공백 없이 붙어있는 것들) - 더 정확한 패턴
      {
        from: /from\s+['"]@cargoro\/ui([a-z][a-zA-Z]*)\b(?![/'])/g,
        to: "from '@cargoro/ui'",
      },
      // 중복된 경로들 정리
      {
        from: /from\s+['"]@cargoro\/ui\/ui['"]/g,
        to: "from '@cargoro/ui'",
      },
      // 컴포넌트 개별 경로들을 통합 경로로 변경
      {
        from: /from\s+['"]@cargoro\/ui\/components\/[^'"]+['"]/g,
        to: "from '@cargoro/ui'",
      },
      {
        from: /from\s+['"]@cargoro\/ui\/component\/[^'"]+['"]/g,
        to: "from '@cargoro/ui'",
      },
      // 기타 서브패스들 (hooks, utils 등)
      {
        from: /from\s+['"]@cargoro\/ui\/hooks['"]/g,
        to: "from '@cargoro/ui'",
      },
      {
        from: /from\s+['"]@cargoro\/ui\/utils['"]/g,
        to: "from '@cargoro/ui'",
      },
      // 남은 서브패스들 (단, @cargoro/ui만 있는 것은 제외)
      {
        from: /from\s+['"]@cargoro\/ui\/[^'"]+['"]/g,
        to: "from '@cargoro/ui'",
      },
    ];

    for (const pattern of patterns) {
      const beforeReplace = content;
      content = content.replace(pattern.from, pattern.to);
      if (content !== beforeReplace) {
        changed = true;
      }
    }

    // 2단계: import 구문 통합 (중복된 @cargoro/ui imports가 있는 경우)
    const { content: consolidatedContent, hasChanges: consolidationChanges } =
      consolidateImports(content);
    content = consolidatedContent;
    changed = changed || consolidationChanges;

    if (changed) {
      if (DRY_RUN) {
        console.log(`📋 Would update: ${filePath}`);

        // 변경 사항 미리보기 (처음 5개 변경사항만)
        const originalLines = originalContent.split('\n');
        const newLines = content.split('\n');

        console.log('  Changes preview:');
        let changeCount = 0;
        for (
          let i = 0;
          i < Math.max(originalLines.length, newLines.length) && changeCount < 5;
          i++
        ) {
          if (originalLines[i] !== newLines[i]) {
            if (originalLines[i]) console.log(`    - ${originalLines[i]}`);
            if (newLines[i]) console.log(`    + ${newLines[i]}`);
            changeCount++;
          }
        }
        if (changeCount === 5) {
          console.log('    ... (more changes)');
        }
        console.log('');
      } else {
        // 백업 생성
        const backupPath = `${filePath}.backup`;
        fs.writeFileSync(backupPath, originalContent, 'utf8');

        // 변경된 내용 저장
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// 메인 실행 함수
function main() {
  const rootDir = '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root';

  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No files will be modified');
  }

  console.log('🔍 Finding files with @cargoro/ui imports...');

  const files = findFiles(rootDir);
  console.log(`📁 Found ${files.length} files to check`);

  let processedCount = 0;
  const processedFiles = [];

  for (const file of files) {
    if (processFile(file)) {
      processedCount++;
      processedFiles.push(file);
    }
  }

  console.log(`\n✨ Complete! ${DRY_RUN ? 'Would process' : 'Processed'} ${processedCount} files`);

  if (!DRY_RUN && processedCount > 0) {
    console.log('\n📝 Processed files:');
    processedFiles.forEach(file => console.log(`  - ${file}`));
    console.log('\n💡 Backup files created with .backup extension');
    console.log('💡 Run "find . -name "*.backup" -delete" to remove backups after verification');
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}
