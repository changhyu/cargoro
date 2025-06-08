## 프론트엔드 코드 일관성 검사 결과

실행일시: Sat May 24 21:12:49 KST 2025

### src/ 폴더 사용 현황

- src/ 폴더 사용 앱 수: 1
- 자세한 내용: [src_folders.txt](./src_folders.txt)

### 폴더 구조 일관성 이슈

- 폴더 구조 이슈 앱 수: 4
- 자세한 내용: [folder_structure_issues.txt](./folder_structure_issues.txt)

### TypeScript any 타입 사용 현황

- any 타입 사용 파일 수: 13
- 자세한 내용: [any_type_issues.txt](./any_type_issues.txt)

### 총평 및 권장 사항

- **src/ 폴더 제거 필요**: 1 개의 앱에서 src/ 폴더가 발견되었습니다. 개발 규칙에 따라 src/ 폴더 사용을 금지하고 App Router 구조를 따라야 합니다.
- **폴더 구조 일관성 개선 필요**: 4 개의 앱에서 폴더 구조 일관성 이슈가 발견되었습니다. 모든 앱은 동일한 폴더 구조와 순서를 따라야 합니다.
- **TypeScript any 타입 제거 필요**: 13 개의 파일에서 any 타입 사용이 발견되었습니다. 타입 안전성을 위해 any 타입 사용을 피하고 구체적인 타입을 정의해야 합니다.

## 다음 단계

1. src/ 폴더 제거 및 App Router 구조로 마이그레이션
2. 모든 앱에서 일관된 폴더 구조 및 순서 적용
3. any 타입을 구체적인 타입으로 대체
