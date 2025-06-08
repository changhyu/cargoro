const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');
const { createMetroConfig } = require('../../packages/utils/metro-config-helper');
const fs = require('fs');

const projectRoot = __dirname;
const monoRepoRoot = path.resolve(__dirname, '../..');

// 기본 Expo 구성을 가져옵니다
const defaultConfig = getDefaultConfig(projectRoot);

// 19001 포트로 설정하여 다른 모바일 앱과 충돌하지 않도록 함
const config = createMetroConfig(projectRoot, 19001, {
  // 이 앱에만 필요한 추가 모듈 매핑이 있다면 여기에 추가
});

// 확인: @babel/runtime/helpers/interopRequireDefault.js가 있는지 확인
const localBabelRuntimePath = path.resolve(projectRoot, 'node_modules/@babel/runtime');
const monoRepoBabelRuntimePath = path.resolve(monoRepoRoot, 'node_modules/@babel/runtime');

// @babel/runtime/helpers/interopRequireDefault.js가 없으면 생성합니다
const interopRequireDefaultPath = path.resolve(
  localBabelRuntimePath,
  'helpers/interopRequireDefault.js'
);
if (!fs.existsSync(interopRequireDefaultPath)) {
  console.log('Creating missing interopRequireDefault.js file...');
  if (!fs.existsSync(path.dirname(interopRequireDefaultPath))) {
    fs.mkdirSync(path.dirname(interopRequireDefaultPath), { recursive: true });
  }
  fs.writeFileSync(
    interopRequireDefaultPath,
    'module.exports = function(obj) { return obj && obj.__esModule ? obj : { default: obj }; };'
  );
}

// @expo/metro-config의 기본 설정을 병합합니다
config.resolver = {
  ...defaultConfig.resolver,
  ...config.resolver,
  extraNodeModules: {
    ...config.resolver?.extraNodeModules,
    '@babel/runtime': localBabelRuntimePath,
  },
  // 모듈 검색 경로에 모노레포 root의 node_modules도 추가
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monoRepoRoot, 'node_modules'),
  ],
};

// 심볼릭 링크 활성화 - 모노레포에서 작업하는 경우 필요
config.resolver.disableHierarchicalLookup = false;
config.resolver.resolverMainFields = ['react-native', 'browser', 'module', 'main'];
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(monoRepoRoot, 'node_modules'),
  path.resolve(monoRepoRoot, 'packages'),
];

// 추가 변환 무시 파일 지정
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

module.exports = config;
