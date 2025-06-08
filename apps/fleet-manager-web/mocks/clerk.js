// Mock implementation for @clerk/nextjs and @clerk/clerk-react
const mockUser = {
  id: 'mock-user-id',
  firstName: 'Mock',
  lastName: 'User',
  emailAddresses: [{ emailAddress: 'mock@example.com' }],
  imageUrl: '',
  createdAt: new Date(),
};

const mockAuth = {
  isLoaded: true,
  isSignedIn: true,
  userId: 'mock-user-id',
  sessionId: 'mock-session-id',
  orgId: null,
  orgRole: null,
  orgSlug: null,
};

const mockSession = {
  id: 'mock-session-id',
  status: 'active',
  user: mockUser,
};

const mockOrganization = {
  id: 'mock-org-id',
  name: 'Mock Organization',
  slug: 'mock-org',
};

// Mock hooks
export const useAuth = () => mockAuth;
export const useUser = () => ({
  isLoaded: true,
  isSignedIn: true,
  user: mockUser,
});
export const useClerk = () => ({
  client: {},
  session: mockSession,
  user: mockUser,
  signOut: () => Promise.resolve(),
  openSignIn: () => {},
  openSignUp: () => {},
  openUserProfile: () => {},
});
export const useSession = () => mockSession;
export const useOrganization = () => ({
  isLoaded: true,
  organization: mockOrganization,
});
export const useOrganizationList = () => ({
  isLoaded: true,
  organizationList: [mockOrganization],
});
export const useReverification = () => ({
  isLoaded: true,
  reverify: () => Promise.resolve(),
});
export const useSignIn = () => ({
  isLoaded: true,
  signIn: {},
  setActive: () => Promise.resolve(),
});
export const useSignUp = () => ({
  isLoaded: true,
  signUp: {},
  setActive: () => Promise.resolve(),
});

// Mock components
export const ClerkProvider = ({ children }) => children;
export const SignedIn = ({ children }) => children;
export const SignedOut = ({ children }) => null;
export const UserButton = () => null;
export const SignInButton = ({ children }) => children || null;
export const SignUpButton = ({ children }) => children || null;
export const SignOutButton = ({ children }) => children || null; // 추가
export const RedirectToSignIn = () => null;
export const RedirectToSignUp = () => null;
export const RedirectToUserProfile = () => null;
export const RedirectToOrganizationProfile = () => null;
export const RedirectToCreateOrganization = () => null;
export const Protect = ({ children }) => children;
export const ClerkLoaded = ({ children }) => children;
export const ClerkLoading = ({ children }) => null;
export const AuthenticateWithRedirectCallback = () => null; // 추가

// Mock middleware and auth functions
export const auth = () => mockAuth;
export const currentUser = () => Promise.resolve(mockUser);
export const redirectToSignIn = () => {};
export const redirectToSignUp = () => {};

// Server-side mocks
export const clerkMiddleware = handler => handler;
export const createRouteMatcher = () => () => false;

// Default export for CommonJS compatibility
export default {
  useAuth,
  useUser,
  useClerk,
  useSession,
  useOrganization,
  useOrganizationList,
  useReverification,
  useSignIn,
  useSignUp,
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
  SignOutButton,
  RedirectToSignIn,
  RedirectToSignUp,
  RedirectToUserProfile,
  RedirectToOrganizationProfile,
  RedirectToCreateOrganization,
  Protect,
  ClerkLoaded,
  ClerkLoading,
  AuthenticateWithRedirectCallback,
  auth,
  currentUser,
  redirectToSignIn,
  redirectToSignUp,
  clerkMiddleware,
  createRouteMatcher,
};

// CommonJS exports for server compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    useAuth,
    useUser,
    useClerk,
    useSession,
    useOrganization,
    useOrganizationList,
    useReverification,
    useSignIn,
    useSignUp,
    ClerkProvider,
    SignedIn,
    SignedOut,
    UserButton,
    SignInButton,
    SignUpButton,
    SignOutButton,
    RedirectToSignIn,
    RedirectToSignUp,
    RedirectToUserProfile,
    RedirectToOrganizationProfile,
    RedirectToCreateOrganization,
    Protect,
    ClerkLoaded,
    ClerkLoading,
    AuthenticateWithRedirectCallback,
    auth,
    currentUser,
    redirectToSignIn,
    redirectToSignUp,
    clerkMiddleware,
    createRouteMatcher,
  };
}
