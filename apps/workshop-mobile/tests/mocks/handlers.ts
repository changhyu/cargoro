import { graphql, http, HttpResponse } from 'msw';

// GraphQL 핸들러
const graphqlHandlers = [
  // 정비소 정보 조회
  graphql.query('GetWorkshop', () => {
    return HttpResponse.json({
      data: {
        workshop: {
          id: '1',
          name: '카고로 정비소',
          address: '서울시 강남구 테헤란로 123',
          phoneNumber: '02-1234-5678',
          businessHours: {
            monday: '09:00-18:00',
            tuesday: '09:00-18:00',
            wednesday: '09:00-18:00',
            thursday: '09:00-18:00',
            friday: '09:00-18:00',
            saturday: '09:00-13:00',
            sunday: 'closed',
          },
        },
      },
    });
  }),

  // 예약 목록 조회
  graphql.query('GetBookings', () => {
    return HttpResponse.json({
      data: {
        bookings: [
          {
            id: '1',
            customerName: '김고객',
            vehicleModel: '제네시스 G90',
            plateNumber: '12가 3456',
            serviceType: '정기점검',
            scheduledTime: new Date().toISOString(),
            status: 'CONFIRMED',
            estimatedDuration: 120,
          },
          {
            id: '2',
            customerName: '이고객',
            vehicleModel: 'BMW 520d',
            plateNumber: '34나 5678',
            serviceType: '엔진오일 교환',
            scheduledTime: new Date(Date.now() + 3600000).toISOString(),
            status: 'PENDING',
            estimatedDuration: 60,
          },
        ],
      },
    });
  }),

  // 기술자 목록 조회
  graphql.query('GetTechnicians', () => {
    return HttpResponse.json({
      data: {
        technicians: [
          {
            id: '1',
            name: '김기술',
            specialties: ['엔진정비', '전기장치'],
            currentStatus: 'AVAILABLE',
            todayCompletedJobs: 3,
          },
          {
            id: '2',
            name: '박정비',
            specialties: ['하체정비', '브레이크'],
            currentStatus: 'BUSY',
            todayCompletedJobs: 2,
          },
        ],
      },
    });
  }),

  // 예약 상태 업데이트
  graphql.mutation('UpdateBookingStatus', ({ variables }) => {
    return HttpResponse.json({
      data: {
        updateBookingStatus: {
          id: variables.id,
          status: variables.status,
          success: true,
        },
      },
    });
  }),

  // 기술자 배정
  graphql.mutation('AssignTechnician', ({ variables }) => {
    return HttpResponse.json({
      data: {
        assignTechnician: {
          bookingId: variables.bookingId,
          technicianId: variables.technicianId,
          success: true,
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
        name: '홍길동',
        email: 'manager@workshop.com',
        role: 'WORKSHOP_MANAGER',
        workshopId: '1',
      },
    });
  }),

  // 대시보드 통계
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json({
      todayBookings: 12,
      completedServices: 8,
      pendingServices: 4,
      availableTechnicians: 3,
      totalRevenue: 2450000,
      averageServiceTime: 95,
    });
  }),

  // 알림 조회
  http.get('/api/notifications', () => {
    return HttpResponse.json({
      notifications: [
        {
          id: '1',
          title: '새로운 예약',
          message: '김고객님의 정기점검 예약이 접수되었습니다.',
          type: 'NEW_BOOKING',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: '부품 도착',
          message: 'BMW 520d 브레이크 패드가 도착했습니다.',
          type: 'PARTS_ARRIVED',
          read: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    });
  }),

  // 재고 조회
  http.get('/api/inventory/parts', () => {
    return HttpResponse.json({
      parts: [
        {
          id: '1',
          name: '엔진오일 5W30',
          quantity: 45,
          minimumStock: 20,
          unit: 'L',
        },
        {
          id: '2',
          name: '에어필터',
          quantity: 12,
          minimumStock: 10,
          unit: '개',
        },
      ],
    });
  }),
];

export const handlers = [...graphqlHandlers, ...restHandlers];
