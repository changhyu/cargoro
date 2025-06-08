import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      'http://localhost:8000/graphql': {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    },
    // 개발 환경에서 스키마 파일을 직접 사용하는 경우
    './schema.graphql',
  ],
  documents: ['src/**/*.tsx', 'src/**/*.ts', 'hooks/**/*.ts', 'core/**/*.ts', '!src/gql/**/*'],
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: [],
      config: {
        useTypeImports: true,
        documentMode: 'string',
      },
    },
    './src/gql/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        useTypeImports: true,
        skipTypename: false,
        withHooks: false,
        withComponent: false,
        withHOC: false,
      },
    },
    './src/gql/react-query.ts': {
      plugins: ['typescript-react-query'],
      config: {
        fetcher: {
          endpoint: 'http://localhost:8000/graphql',
          fetchParams: {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        },
        exposeFetcher: true,
        exposeQueryKeys: true,
        exposeDocument: true,
        errorType: 'Error',
        useTypeImports: true,
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
};

export default config;
