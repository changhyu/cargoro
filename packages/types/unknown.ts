/**
 * @cargoro/types/unknown.ts
 *
 * 프로젝트에서 `any` 타입 대신 사용할 수 있는 타입 대안 모음
 * TypeScript에서 `any` 타입 사용은 금지되어 있으며, 이 모듈의 타입을 대신 사용해야 합니다.
 */

/**
 * JSON 데이터를 표현하는 타입
 * API 응답이나 외부 데이터를 처리할 때 사용합니다.
 */
export type JsonValue = string | number | boolean | null | undefined | JsonObject | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonArray = JsonValue[];

/**
 * 알 수 없는 함수 타입을 표현합니다.
 * 함수의 정확한 시그니처를 모를 때 사용합니다.
 */
export type UnknownFunction = (...args: unknown[]) => unknown;

/**
 * 안전한 콜백 함수 타입
 * 기본적인 콜백 함수의 패턴을 제공합니다.
 */
export type SafeCallback<T = void, E = Error> = (error: E | null, result?: T) => void;

/**
 * 동적인 객체 속성에 대한 타입
 * 객체의 키가 동적이지만 값의 타입이 일정할 때 사용합니다.
 */
export type Dictionary<T> = Record<string, T>;

/**
 * 부분적으로 알려진 객체 타입
 * 일부 속성은 알고 있지만 나머지는 모를 때 사용합니다.
 */
export type PartiallyKnown<T extends object> = T & {
  [key: string]: unknown;
};

/**
 * 알 수 없는 객체를 안전하게 다루기 위한 타입 가드 함수
 * @param value 검사할 값
 * @returns 값이 객체인지 여부
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 알 수 없는 배열을 안전하게 다루기 위한 타입 가드 함수
 * @param value 검사할 값
 * @returns 값이 배열인지 여부
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * 특정 타입의 배열인지 확인하는 타입 가드 함수 생성기
 * @param predicate 개별 요소를 검사하는 함수
 * @returns 값이 해당 타입의 배열인지 확인하는 타입 가드 함수
 */
export function isArrayOf<T>(predicate: (value: unknown) => value is T) {
  return (value: unknown): value is T[] => {
    return Array.isArray(value) && value.every(predicate);
  };
}

/**
 * 문자열 타입 가드
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 숫자 타입 가드
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 불리언 타입 가드
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 특정 속성을 가진 객체인지 확인하는 타입 가드 생성 함수
 * @param propertyNames 필수 속성 이름 배열
 * @returns 해당 속성을 가진 객체인지 확인하는 타입 가드 함수
 */
export function hasProperties<T extends string>(propertyNames: T[]) {
  return (value: unknown): value is Record<T, unknown> => {
    if (!isObject(value)) return false;
    return propertyNames.every(prop => prop in value);
  };
}

/**
 * API 응답 결과를 표현하는 제네릭 타입
 */
export interface ApiResult<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  status: 'success' | 'error';
}

/**
 * 다양한 상태와 데이터를 가질 수 있는 비동기 작업의 결과를 나타내는 타입
 */
export type AsyncResult<T, E = Error> =
  | { status: 'pending' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };
