/**
 * i18n 기본 설정
 * 개발 규칙 21번에 따라 구성: 키 네이밍 형식은 "namespace.keyName" 사용
 */
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

/**
 * 지원하는 언어 코드
 */
export const supportedLanguages = ['ko', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

/**
 * 네임스페이스 타입 정의
 * 개발 규칙 21번에 따라 네임스페이스별 키 그룹화
 */
export const namespaces = [
  'common',
  'auth',
  'errors',
  'workshops',
  'fleet',
  'parts',
  'delivery',
  'vehicle',
  'user',
  'admin',
  'settings',
] as const;
export type Namespace = (typeof namespaces)[number];

/**
 * i18n 인스턴스 초기화 함수
 * @param resources 언어 리소스
 * @param lng 기본 언어
 * @returns 설정된 i18n 인스턴스
 */
export const initI18n = (
  resources: Record<string, Record<string, Record<string, string>>>,
  lng: SupportedLanguage = 'ko'
) => {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng,
      fallbackLng: 'ko',
      ns: namespaces,
      defaultNS: 'common',
      // 개발 규칙 21에 따른 네임스페이스 키 포맷 설정
      keySeparator: '.',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      detection: {
        order: ['localStorage', 'cookie', 'navigator'],
        caches: ['localStorage', 'cookie'],
      },
    });

  return i18n;
};

/**
 * 지원되는 언어인지 확인
 * @param lang 언어 코드
 * @returns 지원되는 언어 여부
 */
export const isSupportedLanguage = (lang: string): lang is SupportedLanguage => {
  return supportedLanguages.includes(lang as SupportedLanguage);
};

/**
 * 누락된 키 검사 유틸리티 (개발 환경에서만 실행)
 * @param resources 언어 리소스
 * @param primaryLang 기준 언어
 */
export const validateTranslationKeys = (
  resources: Record<string, Record<string, Record<string, string>>>,
  primaryLang: SupportedLanguage = 'ko'
): void => {
  if (process.env.NODE_ENV === 'production') return;

  const primaryResources = resources[primaryLang];
  if (!primaryResources) return;

  // 지원하는 모든 언어에 대해 누락된 키 확인
  supportedLanguages.forEach(lang => {
    if (lang === primaryLang) return;

    const langResources = resources[lang];
    if (!langResources) {
      console.warn(`[i18n] 언어 '${lang}'의 리소스가 없습니다.`);
      return;
    }

    // 각 네임스페이스에 대해 확인
    namespaces.forEach(ns => {
      const primaryNS = primaryResources[ns];
      const langNS = langResources[ns];

      if (!primaryNS) return;
      if (!langNS) {
        console.warn(`[i18n] 언어 '${lang}'의 '${ns}' 네임스페이스가 없습니다.`);
        return;
      }

      // 기준 언어의 키가 대상 언어에 있는지 확인
      Object.keys(primaryNS).forEach(key => {
        if (langNS[key] === undefined) {
          console.warn(`[i18n] 언어 '${lang}'의 '${ns}.${key}' 키가 누락되었습니다.`);
        }
      });
    });
  });
};
