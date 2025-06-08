import { vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';

// react-i18next 전체 mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// @cargoro/ui 전체 mock
vi.mock('@cargoro/ui', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Input: ({ onChange, ...props }: any) => <input onChange={onChange} {...props} />,
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Dialog: ({ children, open, ...props }: any) => (
    <div style={{ display: open ? 'block' : 'none' }} {...props}>
      {children}
    </div>
  ),
  DialogContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  Select: ({ children, ...props }: any) => <select {...props}>{children}</select>,
  SelectContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectItem: ({ children, value, ...props }: any) => (
    <option value={value} {...props}>
      {children}
    </option>
  ),
  SelectTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectValue: ({ placeholder, ...props }: any) => <span {...props}>{placeholder}</span>,
  Textarea: ({ onChange, ...props }: any) => <textarea onChange={onChange} {...props} />,
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  FormField: ({ children, render, ...props }: any) => (
    <div {...props}>{render ? render({ field: {} }) : children}</div>
  ),
  FormItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FormLabel: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  FormControl: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FormMessage: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  useToast: () => ({
    toast: vi.fn(),
  }),
  Toaster: () => <div data-testid="toaster" />,
  Table: ({ children, ...props }: any) => <table {...props}>{children}</table>,
  TableHeader: ({ children, ...props }: any) => <thead {...props}>{children}</thead>,
  TableBody: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
  TableRow: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  TableHead: ({ children, ...props }: any) => <th {...props}>{children}</th>,
  TableCell: ({ children, ...props }: any) => <td {...props}>{children}</td>,
}));

// Next.js mocks
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Clerk mocks
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      firstName: '테스트',
      lastName: '사용자',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
    getToken: vi.fn().mockResolvedValue('test-token'),
  }),
  SignIn: () => <div data-testid="sign-in">Sign In Component</div>,
  SignUp: () => <div data-testid="sign-up">Sign Up Component</div>,
  UserButton: () => <div data-testid="user-button">User Button</div>,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// React Query mock
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
  }),
  useMutation: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
  }),
  QueryClient: vi.fn(() => ({
    clear: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Lucide icons mock
vi.mock('lucide-react', () => ({
  Search: (props: any) => <div data-testid="search-icon" {...props} />,
  Plus: (props: any) => <div data-testid="plus-icon" {...props} />,
  Package: (props: any) => <div data-testid="package-icon" {...props} />,
  ShoppingCart: (props: any) => <div data-testid="shopping-cart-icon" {...props} />,
  Truck: (props: any) => <div data-testid="truck-icon" {...props} />,
  BarChart: (props: any) => <div data-testid="bar-chart-icon" {...props} />,
  Warehouse: (props: any) => <div data-testid="warehouse-icon" {...props} />,
  RefreshCw: (props: any) => <div data-testid="refresh-icon" {...props} />,
  AlertTriangle: (props: any) => <div data-testid="alert-triangle-icon" {...props} />,
  CheckCircle: (props: any) => <div data-testid="check-circle-icon" {...props} />,
  Edit: (props: any) => <div data-testid="edit-icon" {...props} />,
  Trash2: (props: any) => <div data-testid="trash-icon" {...props} />,
  Eye: (props: any) => <div data-testid="eye-icon" {...props} />,
  Download: (props: any) => <div data-testid="download-icon" {...props} />,
  Upload: (props: any) => <div data-testid="upload-icon" {...props} />,
}));

// Global test configuration
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Window.matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Console warnings 억제
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};
