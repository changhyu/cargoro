import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * CSS 클래스 이름을 병합하는 유틸리티 함수
 *
 * clsx와 tailwind-merge를 사용하여 클래스 이름을 결합하고 충돌을 해결합니다.
 *
 * @param inputs 결합할 클래스 값 (문자열, 객체, 배열 등)
 * @returns 병합된 클래스 이름 문자열
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
