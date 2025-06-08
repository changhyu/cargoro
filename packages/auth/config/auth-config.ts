// Clerk Provider Props 타입을 any로 대체 (타입 정의가 export되지 않음)
type ClerkProviderProps = any;

// 앱별로 오버라이드 가능한 기본 설정
export const authConfig: Partial<ClerkProviderProps> = {
  appearance: {
    elements: {
      rootBox: 'mx-auto',
      card: 'shadow-lg',
    },
  },
  localization: {
    locale: 'ko-KR',
  },
};

// 앱별 테마 설정
const appThemes = {
  'workshop-web': {
    primary: '#2563eb', // 파란색
    name: '워크샵',
  },
  'fleet-manager-web': {
    primary: '#10b981', // 초록색
    name: '플릿 매니저',
  },
  'superadmin-web': {
    primary: '#8b5cf6', // 보라색
    name: '관리자',
    dark: true,
  },
  'parts-web': {
    primary: '#f97316', // 오렌지색
    name: '부품몰',
  },
  'delivery-driver': {
    primary: '#10b981', // 초록색
    name: '배송',
  },
};

// 환경별 설정
export const getAuthConfig = (appName: string): Partial<ClerkProviderProps> => {
  const baseConfig = { ...authConfig };
  const theme = appThemes[appName as keyof typeof appThemes];
  const isDark = theme && 'dark' in theme && theme.dark;

  // 기본 설정
  const config: Partial<ClerkProviderProps> = {
    ...baseConfig,
    appearance: {
      ...baseConfig.appearance,
      baseTheme: isDark ? 'dark' : undefined,
      variables: {
        colorPrimary: theme?.primary || '#2563eb',
        colorText: isDark ? '#f3f4f6' : '#1f2937',
        colorBackground: isDark ? '#111827' : '#ffffff',
        colorInputBackground: isDark ? '#1f2937' : '#f9fafb',
        colorInputText: isDark ? '#f3f4f6' : '#1f2937',
        borderRadius: '0.5rem',
      },
    },
  };

  // 앱별 상세 설정
  switch (appName) {
    case 'workshop-web':
      return {
        ...config,
        signInFallbackRedirectUrl: '/workshop/dashboard',
        signUpFallbackRedirectUrl: '/workshop/onboarding',
        appearance: {
          ...config.appearance,
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            footerActionLink: 'text-blue-600 hover:text-blue-700',
          },
        },
      };

    case 'fleet-manager-web':
      return {
        ...config,
        signInFallbackRedirectUrl: '/fleet/dashboard',
        signUpFallbackRedirectUrl: '/fleet/setup',
        appearance: {
          ...config.appearance,
          elements: {
            formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700',
            footerActionLink: 'text-emerald-600 hover:text-emerald-700',
          },
          layout: {
            socialButtonsPlacement: 'top',
            socialButtonsVariant: 'iconButton',
          },
        },
      };

    case 'superadmin-web':
      return {
        ...config,
        signInFallbackRedirectUrl: '/admin/dashboard',
        signUpFallbackRedirectUrl: '/admin/setup',
        allowedRedirectOrigins: ['https://admin.cargoro.com'],
        appearance: {
          ...config.appearance,
          elements: {
            formButtonPrimary: 'bg-violet-600 hover:bg-violet-700',
            card: 'bg-gray-800 border border-gray-700',
            footerActionLink: 'text-violet-400 hover:text-violet-300',
          },
        },
      };

    case 'parts-web':
      return {
        ...config,
        signInFallbackRedirectUrl: '/parts/dashboard',
        signUpFallbackRedirectUrl: '/parts/welcome',
        appearance: {
          ...config.appearance,
          variables: {
            ...config.appearance?.variables,
            borderRadius: '0.75rem',
          },
          elements: {
            formButtonPrimary: 'bg-orange-500 hover:bg-orange-600',
            footerActionLink: 'text-orange-500 hover:text-orange-600',
            card: 'shadow-lg border-0 rounded-2xl',
          },
          layout: {
            socialButtonsPlacement: 'top',
            showOptionalFields: true,
          },
        },
      };

    default:
      return config;
  }
};

// Clerk 환경 변수 검증
export const validateClerkEnv = () => {
  const required = ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required Clerk environment variables: ${missing.join(', ')}`);
  }
};
