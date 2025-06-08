# 폰트 설정 가이드

## 1. 폰트 구성

CarGoro 프로젝트는 다음 폰트를 사용합니다:

- **주 폰트**: Pretendard (한글/영문 모두 지원)
- **보조 폰트**: Noto Sans KR (한글 전용)
- **영문 폰트**: Inter
- **코드 폰트**: SF Mono, Fira Code

## 2. 폰트 다운로드 및 설치

### 자동 설치 (권장)

```bash
# 스크립트 실행 권한 부여
chmod +x scripts/download-fonts.sh

# 폰트 다운로드 및 설치
./scripts/download-fonts.sh
```

### 수동 설치

1. [Pretendard 다운로드](https://github.com/orioncactus/pretendard/releases)
2. 다운로드한 폰트를 각 앱의 `public/fonts/` 디렉토리에 복사
3. woff2와 woff 형식 사용 권장

## 3. CSS 설정

### Global CSS (`packages/ui/app/styles/globals.css`)

```css
/* 폰트 임포트 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

/* Pretendard 로컬 폰트 */
@font-face {
  font-family: 'Pretendard';
  font-weight: 400;
  font-display: swap;
  src:
    local('Pretendard Regular'),
    url('/fonts/Pretendard-Regular.woff2') format('woff2'),
    url('/fonts/Pretendard-Regular.woff') format('woff');
}
```

### Tailwind 설정

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'system-ui', 'sans-serif'],
        pretendard: ['Pretendard', 'sans-serif'],
        noto: ['Noto Sans KR', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
};
```

## 4. 사용 방법

### HTML/JSX에서 사용

```jsx
// 기본 폰트 (Pretendard 자동 적용)
<p className="text-base">안녕하세요</p>

// 특정 폰트 지정
<h1 className="font-pretendard">Pretendard 폰트</h1>
<p className="font-noto">Noto Sans KR 폰트</p>
<span className="font-inter">Inter Font</span>

// 폰트 굵기
<p className="font-light">가벼운 텍스트 (300)</p>
<p className="font-normal">일반 텍스트 (400)</p>
<p className="font-medium">중간 텍스트 (500)</p>
<p className="font-semibold">세미볼드 텍스트 (600)</p>
<p className="font-bold">굵은 텍스트 (700)</p>
```

### CSS에서 사용

```css
.custom-text {
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
}
```

## 5. 최적화 팁

### 1. 폰트 서브셋 사용

한글 폰트는 용량이 크므로, 실제 사용하는 글자만 포함된 서브셋을 만들어 사용하면 좋습니다.

### 2. Preload 사용

```html
<link
  rel="preload"
  href="/fonts/Pretendard-Regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

### 3. Font Display 설정

```css
@font-face {
  font-display: swap; /* 폰트 로딩 중 시스템 폰트 표시 */
}
```

## 6. 문제 해결

### 폰트가 적용되지 않는 경우

1. 브라우저 개발자 도구에서 네트워크 탭 확인
2. 폰트 파일 경로가 올바른지 확인
3. CORS 설정 확인 (crossorigin 속성)

### 한글이 깨지는 경우

1. 폰트 파일 인코딩 확인
2. @font-face unicode-range 설정 확인
3. 폰트 파일 무결성 확인

### 폰트 로딩이 느린 경우

1. 폰트 파일 크기 최적화 (서브셋 사용)
2. CDN 사용 고려
3. font-display: swap 사용

## 7. 라이선스

- **Pretendard**: SIL Open Font License 1.1
- **Noto Sans KR**: SIL Open Font License 1.1
- **Inter**: SIL Open Font License 1.1

모든 폰트는 상업적 사용이 가능합니다.
