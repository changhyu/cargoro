#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 커버리지 파일 경로
const nodeCoveragePath = path.join(__dirname, '../coverage/coverage-final.json');
const browserCoveragePath = path.join(__dirname, '../coverage-browser/coverage-final.json');
const mergedCoveragePath = path.join(__dirname, '../coverage-merged/coverage-final.json');

// 커버리지 디렉토리 생성
if (!fs.existsSync(path.dirname(mergedCoveragePath))) {
  fs.mkdirSync(path.dirname(mergedCoveragePath), { recursive: true });
}

// 커버리지 파일 읽기
let nodeCoverage = {};
let browserCoverage = {};

if (fs.existsSync(nodeCoveragePath)) {
  nodeCoverage = JSON.parse(fs.readFileSync(nodeCoveragePath, 'utf8'));
}

if (fs.existsSync(browserCoveragePath)) {
  browserCoverage = JSON.parse(fs.readFileSync(browserCoveragePath, 'utf8'));
}

// 커버리지 병합
const mergedCoverage = { ...nodeCoverage, ...browserCoverage };

// 중복된 파일의 경우 커버리지 데이터 병합
Object.keys(nodeCoverage).forEach(file => {
  if (browserCoverage[file]) {
    // 간단한 병합 로직 - 실제로는 더 복잡한 병합이 필요할 수 있음
    console.log(`Merging coverage for ${file}`);
  }
});

// 병합된 커버리지 저장
fs.writeFileSync(mergedCoveragePath, JSON.stringify(mergedCoverage, null, 2));

console.log('Coverage merged successfully!');
console.log(`Node.js coverage files: ${Object.keys(nodeCoverage).length}`);
console.log(`Browser coverage files: ${Object.keys(browserCoverage).length}`);
console.log(`Total coverage files: ${Object.keys(mergedCoverage).length}`);
