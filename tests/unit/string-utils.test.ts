import { describe, it, expect } from 'vitest';
import { stringUtils } from '../../src/utils/string-date';

describe('stringUtils 테스트', () => {
  describe('toCamelCase', () => {
    it('문자열을 카멜케이스로 변환해야 함', () => {
      expect(stringUtils.toCamelCase('hello world')).toBe('helloWorld');
      expect(stringUtils.toCamelCase('Hello World')).toBe('helloWorld');
      expect(stringUtils.toCamelCase('hello-world')).toBe('helloWorld');
      expect(stringUtils.toCamelCase('hello_world')).toBe('helloWorld');
    });

    it('한 단어는 소문자로 시작해야 함', () => {
      expect(stringUtils.toCamelCase('Hello')).toBe('hello');
      expect(stringUtils.toCamelCase('HELLO')).toBe('hello');
    });
  });

  describe('toSnakeCase', () => {
    it('문자열을 스네이크케이스로 변환해야 함', () => {
      expect(stringUtils.toSnakeCase('helloWorld')).toBe('hello_world');
      expect(stringUtils.toSnakeCase('HelloWorld')).toBe('hello_world');
      expect(stringUtils.toSnakeCase('hello world')).toBe('hello_world');
      expect(stringUtils.toSnakeCase('hello-world')).toBe('hello_world');
    });
  });

  describe('toKebabCase', () => {
    it('문자열을 케밥케이스로 변환해야 함', () => {
      expect(stringUtils.toKebabCase('helloWorld')).toBe('hello-world');
      expect(stringUtils.toKebabCase('HelloWorld')).toBe('hello-world');
      expect(stringUtils.toKebabCase('hello world')).toBe('hello-world');
      expect(stringUtils.toKebabCase('hello_world')).toBe('hello-world');
    });
  });

  describe('toPascalCase', () => {
    it('문자열을 파스칼케이스로 변환해야 함', () => {
      expect(stringUtils.toPascalCase('hello world')).toBe('HelloWorld');
      expect(stringUtils.toPascalCase('hello-world')).toBe('HelloWorld');
      expect(stringUtils.toPascalCase('hello_world')).toBe('HelloWorld');
      expect(stringUtils.toPascalCase('helloWorld')).toBe('HelloWorld');
    });
  });

  describe('reverse', () => {
    it('문자열을 뒤집어야 함', () => {
      expect(stringUtils.reverse('hello')).toBe('olleh');
      expect(stringUtils.reverse('12345')).toBe('54321');
      expect(stringUtils.reverse('가나다')).toBe('다나가');
      expect(stringUtils.reverse('')).toBe('');
    });
  });

  describe('isPalindrome', () => {
    it('회문을 판별해야 함', () => {
      expect(stringUtils.isPalindrome('racecar')).toBe(true);
      expect(stringUtils.isPalindrome('A man a plan a canal Panama')).toBe(true);
      expect(stringUtils.isPalindrome('12321')).toBe(true);
      expect(stringUtils.isPalindrome('')).toBe(true);
    });

    it('회문이 아닌 것을 판별해야 함', () => {
      expect(stringUtils.isPalindrome('hello')).toBe(false);
      expect(stringUtils.isPalindrome('12345')).toBe(false);
    });
  });

  describe('countWords', () => {
    it('단어 수를 세어야 함', () => {
      expect(stringUtils.countWords('hello world')).toBe(2);
      expect(stringUtils.countWords('  hello   world  ')).toBe(2);
      expect(stringUtils.countWords('one')).toBe(1);
      expect(stringUtils.countWords('')).toBe(0);
      expect(stringUtils.countWords('   ')).toBe(0);
    });
  });

  describe('stripHtmlTags', () => {
    it('HTML 태그를 제거해야 함', () => {
      expect(stringUtils.stripHtmlTags('<p>Hello</p>')).toBe('Hello');
      expect(stringUtils.stripHtmlTags('<div>Hello <b>World</b></div>')).toBe('Hello World');
      expect(stringUtils.stripHtmlTags('No tags here')).toBe('No tags here');
      expect(stringUtils.stripHtmlTags('')).toBe('');
    });
  });

  describe('padStart', () => {
    it('문자열 앞에 패딩을 추가해야 함', () => {
      expect(stringUtils.padStart('5', 3, '0')).toBe('005');
      expect(stringUtils.padStart('hello', 10)).toBe('     hello');
      expect(stringUtils.padStart('test', 6, 'x')).toBe('xxtest');
    });

    it('이미 충분한 길이면 그대로 반환해야 함', () => {
      expect(stringUtils.padStart('hello', 3)).toBe('hello');
      expect(stringUtils.padStart('hello', 5)).toBe('hello');
    });

    it('긴 채움 문자열도 처리해야 함', () => {
      expect(stringUtils.padStart('hi', 5, 'abc')).toBe('abchi');
    });
  });

  describe('slugify', () => {
    it('URL 슬러그를 생성해야 함', () => {
      expect(stringUtils.slugify('Hello World!')).toBe('hello-world');
      expect(stringUtils.slugify('  Hello   World  ')).toBe('hello-world');
      expect(stringUtils.slugify('Hello@#$World')).toBe('helloworld');
      expect(stringUtils.slugify('안녕 세계')).toBe('안녕-세계');
      expect(stringUtils.slugify('test__test')).toBe('test-test');
    });
  });
});
