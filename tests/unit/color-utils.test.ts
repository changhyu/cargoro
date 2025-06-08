import { describe, it, expect } from 'vitest';
import { colorUtils } from '../../src/utils/color-file';

describe('colorUtils 테스트', () => {
  describe('hexToRgb', () => {
    it('HEX를 RGB로 변환해야 함', () => {
      expect(colorUtils.hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(colorUtils.hexToRgb('00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(colorUtils.hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
      expect(colorUtils.hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(colorUtils.hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('잘못된 HEX는 null을 반환해야 함', () => {
      expect(colorUtils.hexToRgb('invalid')).toBeNull();
      expect(colorUtils.hexToRgb('#12345')).toBeNull();
      expect(colorUtils.hexToRgb('')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('RGB를 HEX로 변환해야 함', () => {
      expect(colorUtils.rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(colorUtils.rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(colorUtils.rgbToHex(0, 0, 255)).toBe('#0000ff');
      expect(colorUtils.rgbToHex(255, 255, 255)).toBe('#ffffff');
      expect(colorUtils.rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('범위를 벗어난 값은 클램핑해야 함', () => {
      expect(colorUtils.rgbToHex(300, -50, 128)).toBe('#ff0080');
      expect(colorUtils.rgbToHex(255.7, 128.5, 0.2)).toBe('#ff8100'); // Math.round(128.5) = 129
    });
  });

  describe('rgbToHsl', () => {
    it('RGB를 HSL로 변환해야 함', () => {
      const red = colorUtils.rgbToHsl(255, 0, 0);
      expect(red).toEqual({ h: 0, s: 100, l: 50 });

      const white = colorUtils.rgbToHsl(255, 255, 255);
      expect(white).toEqual({ h: 0, s: 0, l: 100 });

      const black = colorUtils.rgbToHsl(0, 0, 0);
      expect(black).toEqual({ h: 0, s: 0, l: 0 });

      const gray = colorUtils.rgbToHsl(128, 128, 128);
      expect(gray.s).toBe(0);
      expect(gray.l).toBeCloseTo(50, 0);
    });
  });

  describe('hslToRgb', () => {
    it('HSL을 RGB로 변환해야 함', () => {
      expect(colorUtils.hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
      expect(colorUtils.hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 });
      expect(colorUtils.hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 });
      expect(colorUtils.hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 });
      expect(colorUtils.hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  describe('adjustBrightness', () => {
    it('색상 밝기를 조정해야 함', () => {
      expect(colorUtils.adjustBrightness('#808080', 50)).toBe('#c0c0c0');
      expect(colorUtils.adjustBrightness('#808080', -50)).toBe('#404040');
      expect(colorUtils.adjustBrightness('#FF0000', 0)).toBe('#ff0000');
    });

    it('잘못된 HEX는 원본을 반환해야 함', () => {
      expect(colorUtils.adjustBrightness('invalid', 50)).toBe('invalid');
    });

    it('범위를 벗어나지 않도록 클램핑해야 함', () => {
      expect(colorUtils.adjustBrightness('#FFFFFF', 100)).toBe('#ffffff');
      expect(colorUtils.adjustBrightness('#000000', -100)).toBe('#000000');
    });
  });

  describe('getLuminance', () => {
    it('색상의 명도를 계산해야 함', () => {
      expect(colorUtils.getLuminance('#FFFFFF')).toBeCloseTo(1, 2);
      expect(colorUtils.getLuminance('#000000')).toBeCloseTo(0, 2);
      expect(colorUtils.getLuminance('#FF0000')).toBeCloseTo(0.2126, 2);
    });

    it('잘못된 HEX는 0을 반환해야 함', () => {
      expect(colorUtils.getLuminance('invalid')).toBe(0);
    });
  });

  describe('getContrastColor', () => {
    it('적절한 대비 색상을 반환해야 함', () => {
      expect(colorUtils.getContrastColor('#FFFFFF')).toBe('#000000');
      expect(colorUtils.getContrastColor('#000000')).toBe('#ffffff');
      expect(colorUtils.getContrastColor('#808080')).toBe('#ffffff');
    });
  });

  describe('isValidHex', () => {
    it('유효한 HEX 색상을 판별해야 함', () => {
      expect(colorUtils.isValidHex('#FF0000')).toBe(true);
      expect(colorUtils.isValidHex('FF0000')).toBe(true);
      expect(colorUtils.isValidHex('#F00')).toBe(true);
      expect(colorUtils.isValidHex('F00')).toBe(true);
    });

    it('유효하지 않은 HEX를 거부해야 함', () => {
      expect(colorUtils.isValidHex('#GGGGGG')).toBe(false);
      expect(colorUtils.isValidHex('#12345')).toBe(false);
      expect(colorUtils.isValidHex('##FF0000')).toBe(false);
      expect(colorUtils.isValidHex('')).toBe(false);
    });
  });

  describe('randomHex', () => {
    it('유효한 랜덤 HEX 색상을 생성해야 함', () => {
      const color = colorUtils.randomHex();
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(colorUtils.isValidHex(color)).toBe(true);
    });

    it('매번 다른 색상을 생성해야 함', () => {
      const colors = new Set();
      for (let i = 0; i < 10; i++) {
        colors.add(colorUtils.randomHex());
      }
      expect(colors.size).toBeGreaterThan(1);
    });
  });
});
