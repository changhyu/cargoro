// ESLint 설정 - React Native (Expo) 프로젝트용
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React 관련 규칙
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',

    // TypeScript 관련 규칙
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',

    // 콘솔 사용 제한
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // TypeScript가 처리하는 규칙들
    'no-undef': 'off',

    // 빈 인터페이스 허용 (React Navigation 등에서 사용)
    '@typescript-eslint/no-empty-object-type': 'off',
  },
  overrides: [
    {
      // TypeScript 파일에 대한 특별한 규칙
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off', // TypeScript가 이미 처리함
      },
    },
  ],
  // 린트 검사에서 제외할 파일/디렉토리 - 가장 중요!
  ignorePatterns: [
    // 빌드 결과물 - 절대로 린트하지 않음
    'web-build/',
    'web-build/**',
    'build/',
    'dist/',
    '.expo/',

    // 의존성
    'node_modules/',

    // 설정 파일들
    '*.config.js',
    '*.config.ts',
    'babel.config.js',
    'metro.config.js',

    // 네이티브 빌드
    'ios/',
    'android/',

    // 기타
    'coverage/',
    '*.min.js',
    '*.bundle.js',
    '*.map',
  ],
};
