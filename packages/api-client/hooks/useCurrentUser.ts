'use client';

import { useState, useEffect } from 'react';
import { useApiClient } from '../lib/provider';

// 임시 User 타입 정의 (실제로는 @cargoro/types에서 가져와야 함)
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 현재 사용자 정보를 가져오는 훅
 */
export const useCurrentUser = () => {
  const apiClient = useApiClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // API에서 현재 사용자 정보 가져오기
        const userData = await apiClient.get<User>('/api/auth/me');
        setUser(userData);
      } catch (err: any) {
        console.error('사용자 정보 조회 실패:', err);
        setError(err.message || '사용자 정보를 가져올 수 없습니다.');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [apiClient]);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const userData = await apiClient.get<User>('/api/auth/me');
      setUser(userData);
      setError(null);
    } catch (err: any) {
      setError(err.message || '사용자 정보를 가져올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    refreshUser,
  };
};
