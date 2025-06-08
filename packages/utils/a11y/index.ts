/**
 * 접근성(a11y) 검사를 위한 유틸리티 함수
 * WCAG AA 준수 목표에 따라 개발 환경에서만 자동으로 접근성 이슈를 감지합니다.
 */
import React from 'react';

export const initAxe = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const axe = await import('@axe-core/react');
      const ReactDOM = await import('react-dom');

      axe.default(React, ReactDOM, 1000, {
        rules: [
          // WCAG AA 준수 규칙 설정
          { id: 'color-contrast', enabled: true }, // 색상 대비
          { id: 'label', enabled: true }, // 폼 레이블
          { id: 'aria-required-attr', enabled: true }, // ARIA 필수 속성
          { id: 'aria-roles', enabled: true }, // ARIA 역할
          { id: 'image-alt', enabled: true }, // 이미지 대체 텍스트
        ],
      });

      console.log('접근성(a11y) 검사가 활성화되었습니다. 개발 모드에서만 적용됩니다.');
    } catch (error) {
      console.error('접근성(a11y) 검사 초기화 실패:', error);
    }
  }
};

/**
 * 색상 대비 검사를 위한 유틸리티 함수
 * @param foreground 전경색 (HEX 코드)
 * @param background 배경색 (HEX 코드)
 * @returns 색상 대비 비율 (AA 기준: 텍스트 4.5:1, 큰 텍스트 3:1)
 */
export const checkColorContrast = (foreground: string, background: string): number => {
  // 색상을 RGB로 변환
  const hexToRgb = (hex: string): number[] => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const formattedHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);

    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };

  // 상대적 휘도 계산
  const getLuminance = (rgb: number[]): number => {
    const [r, g, b] = rgb.map(value => {
      value /= 255;
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const rgb1 = hexToRgb(foreground);
  const rgb2 = hexToRgb(background);

  const luminance1 = getLuminance(rgb1);
  const luminance2 = getLuminance(rgb2);

  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);

  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
};

/**
 * 키보드 접근성 검사를 위한 키 이벤트 핸들러
 */
export const setupKeyboardNavTracker = (): void => {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;

  const handleFirstTab = (e: KeyboardEvent): void => {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');

      window.removeEventListener('keydown', handleFirstTab);
      window.addEventListener('mousedown', handleMouseDownOnce);
    }
  };

  const handleMouseDownOnce = (): void => {
    document.body.classList.remove('user-is-tabbing');

    window.removeEventListener('mousedown', handleMouseDownOnce);
    window.addEventListener('keydown', handleFirstTab);
  };

  window.addEventListener('keydown', handleFirstTab);
};
