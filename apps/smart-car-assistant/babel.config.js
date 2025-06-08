module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@app': './app',
          '@pages': './app/pages',
          '@components': './app/components',
          '@features': './app/features',
          '@hooks': './app/hooks',
          '@state': './app/state',
          '@services': './app/services',
          '@constants': './app/constants',
          '@tests': './tests',
        },
      },
    ],
  ],
};
