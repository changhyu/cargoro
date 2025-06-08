/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@cargoro/ui', '@cargoro/utils', '@cargoro/auth'],
  eslint: {
    ignoreDuringBuilds: true, // ESLint 오류를 빌드 시 무시
  },
  typescript: {
    ignoreBuildErrors: true, // 타입 오류를 빌드 시 무시
  },
  experimental: {
    // 필요한 경우 실험 기능 활성화
    esmExternals: true,
  },
  // API 모킹 설정
  env: {
    NEXT_PUBLIC_MOCK_API: 'true',
  },
};

module.exports = nextConfig;
