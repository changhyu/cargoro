export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  WORKSHOP_ADMIN = 'workshop_admin',
  FLEET_MANAGER = 'fleet_manager',
  PARTS_MANAGER = 'parts_manager',
  DELIVERY_DRIVER = 'delivery_driver',
}

export interface UserPermissions {
  users?: {
    read?: boolean;
    write?: boolean;
    delete?: boolean;
  };
  workshops?: {
    read?: boolean;
    write?: boolean;
    delete?: boolean;
  };
  vehicles?: {
    read?: boolean;
    write?: boolean;
    delete?: boolean;
  };
  parts?: {
    read?: boolean;
    write?: boolean;
    delete?: boolean;
  };
  delivery?: {
    read?: boolean;
    write?: boolean;
    delete?: boolean;
  };
  system?: {
    read?: boolean;
    write?: boolean;
    delete?: boolean;
  };
}

export interface CurrentUserType {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  phoneNumbers?: Array<{
    phoneNumber: string;
    id: string;
  }>;
  publicMetadata: {
    role: UserRole;
    permissions?: UserPermissions;
    organization?: string;
  };
  privateMetadata?: Record<string, any>;
  unsafeMetadata?: Record<string, any>;
  createdAt?: number;
  updatedAt?: number;
  lastSignInAt?: number;
  banned?: boolean;
}

export interface AuthContextType {
  user: CurrentUserType | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
}
