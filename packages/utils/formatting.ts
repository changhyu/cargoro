/**
 * 포맷팅 관련 유틸리티 함수
 */

/**
 * 날짜 문자열을 사용자 친화적인 형식으로 변환
 * @param dateString ISO 형식의 날짜 문자열
 * @param format 포맷 (기본값: 'yyyy-MM-dd')
 * @returns 포맷된 날짜 문자열
 */
export function formatDateString(dateString: string, format: string = 'yyyy-MM-dd'): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);

    // Invalid Date 체크 추가
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateString}`);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 기본 형식: yyyy-MM-dd
    if (format === 'yyyy-MM-dd') {
      return `${year}-${month}-${day}`;
    }

    // 한국어 형식: yyyy년 MM월 dd일
    if (format === 'ko') {
      return `${year}년 ${month}월 ${day}일`;
    }

    // 슬래시 형식: yyyy/MM/dd
    if (format === 'slash') {
      return `${year}/${month}/${day}`;
    }

    // 점 형식: yyyy.MM.dd
    if (format === 'dot') {
      return `${year}.${month}.${day}`;
    }

    // 기본 형식 반환
    return `${year}-${month}-${day}`;
  } catch (error) {
    // 명시적으로 에러 로깅
    console.error('날짜 포맷팅 오류:', error);
    return dateString || '-';
  }
}

/**
 * 전화번호를 포맷팅하여 반환
 * @param phoneNumber 포맷팅할 전화번호
 * @returns 포맷팅된 전화번호 문자열
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '-';

  // 숫자만 추출
  const cleaned = phoneNumber.replace(/\D/g, '');

  // 길이에 따라 다른 포맷 적용
  if (cleaned.length === 8) {
    // 지역 번호 없는 일반 전화번호 (12345678)
    return cleaned.replace(/(\d{4})(\d{4})/, '$1-$2');
  } else if (cleaned.length === 10) {
    // 지역 번호 또는 휴대폰 번호 (02XXXXXXXX 또는 010XXXXXXX)
    if (cleaned.startsWith('02')) {
      // 서울 지역번호 (02XXXXXXXX)
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    } else {
      // 휴대폰 번호 (010XXXXXXX)
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
  } else if (cleaned.length === 11) {
    // 휴대폰 번호 (010XXXXXXXX)
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  // 다른 길이의 번호는 그대로 반환
  return phoneNumber;
}
