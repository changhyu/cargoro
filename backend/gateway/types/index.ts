export interface Context {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  headers: any;
}

export interface UserType {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: string;
}

export interface UserConnection {
  nodes: UserType[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

export interface OrganizationType {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionType {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}
