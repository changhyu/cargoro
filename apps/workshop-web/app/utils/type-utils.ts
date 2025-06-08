/**
 * 타입 변환 유틸리티 함수
 *
 * TypeScript의 exactOptionalPropertyTypes 설정이 true일 때
 * string | undefined와 같은 타입 할당 문제를 해결하기 위한 유틸리티 함수들
 */

/**
 * string | undefined 타입을 string으로 안전하게 변환합니다.
 * ISO 날짜 문자열에서 YYYY-MM-DD 부분만 추출할 때 자주 사용됩니다.
 *
 * @param value 변환할 문자열 또는 undefined 값
 * @param defaultValue 값이 undefined일 경우 사용할 기본값 (기본값: '')
 * @returns 안전하게 변환된 문자열
 */
export function ensureString(value: string | undefined, defaultValue: string = ''): string {
  return value !== undefined ? value : defaultValue;
}

/**
 * ISO 날짜 문자열에서 YYYY-MM-DD 형식의 날짜 부분만 추출합니다.
 *
 * @param date Date 객체
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export function formatDateToYYYYMMDD(date: Date): string {
  try {
    // Date 객체를 직접 문자열로 변환하고, substring으로 필요한 부분만 추출
    const dateStr = date.toISOString(); // 항상 "YYYY-MM-DDT00:00:00.000Z" 형식

    // substring은 항상 문자열을 반환하므로 undefined가 될 수 없음
    return dateStr.substring(0, 10); // "YYYY-MM-DD" 부분만 추출
  } catch (error) {
    // 에러 발생 시 현재 날짜 반환 (위와 동일한 방식으로)
    return new Date().toISOString().substring(0, 10);
  }
}

/**
 * null 또는 undefined를 지정된 기본값으로 대체합니다.
 *
 * @param value 확인할 값
 * @param defaultValue 값이 null 또는 undefined일 경우 사용할 기본값
 * @returns null/undefined가 아닌 값
 */
export function defaultIfNullish<T>(value: T | null | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}

/**
 * 객체의 특정 속성이 undefined인 경우 해당 속성을 제거합니다.
 * exactOptionalPropertyTypes가 활성화된 상태에서 타입 호환성 문제를 해결합니다.
 *
 * @param obj 처리할 객체
 * @returns undefined 속성이 제거된 새 객체
 */
export function removeUndefinedProps<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };

  Object.keys(result).forEach(key => {
    if (result[key] === undefined) {
      delete result[key];
    }
  });

  return result;
}
