import { User, UpdateUserInput, UserConnection } from '@cargoro/types/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { graphqlClient } from '../lib/config/config';
import { USER_QUERIES, USER_MUTATIONS } from '../lib/graphql';

/**
 * 현재 사용자 정보 조회 훅
 */
export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await graphqlClient.query<{ currentUser: User }>(USER_QUERIES.CURRENT_USER);
      return response.currentUser;
    },
  });
}

/**
 * 사용자 ID로 사용자 정보 조회 훅
 */
export function useUser(id: string) {
  return useQuery<User>({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await graphqlClient.query<{ user: User }>(USER_QUERIES.USER_BY_ID, { id });
      return response.user;
    },
    enabled: !!id,
  });
}

/**
 * 사용자 목록 조회 훅
 */
export function useUsers(page = 1, limit = 10) {
  return useQuery<UserConnection>({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      const response = await graphqlClient.query<{ users: UserConnection }>(
        USER_QUERIES.USERS_LIST,
        {
          page,
          limit,
        }
      );
      return response.users;
    },
  });
}

/**
 * 사용자 정보 업데이트 훅
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      const response = await graphqlClient.query<{ updateUser: User }>(USER_MUTATIONS.UPDATE_USER, {
        input,
      });
      return response.updateUser;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

/**
 * 사용자 삭제 훅
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await graphqlClient.query<{ deleteUser: boolean }>(
        USER_MUTATIONS.DELETE_USER,
        {
          id,
        }
      );
      return response.deleteUser;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.removeQueries({ queryKey: ['user', id] });
    },
  });
}
