module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-transform-private-methods', { loose: false }],
      ['@babel/plugin-transform-class-properties', { loose: false }],
      ['@babel/plugin-transform-private-property-in-object', { loose: false }],
      'react-native-reanimated/plugin',
      [
        '@babel/plugin-transform-runtime',
        {
          helpers: true,
          regenerator: true,
          corejs: false,
          useESModules: false,
          absoluteRuntime: false,
        },
      ],
    ],
  };
};
