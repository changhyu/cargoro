interface RequestCookies {
  get(name: string): { value: string } | undefined;
  getAll(): Array<{ name: string; value: string }>;
}

declare module '@clerk/nextjs/server' {
  export interface AuthProtectOptions {
    role?: string;
    permission?: string;
    redirectUrl?: string;
  }

  export interface SessionClaims {
    sub: string;
    iat: number;
    exp: number;
    metadata?: {
      role?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  export interface AuthObject {
    userId: string | null;
    sessionId: string | null;
    orgId: string | null;
    sessionClaims: SessionClaims | null;
    protect: (options?: AuthProtectOptions) => Promise<void>;
    has: (params: { role?: string; permission?: string }) => boolean;
    getToken: (options?: { template?: string }) => Promise<string | null>;
  }

  export interface AuthFunction {
    (): Promise<AuthObject>;
    protect: (options?: AuthProtectOptions) => Promise<void>;
  }

  export const auth: AuthFunction;

  export function currentUser(): Promise<User | null>;

  export interface OrganizationMembership {
    id: string;
    organization: Organization;
    publicUserData: {
      userId: string;
      identifier: string;
      firstName?: string;
      lastName?: string;
      imageUrl?: string;
    };
    role: string;
  }

  export interface ClerkClient {
    users: {
      getUser: (userId: string) => Promise<User>;
      getUserList: () => Promise<User[]>;
      updateUserMetadata: (
        userId: string,
        params: {
          publicMetadata?: Record<string, unknown>;
          privateMetadata?: Record<string, unknown>;
        }
      ) => Promise<User>;
    };
    organizations: {
      getOrganizationMembershipList: (params: {
        organizationId: string;
        limit?: number;
      }) => Promise<OrganizationMembership[]>;
      createOrganizationInvitation: (params: {
        organizationId: string;
        emailAddress: string;
        role: string;
      }) => Promise<unknown>;
    };
  }

  export function clerkClient(): Promise<ClerkClient>;

  // For backward compatibility (sync version)
  export const clerkClient: ClerkClient & (() => Promise<ClerkClient>);

  export interface AuthRequest {
    headers?: Headers;
    cookies?: RequestCookies;
  }

  export function getAuth(req: AuthRequest): AuthObject;

  export interface User {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    emailAddresses: Array<{
      emailAddress: string;
      isPrimary: boolean;
    }>;
    publicMetadata: Record<string, any>;
    privateMetadata: Record<string, any>;
  }

  export interface Session {
    id: string;
    userId: string;
    expireAt: Date;
  }

  export interface Organization {
    id: string;
    name: string;
    slug: string;
  }

  export type ClerkMiddlewareHandler = (
    auth: AuthFunction,
    req: Request
  ) => void | Response | Promise<void | Response>;

  export function clerkMiddleware(
    handler?: ClerkMiddlewareHandler
  ): (req: Request, evt?: FetchEvent) => Response | Promise<Response>;
  export function createRouteMatcher(routes: string[]): (req: Request) => boolean;

  // Webhook types
  export interface WebhookEvent {
    type: string;
    object: string;
    data: Record<string, unknown>;
  }
}
