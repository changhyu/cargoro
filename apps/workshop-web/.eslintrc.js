module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@next/next/recommended',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn', // error에서 warn으로 변경
    'no-console': 'warn',
    'react/prop-types': 'off', // Next.js에서는 TypeScript를 사용하므로 비활성화
    'react/display-name': 'off', // Next.js 컴포넌트에서는 종종 필요하지 않음
    '@typescript-eslint/no-empty-object-type': 'warn', // 빈 인터페이스 경고로 변경
    'no-useless-escape': 'warn', // 불필요한 이스케이프 경고로 변경
    '@typescript-eslint/no-require-imports': 'warn', // require 사용 경고로 변경
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      // 테스트 파일에 대한 규칙 완화
      files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
