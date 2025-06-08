const path = require('path');
const { createMetroConfig } = require('../../packages/utils/metro-config-helper');

const projectRoot = __dirname;

// 19004 포트로 설정하여 다른 모바일 앱과 충돌하지 않도록 함
const config = createMetroConfig(projectRoot, 19004, {
  // 이 앱에만 필요한 추가 모듈 매핑이 있다면 여기에 추가
});

module.exports = config;
