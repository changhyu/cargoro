const webpack = require('webpack');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer, dev }) {
    // 서버 사이드에서 문제가 되는 모듈들을 무시
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@clerk/shared/logger': 'commonjs @clerk/shared/logger',
        '@clerk/shared/utils': 'commonjs @clerk/shared/utils',
        '@clerk/shared/apiUrlFromPublishableKey': 'commonjs @clerk/shared/apiUrlFromPublishableKey',
        '@clerk/shared/telemetry': 'commonjs @clerk/shared/telemetry',
        '@clerk/shared/retry': 'commonjs @clerk/shared/retry',
        '@clerk/shared/jwtPayloadParser': 'commonjs @clerk/shared/jwtPayloadParser',
      });
    }

    // Clerk을 위한 설정을 수정합니다
    // Clerk 내부에서 사용하는 Next.js 모듈을 외부 모듈로 처리합니다
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        'next/navigation': require.resolve('next/dist/client/components/navigation'),
        'next/headers': require.resolve('next/dist/client/components/headers'),
        'next/compat/router': require.resolve('next/dist/shared/lib/router/adapters'),
        // React 컨텍스트 관련 오류 해결을 위한 설정
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      },
      alias: {
        ...(config.resolve.alias || {}),
        // Clerk 관련 alias 제거 - 프리렌더링 문제 해결
      },
    };

    // 모노레포 구조에서 외부 모듈 처리를 위한 설정
    if (!isServer) {
      // 절대 경로로 변환
      const packagesDir = path.resolve(__dirname, '../../packages');

      // 모노레포 구조에서 packages 디렉토리 내 모듈 파일 확인
      config.resolve.modules = [
        ...config.resolve.modules,
        path.resolve(__dirname, '../../'),
        path.resolve(__dirname, '../../node_modules'),
      ];
    }

    // 개발 모드에서 캐시 최적화
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        compression: 'gzip',
      };
    }

    // 모노레포 설정
    config.resolve.symlinks = true;

    return config;
  },

  // 모노레포 패키지 트랜스파일
  transpilePackages: [
    '@cargoro/auth',
    '@cargoro/ui',
    '@cargoro/types',
    '@cargoro/api-client',
    '@cargoro/utils',
    'date-fns',
  ],

  // TypeScript 검사 활성화
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint 검사 활성화
  eslint: {
    ignoreDuringBuilds: false,
  },

  // 환경 변수 타입 안전성
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || '카고로 어드민',
  },

  // 개발 서버 최적화
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // Next.js 정적 내보내기 완전 비활성화
  output: 'standalone',

  // 정적 데이터 생성 비활성화
  staticPageGenerationTimeout: 1000,

  // Clerk 관련 실험적 설정
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['@clerk/nextjs', '@clerk/shared'],
  },
};

module.exports = nextConfig;
