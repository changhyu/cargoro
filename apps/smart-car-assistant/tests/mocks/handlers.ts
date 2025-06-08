import { graphql, http, HttpResponse } from 'msw';

// GraphQL 핸들러
const graphqlHandlers = [
  // 차량 상태 조회
  graphql.query('GetVehicleStatus', () => {
    return HttpResponse.json({
      data: {
        vehicleStatus: {
          id: '1',
          engineRunning: true,
          batteryVoltage: 12.6,
          fuelLevel: 75,
          engineTemp: 90,
          speed: 0,
          rpm: 800,
          odometer: 45123,
          location: {
            latitude: 37.5326,
            longitude: 127.0246,
          },
        },
      },
    });
  }),

  // 진단 데이터 조회
  graphql.query('GetDiagnosticData', () => {
    return HttpResponse.json({
      data: {
        diagnosticData: {
          dtcCodes: [],
          engineLoad: 35,
          coolantTemp: 88,
          oilPressure: 40,
          transmissionTemp: 75,
          lastUpdated: new Date().toISOString(),
        },
      },
    });
  }),

  // 차량 정보 업데이트
  graphql.mutation('UpdateVehicleInfo', ({ variables }) => {
    return HttpResponse.json({
      data: {
        updateVehicleInfo: {
          id: variables.id,
          success: true,
        },
      },
    });
  }),

  // 알림 설정 업데이트
  graphql.mutation('UpdateNotificationSettings', ({ variables }) => {
    return HttpResponse.json({
      data: {
        updateNotificationSettings: {
          userId: variables.userId,
          settings: variables.settings,
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
        name: '김차주',
        email: 'owner@example.com',
        role: 'VEHICLE_OWNER',
      },
    });
  }),

  // 차량 목록 조회
  http.get('/api/vehicles', () => {
    return HttpResponse.json({
      vehicles: [
        {
          id: '1',
          model: '제네시스 G90',
          year: 2023,
          plateNumber: '12가 3456',
          vin: 'KMHGN4JE2NU123456',
          connected: true,
        },
      ],
    });
  }),

  // OBD 연결 상태
  http.get('/api/obd/status', () => {
    return HttpResponse.json({
      connected: true,
      deviceId: 'OBD-123456',
      lastSync: new Date().toISOString(),
    });
  }),

  // 정비 기록 조회
  http.get('/api/maintenance/history', () => {
    return HttpResponse.json({
      history: [
        {
          id: '1',
          date: '2024-01-15',
          type: '정기 점검',
          workshop: '제네시스 강남 서비스센터',
          items: ['엔진오일 교환', '에어필터 교환'],
          cost: 150000,
        },
      ],
    });
  }),

  // 알림 조회
  http.get('/api/notifications', () => {
    return HttpResponse.json({
      notifications: [
        {
          id: '1',
          title: '정비 시기 알림',
          message: '엔진오일 교환 시기가 다가왔습니다.',
          type: 'MAINTENANCE_REMINDER',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }),
];

export const handlers = [...graphqlHandlers, ...restHandlers];
