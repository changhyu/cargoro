#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 변경할 패턴들 - 더 구체적인 패턴 사용
const patterns = [
  {
    // @cargoro/ui/components/specific-component -> @cargoro/ui (import 구문에서만)
    from: /from\s+['"]@cargoro\/ui\/components\/[^'"]+['"]/g,
    to: "from '@cargoro/ui'"
  },
  {
    // @cargoro/ui/lib/utils -> @cargoro/ui (import 구문에서만) 
    from: /from\s+['"]@cargoro\/ui\/lib\/utils['"]/g,
    to: "from '@cargoro/ui'"
  }
];

// 파일 확장자
const extensions = ['.ts', '.tsx'];

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

// import 구문을 통합하는 함수
function consolidateImports(content) {
  const lines = content.split('\n');
  const cargoroUiImports = new Set();
  const filteredLines = [];
  
  for (const line of lines) {
    // @cargoro/ui에서 import하는 라인 찾기
    const match = line.match(/import\s+{([^}]+)}\s+from\s+['"]@cargoro\/ui['"]/);
    if (match) {
      // import 항목들을 Set에 추가
      const imports = match[1].split(',').map(imp => imp.trim());
      imports.forEach(imp => cargoroUiImports.add(imp));
    } else {
      filteredLines.push(line);
    }
  }

  // 통합된 import 구문 생성
  if (cargoroUiImports.size > 0) {
    const sortedImports = Array.from(cargoroUiImports).sort();
    const consolidatedImport = `import {\n  ${sortedImports.join(',\n  ')},\n} from '@cargoro/ui';`;
    
    // React import 다음에 삽입하거나 맨 앞에 삽입
    const reactImportIndex = filteredLines.findIndex(line => 
      line.includes("import React") || line.includes("import {") && line.includes("} from 'react'")
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

  return filteredLines.join('\n');
}

// 파일 내용을 변경하는 함수
function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;
    let changed = false;

    // 패턴 교체
    for (const pattern of patterns) {
      const beforeReplace = content;
      content = content.replace(pattern.from, pattern.to);
      if (content !== beforeReplace) {
        changed = true;
      }
    }

    // @cargoro/ui import가 여러 개 있으면 통합
    const uiImportCount = (content.match(/from\s+['"]@cargoro\/ui['"]/g) || []).length;
    if (changed && uiImportCount > 1) {
      content = consolidateImports(content);
    }

    if (changed) {
      if (DRY_RUN) {
        console.log(`📋 Would update: ${filePath}`);
        
        // 변경 사항 미리보기
        const originalLines = originalContent.split('\n');
        const newLines = content.split('\n');
        
        console.log('  Changes:');
        for (let i = 0; i < Math.max(originalLines.length, newLines.length); i++) {
          if (originalLines[i] !== newLines[i]) {
            if (originalLines[i]) console.log(`    - ${originalLines[i]}`);
            if (newLines[i]) console.log(`    + ${newLines[i]}`);
          }
        }
        console.log('');
      } else {
        // 백업 생성
        const backupPath = `${filePath}.backup`;
        fs.writeFileSync(backupPath, originalContent, 'utf8');
        
        // 변경된 내용 저장
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath} (backup: ${backupPath})`);
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
  
  console.log('🔍 Finding TypeScript files...');

  const files = findFiles(rootDir);
  console.log(`📁 Found ${files.length} TypeScript files`);

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
