/**
 * 사용자 관리 Zustand 스토어
 */

'use client';

import { create } from 'zustand';
import * as userAPI from '../server-actions/clerk-api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImage?: string;
  profileImageUrl?: string;
  active: boolean;
  role?: string;
  organization?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserDetail extends User {
  permissions?: Permission[];
  bio?: string;
  country?: string;
  language?: string;
}

interface UserStore {
  // 상태
  users: User[];
  currentUser: UserDetail | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<UserDetail | null>;
  createUser: (userData: userAPI.CreateUserData) => Promise<User>;
  updateUser: (id: string, userData: userAPI.UpdateUserData) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUserPermissions: (id: string, permissions: string[]) => Promise<void>;
  toggleUserActive: (id: string) => Promise<void>;
  clearError: () => void;
  setCurrentUser: (user: UserDetail | null) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  // 초기 상태
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,

  // 모든 사용자 목록 가져오기
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const clerkUsers = await userAPI.getAllUsers();
      const users: User[] = clerkUsers.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        active: user.active,
        role: 'admin', // Default role since the mock data doesn't include this
      }));
      set({ users, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '사용자 목록을 가져올 수 없습니다.',
        isLoading: false,
      });
    }
  },

  // 특정 사용자 정보 가져오기
  fetchUserById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const clerkUser = await userAPI.getUserById(id);
      if (!clerkUser) {
        set({ currentUser: null, isLoading: false });
        return null;
      }

      const userDetail: UserDetail = {
        id: clerkUser.id,
        email: clerkUser.email || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        active: clerkUser.active || true,
        role: 'admin',
        permissions: [],
      };

      set({ currentUser: userDetail, isLoading: false });
      return userDetail;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '사용자 정보를 가져올 수 없습니다.',
        isLoading: false,
      });
      return null;
    }
  },

  // 새 사용자 생성
  createUser: async (userData: userAPI.CreateUserData) => {
    set({ isLoading: true, error: null });
    try {
      const clerkUser = await userAPI.createUser(userData);
      const newUser: User = {
        id: clerkUser.id,
        email: clerkUser.email || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        phoneNumber: clerkUser.phoneNumber,
        active: true,
        role: clerkUser.role,
        organization: clerkUser.organization,
      };

      const { users } = get();
      set({ users: [...users, newUser], isLoading: false });
      return newUser;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '사용자를 생성할 수 없습니다.',
        isLoading: false,
      });
      throw new Error('사용자를 생성할 수 없습니다.');
    }
  },

  // 사용자 정보 업데이트
  updateUser: async (id: string, userData: userAPI.UpdateUserData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedClerkUser = await userAPI.updateUser(id, userData);
      const updatedUser: User = {
        id: updatedClerkUser.id,
        email: userData.firstName ? 'updated@example.com' : 'existing@example.com', // Mock since API doesn't return email
        firstName: updatedClerkUser.firstName || '',
        lastName: updatedClerkUser.lastName || '',
        phoneNumber: updatedClerkUser.phoneNumber,
        active: true,
        role: updatedClerkUser.role,
        organization: updatedClerkUser.organization,
      };

      const { users, currentUser } = get();
      const updatedUsers = users.map(user => (user.id === id ? updatedUser : user));
      const updatedCurrentUser =
        currentUser?.id === id ? { ...currentUser, ...updatedUser } : currentUser;

      set({
        users: updatedUsers,
        currentUser: updatedCurrentUser,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '사용자 정보를 업데이트할 수 없습니다.',
        isLoading: false,
      });
    }
  },

  // 사용자 삭제
  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const success = await userAPI.deleteUser(id);
      if (success) {
        const { users, currentUser } = get();
        const filteredUsers = users.filter(user => user.id !== id);
        const updatedCurrentUser = currentUser?.id === id ? null : currentUser;
        set({
          users: filteredUsers,
          currentUser: updatedCurrentUser,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '사용자를 삭제할 수 없습니다.',
        isLoading: false,
      });
    }
  },

  // 사용자 권한 업데이트
  updateUserPermissions: async (id: string, permissions: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const success = await userAPI.updateUserPermissions(id, permissions);
      if (success) {
        const { currentUser } = get();
        if (currentUser?.id === id) {
          const updatedPermissions: Permission[] = permissions.map(perm => {
            const [resource, action] = perm.split(':');
            return {
              id: perm,
              name: perm,
              description: `${resource} ${action} 권한`,
              resource,
              action,
            };
          });
          set({
            currentUser: { ...currentUser, permissions: updatedPermissions },
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '권한을 업데이트할 수 없습니다.',
        isLoading: false,
      });
    }
  },

  // 사용자 활성 상태 토글
  toggleUserActive: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const success = await userAPI.toggleUserActive(id);
      if (success) {
        const { users, currentUser } = get();
        const updatedUsers = users.map(user =>
          user.id === id ? { ...user, active: !user.active } : user
        );
        const updatedCurrentUser =
          currentUser?.id === id ? { ...currentUser, active: !currentUser.active } : currentUser;

        set({
          users: updatedUsers,
          currentUser: updatedCurrentUser,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '사용자 상태를 변경할 수 없습니다.',
        isLoading: false,
      });
    }
  },

  // 에러 클리어
  clearError: () => set({ error: null }),

  // 현재 사용자 설정
  setCurrentUser: (user: UserDetail | null) => set({ currentUser: user }),
}));
