import { describe, it, expect } from 'vitest';
import { validators } from '../../src/utils/validators';

describe('validators 테스트', () => {
  describe('isEmail', () => {
    it('유효한 이메일을 검증해야 함', () => {
      expect(validators.isEmail('test@example.com')).toBe(true);
      expect(validators.isEmail('user.name@company.co.kr')).toBe(true);
      expect(validators.isEmail('test+tag@example.com')).toBe(true);
    });

    it('유효하지 않은 이메일을 거부해야 함', () => {
      expect(validators.isEmail('invalid.email')).toBe(false);
      expect(validators.isEmail('@example.com')).toBe(false);
      expect(validators.isEmail('test@')).toBe(false);
      expect(validators.isEmail('test @example.com')).toBe(false);
      expect(validators.isEmail('')).toBe(false);
    });
  });

  describe('isPhoneNumber', () => {
    it('유효한 한국 전화번호를 검증해야 함', () => {
      expect(validators.isPhoneNumber('010-1234-5678')).toBe(true);
      expect(validators.isPhoneNumber('01012345678')).toBe(true);
      expect(validators.isPhoneNumber('011-123-4567')).toBe(true);
      expect(validators.isPhoneNumber('019-1234-5678')).toBe(true);
    });

    it('유효하지 않은 전화번호를 거부해야 함', () => {
      expect(validators.isPhoneNumber('02-1234-5678')).toBe(false);
      expect(validators.isPhoneNumber('010-12-5678')).toBe(false);
      expect(validators.isPhoneNumber('010-1234-567')).toBe(false);
      expect(validators.isPhoneNumber('1234567890')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('강한 비밀번호를 검증해야 함', () => {
      expect(validators.isStrongPassword('Test123!')).toBe(true);
      expect(validators.isStrongPassword('MyP@ssw0rd')).toBe(true);
      expect(validators.isStrongPassword('Secure#Pass123')).toBe(true);
    });

    it('약한 비밀번호를 거부해야 함', () => {
      expect(validators.isStrongPassword('password')).toBe(false);
      expect(validators.isStrongPassword('12345678')).toBe(false);
      expect(validators.isStrongPassword('Test123')).toBe(false); // 특수문자 없음
      expect(validators.isStrongPassword('test123!')).toBe(false); // 대문자 없음
      expect(validators.isStrongPassword('TEST123!')).toBe(false); // 소문자 없음
      expect(validators.isStrongPassword('TestPass!')).toBe(false); // 숫자 없음
      expect(validators.isStrongPassword('Short1!')).toBe(false); // 너무 짧음
    });
  });

  describe('isValidUrl', () => {
    it('유효한 URL을 검증해야 함', () => {
      expect(validators.isValidUrl('https://example.com')).toBe(true);
      expect(validators.isValidUrl('http://localhost:3000')).toBe(true);
      expect(validators.isValidUrl('https://www.example.com/path?query=value')).toBe(true);
      expect(validators.isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('유효하지 않은 URL을 거부해야 함', () => {
      expect(validators.isValidUrl('not a url')).toBe(false);
      expect(validators.isValidUrl('example.com')).toBe(false);
      expect(validators.isValidUrl('//example.com')).toBe(false);
      expect(validators.isValidUrl('')).toBe(false);
    });
  });

  describe('isValidCreditCard', () => {
    it('유효한 신용카드 번호를 검증해야 함 (Luhn 알고리즘)', () => {
      expect(validators.isValidCreditCard('4532015112830366')).toBe(true); // Visa
      expect(validators.isValidCreditCard('5425233430109903')).toBe(true); // Mastercard
      expect(validators.isValidCreditCard('374245455400126')).toBe(true); // Amex
      expect(validators.isValidCreditCard('4532-0151-1283-0366')).toBe(true); // 하이픈 포함
    });

    it('유효하지 않은 신용카드 번호를 거부해야 함', () => {
      expect(validators.isValidCreditCard('1234567890123456')).toBe(false);
      expect(validators.isValidCreditCard('4532015112830367')).toBe(false); // 잘못된 체크섬
      expect(validators.isValidCreditCard('123')).toBe(false); // 너무 짧음
      expect(validators.isValidCreditCard('12345678901234567890')).toBe(false); // 너무 김
      expect(validators.isValidCreditCard('')).toBe(false);
    });
  });
});
