#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dynamicConfig = `// 이 라우트를 항상 동적으로 렌더링
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

`;

function addDynamicToRoute(filePath) {
  if (filePath.endsWith('.bak')) return;

  const content = fs.readFileSync(filePath, 'utf-8');

  // 이미 dynamic 설정이 있는지 확인
  if (content.includes('export const dynamic')) {
    console.log(`Skipping ${filePath} - already has dynamic config`);
    return;
  }

  // import 문들을 찾아서 그 다음에 추가
  const importRegex = /^((?:import[\s\S]*?from\s+['"][^'"]+['"];?\s*)+)/m;
  const match = content.match(importRegex);

  if (match) {
    const imports = match[1];
    const restOfFile = content.slice(match.index + imports.length);
    const newContent = imports + '\n' + dynamicConfig + restOfFile;

    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated ${filePath}`);
  } else {
    // import가 없으면 파일 맨 앞에 추가
    const newContent = dynamicConfig + content;
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated ${filePath} (no imports found)`);
  }
}

// API 디렉토리의 모든 route.ts 파일 찾기
function findRouteFiles(dir) {
  const files = fs.readdirSync(dir);
  const routeFiles = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      routeFiles.push(...findRouteFiles(fullPath));
    } else if (file === 'route.ts' && !file.endsWith('.bak')) {
      routeFiles.push(fullPath);
    }
  }

  return routeFiles;
}

const apiDir = path.join(__dirname, '../apps/workshop-web/app/api');
const routeFiles = findRouteFiles(apiDir);

console.log(`Found ${routeFiles.length} route.ts files`);

for (const file of routeFiles) {
  addDynamicToRoute(file);
}

console.log('Done!');
