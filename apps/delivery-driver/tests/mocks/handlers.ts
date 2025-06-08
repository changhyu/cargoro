import { graphql, http, HttpResponse } from 'msw';

// GraphQL 핸들러
const graphqlHandlers = [
  // 배송 목록 조회
  graphql.query('GetDeliveries', () => {
    return HttpResponse.json({
      data: {
        deliveries: [
          {
            id: '1',
            pickupAddress: '서울시 강남구 테헤란로 123',
            deliveryAddress: '서울시 서초구 반포대로 456',
            status: 'ASSIGNED',
            pickupTime: new Date().toISOString(),
            deliveryTime: new Date(Date.now() + 3600000).toISOString(),
            vehicleInfo: {
              model: '아반떼 CN7',
              plateNumber: '12가 3456',
            },
          },
        ],
      },
    });
  }),

  // 배송 상태 업데이트
  graphql.mutation('UpdateDeliveryStatus', ({ variables }) => {
    return HttpResponse.json({
      data: {
        updateDeliveryStatus: {
          id: variables.id,
          status: variables.status,
        },
      },
    });
  }),

  // 위치 업데이트
  graphql.mutation('UpdateDriverLocation', ({ variables }) => {
    return HttpResponse.json({
      data: {
        updateDriverLocation: {
          success: true,
          location: {
            latitude: variables.latitude,
            longitude: variables.longitude,
          },
        },
      },
    });
  }),
];

// REST API 핸들러
const restHandlers = [
  // 인증 관련
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-auth-token',
      user: {
        id: '1',
        name: '김기사',
        email: 'driver@example.com',
        role: 'DRIVER',
      },
    });
  }),

  // 프로필 조회
  http.get('/api/profile', () => {
    return HttpResponse.json({
      id: '1',
      name: '김기사',
      email: 'driver@example.com',
      phone: '010-1234-5678',
      totalDeliveries: 150,
      rating: 4.8,
    });
  }),

  // 알림 조회
  http.get('/api/notifications', () => {
    return HttpResponse.json({
      notifications: [
        {
          id: '1',
          title: '새로운 배송 건',
          message: '새로운 배송 건이 배정되었습니다.',
          type: 'DELIVERY_ASSIGNED',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }),
];

export const handlers = [...graphqlHandlers, ...restHandlers];
