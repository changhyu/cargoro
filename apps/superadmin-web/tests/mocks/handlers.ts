import { graphql, http, HttpResponse } from 'msw';

// GraphQL 핸들러
const graphqlHandlers = [
  // 사용자 목록 조회
  graphql.query('GetUsers', () => {
    return HttpResponse.json({
      data: {
        users: [
          {
            id: '1',
            email: 'admin@cargoro.com',
            name: '관리자',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            createdAt: '2024-01-01T00:00:00Z',
            lastLoginAt: new Date().toISOString(),
          },
          {
            id: '2',
            email: 'manager@workshop.com',
            name: '정비소매니저',
            role: 'WORKSHOP_MANAGER',
            status: 'ACTIVE',
            createdAt: '2024-01-15T00:00:00Z',
            lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        totalCount: 2,
      },
    });
  }),

  // 시스템 통계 조회
  graphql.query('GetSystemStats', () => {
    return HttpResponse.json({
      data: {
        systemStats: {
          totalUsers: 1245,
          activeUsers: 892,
          totalWorkshops: 156,
          totalVehicles: 3421,
          totalBookings: 8943,
          monthlyRevenue: 125000000,
          dailyActiveUsers: 342,
          newUsersToday: 15,
        },
      },
    });
  }),

  // 권한 목록 조회
  graphql.query('GetPermissions', () => {
    return HttpResponse.json({
      data: {
        permissions: [
          {
            id: '1',
            name: 'users:read',
            description: '사용자 조회 권한',
            category: 'USERS',
          },
          {
            id: '2',
            name: 'users:write',
            description: '사용자 생성/수정 권한',
            category: 'USERS',
          },
          {
            id: '3',
            name: 'users:delete',
            description: '사용자 삭제 권한',
            category: 'USERS',
          },
          {
            id: '4',
            name: 'workshops:manage',
            description: '정비소 관리 권한',
            category: 'WORKSHOPS',
          },
        ],
      },
    });
  }),

  // 사용자 생성
  graphql.mutation('CreateUser', ({ variables }) => {
    return HttpResponse.json({
      data: {
        createUser: {
          id: 'new-user-id',
          email: variables.email,
          name: variables.name,
          role: variables.role,
          status: 'ACTIVE',
        },
      },
    });
  }),

  // 사용자 권한 업데이트
  graphql.mutation('UpdateUserPermissions', ({ variables }) => {
    return HttpResponse.json({
      data: {
        updateUserPermissions: {
          userId: variables.userId,
          permissions: variables.permissions,
          success: true,
        },
      },
    });
  }),
];

// REST API 핸들러
const restHandlers = [
  // 관리자 인증
  http.post('/api/auth/admin/login', () => {
    return HttpResponse.json({
      token: 'mock-admin-token',
      user: {
        id: '1',
        email: 'admin@cargoro.com',
        name: '슈퍼관리자',
        role: 'SUPER_ADMIN',
        permissions: [
          'users:read',
          'users:write',
          'users:delete',
          'workshops:manage',
          'system:manage',
        ],
      },
    });
  }),

  // 감사 로그 조회
  http.get('/api/admin/audit-logs', () => {
    return HttpResponse.json({
      logs: [
        {
          id: '1',
          action: 'USER_CREATED',
          userId: '1',
          targetId: '2',
          targetType: 'USER',
          details: '새 사용자 생성: manager@workshop.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          action: 'PERMISSION_UPDATED',
          userId: '1',
          targetId: '3',
          targetType: 'USER',
          details: '권한 업데이트: workshops:manage 추가',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      totalCount: 2,
    });
  }),

  // 시스템 설정 조회
  http.get('/api/admin/settings', () => {
    return HttpResponse.json({
      settings: {
        maintenanceMode: false,
        allowUserRegistration: true,
        requireEmailVerification: true,
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
        },
      },
    });
  }),

  // 알림 조회
  http.get('/api/admin/notifications', () => {
    return HttpResponse.json({
      notifications: [
        {
          id: '1',
          title: '시스템 업데이트',
          message: '새로운 시스템 업데이트가 준비되었습니다.',
          type: 'SYSTEM_UPDATE',
          priority: 'HIGH',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: '보안 경고',
          message: '비정상적인 로그인 시도가 감지되었습니다.',
          type: 'SECURITY_ALERT',
          priority: 'CRITICAL',
          read: false,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
    });
  }),
];

export const handlers = [...graphqlHandlers, ...restHandlers];
