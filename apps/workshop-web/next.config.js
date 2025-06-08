/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Clerk 호환성을 위해 빌드 시 정적 생성 비활성화
  output: 'standalone',

  // 동적 렌더링 강제
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: [
      '@clerk/nextjs',
      'chartjs-node-canvas',
      'canvas',
      'server-only',
    ],
    // PPR을 비활성화하여 모든 페이지를 동적으로 렌더링
    ppr: false,
  },

  // webpack 설정
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 브라우저 번들에서 Node.js 전용 모듈 제외
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        canvas: false,
      };

      // chartjs-node-canvas를 브라우저 번들에서 제외
      config.externals = [
        ...(config.externals || []),
        'chartjs-node-canvas',
        'canvas',
        'puppeteer',
        'pdfkit',
      ];
    }
    return config;
  },

  // 모노레포 패키지 트랜스파일
  transpilePackages: [
    '@cargoro/auth',
    '@cargoro/ui',
    '@cargoro/types',
    '@cargoro/api-client',
    '@cargoro/utils',
    '@cargoro/reporting',
    'date-fns',
  ],

  // TypeScript 검사 활성화
  typescript: {
    ignoreBuildErrors: false, // TypeScript 오류를 빌드에서 체크
  },

  // ESLint 검사 활성화
  eslint: {
    ignoreDuringBuilds: false, // ESLint 오류를 빌드에서 체크
  },

  // 환경 변수 타입 안전성
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || '카고로 워크샵',
  },

  // 이미지 최적화
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
