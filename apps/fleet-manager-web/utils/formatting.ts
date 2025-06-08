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

    // 날짜 형식이 지정되지 않은 경우 기본 형식 사용
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
}
