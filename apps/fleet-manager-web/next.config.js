const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // pnpm의 심볼릭 링크 문제 해결
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: path.resolve(__dirname, '../../node_modules/react'),
        'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
        'react/jsx-runtime': path.resolve(__dirname, '../../node_modules/react/jsx-runtime'),
        'react/jsx-dev-runtime': path.resolve(
          __dirname,
          '../../node_modules/react/jsx-dev-runtime'
        ),
      };
    }

    return config;
  },
  transpilePackages: ['@cargoro/ui'],
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true, // 린트 오류를 일단 무시하고 빌드
    dirs: ['app', 'components', 'lib'],
  },
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['@clerk/nextjs'],
  },
  // 빌드 ID 생성
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // 프로덕션 빌드에서는 outputFileTracing을 활성화해야 함
  outputFileTracing: true,
  // standalone 출력 모드 설정
  output: 'standalone',
};

module.exports = nextConfig;
