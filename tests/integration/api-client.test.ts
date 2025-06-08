import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { ApiClient } from '../../src/api/client';

// MSW 서버 설정
const server = setupServer(
  http.get('http://localhost:3000/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: '홍길동', email: 'hong@example.com' },
      { id: 2, name: '김철수', email: 'kim@example.com' },
    ]);
  }),

  http.post('http://localhost:3000/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: 3,
        ...body,
      },
      { status: 201 }
    );
  }),

  http.get('http://localhost:3000/api/users/:id', ({ params }) => {
    const { id } = params;
    if (id === '999') {
      return HttpResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }
    return HttpResponse.json({
      id: Number(id),
      name: '홍길동',
      email: 'hong@example.com',
    });
  })
);

// 테스트
describe('API 클라이언트 통합 테스트', () => {
  let apiClient: ApiClient;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
    apiClient = new ApiClient('http://localhost:3000/api');
  });

  afterAll(() => {
    server.close();
  });

  describe('GET 요청', () => {
    it('사용자 목록을 가져와야 함', async () => {
      const users = await apiClient.get<Array<{ id: number; name: string }>>('/users');

      expect(users).toHaveLength(2);
      expect(users[0]).toEqual({
        id: 1,
        name: '홍길동',
        email: 'hong@example.com',
      });
    });

    it('특정 사용자를 가져와야 함', async () => {
      const user = await apiClient.get<{ id: number; name: string }>('/users/1');

      expect(user).toEqual({
        id: 1,
        name: '홍길동',
        email: 'hong@example.com',
      });
    });

    it('존재하지 않는 사용자 요청 시 에러 발생', async () => {
      await expect(apiClient.get('/users/999')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('POST 요청', () => {
    it('새 사용자를 생성해야 함', async () => {
      const newUser = {
        name: '이영희',
        email: 'lee@example.com',
      };

      const createdUser = await apiClient.post<{ id: number; name: string }>('/users', newUser);

      expect(createdUser).toEqual({
        id: 3,
        ...newUser,
      });
    });

    it('POST 요청 실패 시 에러 발생', async () => {
      server.use(
        http.post('http://localhost:3000/api/users', () => {
          return HttpResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
        })
      );

      await expect(apiClient.post('/users', { invalid: 'data' })).rejects.toThrow(
        'HTTP error! status: 400'
      );
    });
  });

  describe('PUT 요청', () => {
    it('사용자 정보를 업데이트해야 함', async () => {
      server.use(
        http.put('http://localhost:3000/api/users/1', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({
            id: 1,
            ...body,
          });
        })
      );

      const updatedUser = await apiClient.put<{ id: number; name: string }>('/users/1', {
        name: '홍길동 수정',
        email: 'hong.updated@example.com',
      });

      expect(updatedUser.name).toBe('홍길동 수정');
    });

    it('PUT 요청 실패 시 에러 발생', async () => {
      server.use(
        http.put('http://localhost:3000/api/users/999', () => {
          return HttpResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
        })
      );

      await expect(apiClient.put('/users/999', { name: 'test' })).rejects.toThrow(
        'HTTP error! status: 404'
      );
    });
  });

  describe('DELETE 요청', () => {
    it('사용자를 삭제해야 함', async () => {
      server.use(
        http.delete('http://localhost:3000/api/users/1', () => {
          return HttpResponse.json({ success: true });
        })
      );

      const result = await apiClient.delete<{ success: boolean }>('/users/1');
      expect(result.success).toBe(true);
    });

    it('DELETE 요청 실패 시 에러 발생', async () => {
      server.use(
        http.delete('http://localhost:3000/api/users/999', () => {
          return HttpResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
        })
      );

      await expect(apiClient.delete('/users/999')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('PATCH 요청', () => {
    it('사용자 정보를 부분 업데이트해야 함', async () => {
      server.use(
        http.patch('http://localhost:3000/api/users/1', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({
            id: 1,
            name: '홍길동',
            email: 'hong@example.com',
            ...body,
          });
        })
      );

      const patchedUser = await apiClient.patch<{ id: number; name: string; email: string }>(
        '/users/1',
        {
          email: 'new.email@example.com',
        }
      );

      expect(patchedUser.email).toBe('new.email@example.com');
      expect(patchedUser.name).toBe('홍길동');
    });

    it('PATCH 요청 실패 시 에러 발생', async () => {
      server.use(
        http.patch('http://localhost:3000/api/users/999', () => {
          return HttpResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
        })
      );

      await expect(apiClient.patch('/users/999', { email: 'test@example.com' })).rejects.toThrow(
        'HTTP error! status: 404'
      );
    });
  });

  describe('네트워크 에러 처리', () => {
    it('네트워크 에러 시 적절한 에러 메시지', async () => {
      server.use(
        http.get('http://localhost:3000/api/users', () => {
          return HttpResponse.error();
        })
      );

      await expect(apiClient.get('/users')).rejects.toThrow();
    });
  });

  describe('타임아웃 처리', () => {
    it('요청 타임아웃 시 에러 발생', async () => {
      server.use(
        http.get('http://localhost:3000/api/slow', async () => {
          await new Promise(resolve => setTimeout(resolve, 5000));
          return HttpResponse.json({ data: 'slow response' });
        })
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      try {
        await fetch('http://localhost:3000/api/slow', { signal: controller.signal });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.name).toBe('AbortError');
        }
      } finally {
        clearTimeout(timeoutId);
      }
    });
  });
});
