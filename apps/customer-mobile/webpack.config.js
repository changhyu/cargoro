const createExpoWebpackConfigAsync = require('@expo/webpack-config');

// Suppress webpack-dev-server deprecation warnings
const originalWarning = process.emitWarning;
process.emitWarning = (warning, type, code) => {
  if (code === 'DEP_WEBPACK_DEV_SERVER_CONSTRUCTOR' || code === 'DEP_WEBPACK_DEV_SERVER_LISTEN') {
    return;
  }
  return originalWarning.call(process, warning, type, code);
};

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      mode: env.mode || 'development',
    },
    argv
  );

  // webpack dev server 설정 업데이트 - deprecation warning 해결
  if (config.devServer) {
    const originalDevServer = { ...config.devServer };

    config.devServer = {
      ...originalDevServer,
      // 최신 webpack-dev-server API 사용
      static: originalDevServer.contentBase
        ? {
            directory: originalDevServer.contentBase,
            publicPath: originalDevServer.publicPath || '/',
          }
        : {
            directory: 'web',
            publicPath: '/',
          },
      // 새로운 API 사용
      compress: true,
      hot: true,
      historyApiFallback: true,
      // deprecated 옵션들 제거
      disableHostCheck: undefined,
      // 최신 설정
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };

    // deprecated 옵션들 제거
    delete config.devServer.contentBase;
    delete config.devServer.disableHostCheck;
  }

  // webpack 설정 최적화
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve?.fallback,
      // Node.js 모듈들에 대한 fallback 설정
      crypto: false,
      stream: false,
      fs: false,
      path: false,
    },
  };

  return config;
};
