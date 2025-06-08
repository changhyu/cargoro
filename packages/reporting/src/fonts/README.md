# 한글 폰트 설정 가이드

PDF 보고서에서 한글을 올바르게 표시하기 위해서는 한글 폰트를 설정해야 합니다.

## 1. 폰트 파일 준비

다음 중 하나의 폰트를 다운로드하세요:

### 무료 폰트 (상업적 사용 가능)

- **Noto Sans KR** (추천)

  - 다운로드: https://fonts.google.com/noto/specimen/Noto+Sans+KR
  - 라이선스: Open Font License
  - 파일명: NotoSansKR-Regular.ttf, NotoSansKR-Bold.ttf

- **나눔고딕**

  - 다운로드: https://hangeul.naver.com/font
  - 라이선스: Open Font License
  - 파일명: NanumGothic.ttf, NanumGothicBold.ttf

- **Pretendard**
  - 다운로드: https://github.com/orioncactus/pretendard
  - 라이선스: Open Font License
  - 파일명: Pretendard-Regular.ttf, Pretendard-Bold.ttf

## 2. 폰트 파일 설치

1. 다운로드한 폰트 파일을 `packages/reporting/src/fonts/` 디렉토리에 복사합니다.

   ```bash
   cp ~/Downloads/NotoSansKR-Regular.ttf packages/reporting/src/fonts/
   cp ~/Downloads/NotoSansKR-Bold.ttf packages/reporting/src/fonts/
   ```

2. `font-loader.ts` 파일에서 폰트 경로를 확인합니다:
   ```typescript
   const fontPath = path.join(__dirname, 'NotoSansKR-Regular.ttf');
   ```

## 3. 사용 방법

PDF 생성기는 자동으로 한글 폰트를 로드합니다:

```typescript
// PDF 생성 시 자동으로 한글 폰트가 로드됩니다
const pdfGenerator = new PDFGenerator(options);
const buffer = await pdfGenerator.generate();
```

## 4. 웹 환경에서 사용

웹 환경에서는 폰트 파일을 Base64로 인코딩하여 사용해야 합니다:

1. 폰트를 Base64로 변환:

   ```bash
   base64 -i NotoSansKR-Regular.ttf -o NotoSansKR-Regular.base64.txt
   ```

2. 변환된 Base64 문자열을 `font-loader.ts`에 직접 포함하거나 별도 파일로 관리

## 5. 주의사항

- 폰트 파일 크기가 크므로 (보통 1-5MB) 빌드 크기에 영향을 줄 수 있습니다.
- 웹 환경에서는 폰트 로딩 시간이 필요합니다.
- 라이선스를 확인하고 상업적 사용이 가능한 폰트를 선택하세요.

## 6. 문제 해결

### 한글이 깨져서 나오는 경우

- 폰트 파일이 올바른 위치에 있는지 확인
- 폰트 파일명이 코드와 일치하는지 확인
- 콘솔에 폰트 로드 관련 에러가 있는지 확인

### 폰트가 적용되지 않는 경우

- jsPDF가 지원하는 폰트 형식인지 확인 (TTF 권장)
- 폰트 파일이 손상되지 않았는지 확인

## 7. 대안: 서버사이드 렌더링

더 안정적인 한글 처리를 위해 다음 방법을 고려할 수 있습니다:

1. **Puppeteer + Chrome**

   - HTML을 렌더링한 후 PDF로 변환
   - 시스템 폰트 사용 가능
   - 더 정확한 레이아웃

2. **wkhtmltopdf**

   - HTML to PDF 변환 도구
   - 한글 폰트 지원 우수

3. **ReportLab (Python)**
   - Python 기반 PDF 생성
   - 한글 폰트 처리 안정적
