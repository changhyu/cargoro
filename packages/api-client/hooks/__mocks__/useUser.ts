import { useMutation, useQuery } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock user data
const mockUser = {
  id: 'test-user-1',
  name: '테스트 사용자',
  email: 'test@example.com',
  role: 'USER',
  organizationId: 'test-org-1',
};

// Mock organization users
const mockUserConnection = {
  edges: [
    { node: mockUser },
    {
      node: {
        id: 'test-user-2',
        name: '테스트 사용자 2',
        email: 'test2@example.com',
        role: 'ADMIN',
        organizationId: 'test-org-1',
      },
    },
  ],
  pageInfo: {
    hasNextPage: false,
    endCursor: null,
  },
  totalCount: 2,
};

// Mock user hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => mockUser,
  });
}

export function useUserById() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => mockUser,
  });
}

export function useOrganizationUsers() {
  return useQuery({
    queryKey: ['organizationUsers'],
    queryFn: async () => mockUserConnection,
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: vi.fn().mockResolvedValue(mockUser),
  });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: vi.fn().mockResolvedValue(mockUser),
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: vi.fn().mockResolvedValue({ success: true }),
  });
}
