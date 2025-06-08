import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 클래스 이름을 결합하는 유틸리티 함수
 * clsx와 tailwind-merge를 사용하여 클래스 이름을 효율적으로 병합합니다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
