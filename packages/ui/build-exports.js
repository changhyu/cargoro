#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 컴포넌트 디렉토리 목록
const componentDirs = [
  'accordion',
  'alert',
  'alert-dialog',
  'avatar',
  'badge',
  'breadcrumb',
  'button',
  'calendar',
  'card',
  'checkbox',
  'combobox',
  'confirm-dialog',
  'data-table',
  'date-range-picker',
  'dialog',
  'drawer',
  'dropdown-menu',
  'empty-state',
  'error-boundary',
  'file-uploader',
  'form',
  'input',
  'label',
  'loading-spinner',
  'modal',
  'pagination',
  'popover',
  'progress',
  'radio-group',
  'scroll-area',
  'search-filter',
  'select',
  'skeleton',
  'slider',
  'status-badge',
  'switch',
  'table',
  'tabs',
  'tag',
  'textarea',
  'timeline',
  'toast',
  'tooltip',
  'vehicle-card',
];

// index.ts 내용 생성
let indexContent = `/**
 * UI 패키지 - 자동 생성된 export 파일
 * 
 * 이 파일은 build-exports.js 스크립트에 의해 자동 생성됩니다.
 * 직접 수정하지 마세요.
 */

`;

// 각 컴포넌트의 export 추가
componentDirs.forEach(dir => {
  const componentPath = path.join(__dirname, 'components', dir);
  const componentFile = path.join(componentPath, `${dir}.tsx`);

  if (fs.existsSync(componentFile)) {
    indexContent += `export * from './components/${dir}/${dir}';\n`;
  }
});

// 특별한 경우 처리
indexContent += `
// Forms
export * from './components/forms/form';

// Hooks
export { useToast } from './components/use-toast/use-toast';

// Toast 관련
export { Toaster } from './components/toast/toaster';

// Spinner
export { Spinner } from './components/spinner';

// Separator
export { Separator } from './components/separator';

// Utils
export * from './utils';

// Hooks (중복 제거)
export {
  createAppStore,
  useAppState,
  useAuth,
  useGlobalTheme,
  useStore,
  useStoreSelector,
  StoreProvider,
  useStoreInitialized,
} from './hooks';
`;

// index.ts 파일 작성
fs.writeFileSync(path.join(__dirname, 'index.ts'), indexContent);

console.log('✅ index.ts 파일이 성공적으로 생성되었습니다.');
