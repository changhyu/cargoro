/**
 * CarGoro 국제화(i18n) 패키지
 * 개발 규칙 21번: 키 네이밍 형식은 "namespace.keyName" 사용
 */
import type { Namespace, SupportedLanguage } from './config';
import {
  initI18n,
  isSupportedLanguage,
  namespaces,
  supportedLanguages,
  validateTranslationKeys,
} from './config';
import { resources } from './locales';

// 기본 리소스로 i18n 초기화 (app 레벨에서도 초기화 가능)
const i18nInstance = initI18n(resources);

/**
 * 누락된 번역 키 검사 (개발 모드에서만 실행)
 */
if (process.env.NODE_ENV !== 'production') {
  validateTranslationKeys(resources);
}

export {
  i18nInstance as i18n,
  initI18n,
  isSupportedLanguage,
  namespaces,
  resources,
  supportedLanguages,
  validateTranslationKeys,
};

export type { Namespace, SupportedLanguage };

// re-export react-i18next 필수 함수들
export { Trans, useTranslation } from 'react-i18next';
