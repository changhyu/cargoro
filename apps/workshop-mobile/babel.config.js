export default {
  presets: ['module:metro-react-native-babel-preset', '@babel/preset-typescript'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
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
