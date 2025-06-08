// 문자열 유틸리티
export const stringUtils = {
  // 카멜케이스로 변환
  toCamelCase: (str: string): string => {
    // 단일 단어인 경우 모두 소문자로
    if (!/[-_\s]/.test(str)) {
      return str.toLowerCase();
    }

    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^[A-Z]/, char => char.toLowerCase());
  },

  // 스네이크케이스로 변환
  toSnakeCase: (str: string): string => {
    return str
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_');
  },

  // 케밥케이스로 변환
  toKebabCase: (str: string): string => {
    return str
      .replace(/[_\s]+/g, '-')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  },

  // 파스칼케이스로 변환
  toPascalCase: (str: string): string => {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^[a-z]/, char => char.toUpperCase());
  },

  // 문자열 역순
  reverse: (str: string): string => {
    return str.split('').reverse().join('');
  },

  // 팰린드롬 확인
  isPalindrome: (str: string): boolean => {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
  },

  // 단어 수 세기
  countWords: (str: string): number => {
    return str
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  },

  // 문자열에서 HTML 태그 제거
  stripHtmlTags: (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  },

  // 문자열 패딩
  padStart: (str: string, length: number, fillString: string = ' '): string => {
    if (str.length >= length) return str;
    const padLength = length - str.length;
    const pad = fillString.repeat(Math.ceil(padLength / fillString.length)).slice(0, padLength);
    return pad + str;
  },

  // URL 슬러그 생성
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\uac00-\ud7af-]/g, '') // 한글 포함
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
};

// 날짜/시간 유틸리티
export const dateUtils = {
  // 날짜 차이 계산 (일 단위)
  daysBetween: (date1: Date, date2: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  },

  // 날짜 추가
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // 월 추가
  addMonths: (date: Date, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },

  // 연도 추가
  addYears: (date: Date, years: number): Date => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  },

  // 날짜가 주말인지 확인
  isWeekend: (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  },

  // 날짜가 오늘인지 확인
  isToday: (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },

  // 날짜 포맷팅 (간단한 버전)
  format: (date: Date, format: string): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  // 상대적 시간 표시 (예: "3일 전")
  getRelativeTime: (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
    return `${Math.floor(diffInSeconds / 31536000)}년 전`;
  },
};
