// Mock implementation for @clerk/nextjs/server
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

// Server-side auth functions
export const auth = () => mockAuth;
export const currentUser = () => Promise.resolve(mockUser);
export const redirectToSignIn = () => {};
export const redirectToSignUp = () => {};
export const clerkMiddleware = handler => handler;
export const createRouteMatcher = () => () => false;

// Default export for CommonJS compatibility
export default {
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
    auth,
    currentUser,
    redirectToSignIn,
    redirectToSignUp,
    clerkMiddleware,
    createRouteMatcher,
  };
}
