#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath =
  '/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/apps/fleet-manager-web/app/state/rental-store.ts';

// 파일 읽기
let content = fs.readFileSync(filePath, 'utf8');

// import 순서 수정
const newImports = `import { create } from 'zustand';

import { devtools, persist } from 'zustand/middleware';

import type {
  RentalContract,
  LeaseContract,
  Customer,
  Vehicle,
  Reservation,
  Payment,
} from '../types/rental.types';`;

// 기존 import 부분을 새로운 것으로 교체
content = content.replace(
  /import { create } from 'zustand';\nimport { devtools, persist } from 'zustand\/middleware';\nimport type \{[\s\S]*?\} from '\.\.\/types\/rental\.types';/,
  newImports
);

// 모든 catch (error) => catch (_error)로 변경
content = content.replace(/catch \(error\)/g, 'catch (_error)');

// 파일 쓰기
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ rental-store.ts 파일이 수정되었습니다.');
