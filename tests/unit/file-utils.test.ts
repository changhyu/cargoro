import { describe, it, expect, vi } from 'vitest';
import { fileUtils } from '../../src/utils/color-file';

describe('fileUtils 테스트', () => {
  describe('formatFileSize', () => {
    it('파일 크기를 올바르게 포맷팅해야 함', () => {
      expect(fileUtils.formatFileSize(0)).toBe('0 Bytes');
      expect(fileUtils.formatFileSize(1023)).toBe('1023 Bytes');
      expect(fileUtils.formatFileSize(1024)).toBe('1 KB');
      expect(fileUtils.formatFileSize(1536)).toBe('1.5 KB');
      expect(fileUtils.formatFileSize(1048576)).toBe('1 MB');
      expect(fileUtils.formatFileSize(1073741824)).toBe('1 GB');
      expect(fileUtils.formatFileSize(1099511627776)).toBe('1 TB');
    });

    it('소수점을 2자리로 제한해야 함', () => {
      expect(fileUtils.formatFileSize(1234567)).toBe('1.18 MB');
      expect(fileUtils.formatFileSize(123456789)).toBe('117.74 MB');
    });
  });

  describe('getFileExtension', () => {
    it('파일 확장자를 추출해야 함', () => {
      expect(fileUtils.getFileExtension('document.pdf')).toBe('pdf');
      expect(fileUtils.getFileExtension('image.PNG')).toBe('png');
      expect(fileUtils.getFileExtension('archive.tar.gz')).toBe('gz');
      expect(fileUtils.getFileExtension('.gitignore')).toBe('gitignore');
    });

    it('확장자가 없으면 빈 문자열을 반환해야 함', () => {
      expect(fileUtils.getFileExtension('README')).toBe('');
      expect(fileUtils.getFileExtension('folder.')).toBe('');
      expect(fileUtils.getFileExtension('')).toBe('');
    });
  });

  describe('removeFileExtension', () => {
    it('파일명에서 확장자를 제거해야 함', () => {
      expect(fileUtils.removeFileExtension('document.pdf')).toBe('document');
      expect(fileUtils.removeFileExtension('image.png')).toBe('image');
      expect(fileUtils.removeFileExtension('archive.tar.gz')).toBe('archive.tar');
    });

    it('확장자가 없으면 원본을 반환해야 함', () => {
      expect(fileUtils.removeFileExtension('README')).toBe('README');
      expect(fileUtils.removeFileExtension('')).toBe('');
    });
  });

  describe('getFileType', () => {
    it('MIME 타입으로 파일 종류를 판별해야 함', () => {
      expect(fileUtils.getFileType('image/jpeg')).toBe('image');
      expect(fileUtils.getFileType('video/mp4')).toBe('video');
      expect(fileUtils.getFileType('audio/mpeg')).toBe('audio');
      expect(fileUtils.getFileType('text/plain')).toBe('text');
      expect(fileUtils.getFileType('application/pdf')).toBe('pdf');
      expect(fileUtils.getFileType('application/zip')).toBe('archive');
      expect(fileUtils.getFileType('application/x-tar')).toBe('archive');
      expect(fileUtils.getFileType('application/msword')).toBe('document');
      expect(fileUtils.getFileType('application/vnd.ms-excel')).toBe('spreadsheet');
      expect(fileUtils.getFileType('application/vnd.ms-powerpoint')).toBe('presentation');
    });

    it('알 수 없는 타입은 other를 반환해야 함', () => {
      expect(fileUtils.getFileType('application/octet-stream')).toBe('other');
      expect(fileUtils.getFileType('unknown/type')).toBe('other');
    });
  });

  describe('sanitizeFilename', () => {
    it('안전하지 않은 문자를 제거해야 함', () => {
      expect(fileUtils.sanitizeFilename('file<>name.txt')).toBe('file__name.txt');
      expect(fileUtils.sanitizeFilename('path/to/file.txt')).toBe('path_to_file.txt');
      expect(fileUtils.sanitizeFilename('file:name|test?.txt')).toBe('file_name_test_.txt');
    });

    it('연속된 점을 하나로 줄여야 함', () => {
      expect(fileUtils.sanitizeFilename('file...name.txt')).toBe('file.name.txt');
      expect(fileUtils.sanitizeFilename('..hidden')).toBe('hidden');
      expect(fileUtils.sanitizeFilename('file..')).toBe('file');
    });

    it('공백을 제거해야 함', () => {
      expect(fileUtils.sanitizeFilename('  file  name  ')).toBe('file  name');
    });
  });

  describe('toBase64', () => {
    it('파일을 Base64로 인코딩해야 함', async () => {
      const mockFile = new File(['Hello World'], 'test.txt', { type: 'text/plain' });
      const mockResult = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';

      // FileReader 모킹
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: mockResult,
      };

      global.FileReader = vi.fn(() => mockFileReader) as any;

      const promise = fileUtils.toBase64(mockFile);

      // onload 콜백 실행
      mockFileReader.onload();

      const result = await promise;
      expect(result).toBe(mockResult);
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    });

    it('에러 발생 시 reject되어야 함', async () => {
      const mockFile = new File([''], 'test.txt');
      const mockError = new Error('Read error');

      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as any,
        onerror: null as any,
      };

      global.FileReader = vi.fn(() => mockFileReader) as any;

      const promise = fileUtils.toBase64(mockFile);

      // onerror 콜백 실행
      mockFileReader.onerror(mockError);

      await expect(promise).rejects.toThrow('Read error');
    });
  });
});
