module.exports = {
  // TypeScript 파일은 eslint와 prettier를 통해 검사
  '**/*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  // JavaScript 파일도 eslint와 prettier를 통해 검사
  '**/*.{js,jsx}': ['eslint --fix', 'prettier --write'],
  // JSON 및 기타 파일은 prettier로만 포맷팅
  '**/*.{json,css,md,yml,yaml}': ['prettier --write'],
};
