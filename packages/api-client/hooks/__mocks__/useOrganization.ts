import { useMutation, useQuery } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock organization data
const mockOrganization = {
  id: 'test-org-1',
  name: '테스트 조직',
  type: 'WORKSHOP',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock organizations list
const mockOrganizations = [
  mockOrganization,
  {
    id: 'test-org-2',
    name: '테스트 조직 2',
    type: 'FLEET',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock organization hooks
export function useOrganization() {
  return useQuery({
    queryKey: ['organization'],
    queryFn: async () => mockOrganization,
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => mockOrganizations,
  });
}

export function useCreateOrganization() {
  return useMutation({
    mutationFn: vi.fn().mockResolvedValue(mockOrganization),
  });
}

export function useUpdateOrganization() {
  return useMutation({
    mutationFn: vi.fn().mockResolvedValue(mockOrganization),
  });
}

export function useDeleteOrganization() {
  return useMutation({
    mutationFn: vi.fn().mockResolvedValue({ success: true }),
  });
}
