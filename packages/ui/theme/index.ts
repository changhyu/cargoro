import './theme.css';

// theme-provider에서 ThemeProvider를 내보내고, use-theme.ts 파일에서 useTheme을 내보내도록 변경
export { ThemeProvider } from './theme-provider';
export { useTheme } from './use-theme';

// ThemeProviderContext는 두 모듈에서 모두 필요하므로 그대로 내보냅니다
export { ThemeProviderContext } from './theme-provider';
