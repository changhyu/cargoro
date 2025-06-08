import { graphql, http, HttpResponse } from 'msw';

// GraphQL 핸들러
const graphqlHandlers = [
  // 부품 목록 조회
  graphql.query('GetParts', ({ variables }) => {
    return HttpResponse.json({
      data: {
        parts: [
          {
            id: '1',
            partNumber: 'OIL-5W30-1L',
            name: '엔진오일 5W30 1L',
            category: 'ENGINE',
            manufacturer: '모빌',
            price: 25000,
            stock: 150,
            minStock: 50,
            status: 'IN_STOCK',
            location: 'A-1-3',
          },
          {
            id: '2',
            partNumber: 'FILTER-AIR-GEN',
            name: '에어필터 (제네시스용)',
            category: 'FILTER',
            manufacturer: '현대순정',
            price: 35000,
            stock: 25,
            minStock: 20,
            status: 'IN_STOCK',
            location: 'B-2-1',
          },
          {
            id: '3',
            partNumber: 'BRAKE-PAD-FRONT',
            name: '프론트 브레이크 패드',
            category: 'BRAKE',
            manufacturer: 'ATE',
            price: 85000,
            stock: 12,
            minStock: 15,
            status: 'LOW_STOCK',
            location: 'C-3-2',
          },
        ],
        totalCount: 3,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    });
  }),

  // 부품 상세 조회
  graphql.query('GetPartDetail', ({ variables }) => {
    return HttpResponse.json({
      data: {
        part: {
          id: variables.id,
          partNumber: 'OIL-5W30-1L',
          name: '엔진오일 5W30 1L',
          category: 'ENGINE',
          manufacturer: '모빌',
          price: 25000,
          cost: 18000,
          stock: 150,
          minStock: 50,
          maxStock: 300,
          status: 'IN_STOCK',
          location: 'A-1-3',
          barcode: '8801234567890',
          description: '고급 합성 엔진오일',
          compatibleVehicles: ['제네시스 G90', '제네시스 G80', 'BMW 5시리즈'],
          suppliers: [
            {
              id: '1',
              name: '오토파츠 코리아',
              price: 18000,
              leadTime: 2,
            },
          ],
        },
      },
    });
  }),

  // 재고 현황 조회
  graphql.query('GetInventoryStatus', () => {
    return HttpResponse.json({
      data: {
        inventoryStatus: {
          totalItems: 3456,
          totalValue: 234567000,
          lowStockItems: 23,
          outOfStockItems: 5,
          categoryBreakdown: [
            { category: 'ENGINE', count: 450, value: 45000000 },
            { category: 'FILTER', count: 320, value: 12000000 },
            { category: 'BRAKE', count: 280, value: 35000000 },
          ],
        },
      },
    });
  }),

  // 부품 추가
  graphql.mutation('CreatePart', ({ variables }) => {
    return HttpResponse.json({
      data: {
        createPart: {
          id: 'new-part-id',
          partNumber: variables.partNumber,
          name: variables.name,
          category: variables.category,
          price: variables.price,
          stock: variables.stock,
          status: 'IN_STOCK',
        },
      },
    });
  }),

  // 재고 조정
  graphql.mutation('AdjustInventory', ({ variables }) => {
    return HttpResponse.json({
      data: {
        adjustInventory: {
          partId: variables.partId,
          previousStock: 150,
          newStock: variables.newQuantity,
          adjustment: variables.adjustment,
          reason: variables.reason,
          adjustedBy: 'user-1',
          adjustedAt: new Date().toISOString(),
        },
      },
    });
  }),

  // 주문 생성
  graphql.mutation('CreateOrder', ({ variables }) => {
    return HttpResponse.json({
      data: {
        createOrder: {
          id: 'new-order-id',
          orderNumber: 'ORD-2024-001',
          supplierId: variables.supplierId,
          items: variables.items,
          totalAmount: variables.items.reduce(
            (sum: number, item: any) => sum + item.price * item.quantity,
            0
          ),
          status: 'PENDING',
          createdAt: new Date().toISOString(),
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
        name: '부품관리자',
        email: 'parts@workshop.com',
        role: 'PARTS_MANAGER',
        permissions: ['parts:read', 'parts:write', 'inventory:manage'],
      },
    });
  }),

  // 대시보드 통계
  http.get('/api/parts/dashboard/stats', () => {
    return HttpResponse.json({
      totalParts: 3456,
      lowStockAlerts: 23,
      pendingOrders: 5,
      monthlyUsage: 1234,
      topMovingParts: [
        { id: '1', name: '엔진오일 5W30', quantity: 245 },
        { id: '2', name: '에어필터', quantity: 123 },
        { id: '3', name: '브레이크 패드', quantity: 89 },
      ],
    });
  }),

  // 공급업체 목록
  http.get('/api/suppliers', () => {
    return HttpResponse.json({
      suppliers: [
        {
          id: '1',
          name: '오토파츠 코리아',
          contact: '02-1234-5678',
          email: 'info@autoparts.co.kr',
          rating: 4.5,
        },
        {
          id: '2',
          name: '글로벌 파츠',
          contact: '02-2345-6789',
          email: 'sales@globalparts.com',
          rating: 4.2,
        },
      ],
    });
  }),

  // 부품 이미지 업로드
  http.post('/api/parts/:id/image', () => {
    return HttpResponse.json({
      imageUrl: 'https://example.com/parts/image.jpg',
      thumbnailUrl: 'https://example.com/parts/thumb.jpg',
    });
  }),

  // 바코드 스캔
  http.post('/api/parts/barcode/scan', ({ request }) => {
    return HttpResponse.json({
      part: {
        id: '1',
        partNumber: 'OIL-5W30-1L',
        name: '엔진오일 5W30 1L',
        stock: 150,
        location: 'A-1-3',
      },
    });
  }),

  // 알림 조회
  http.get('/api/notifications', () => {
    return HttpResponse.json({
      notifications: [
        {
          id: '1',
          title: '재고 부족 경고',
          message: '브레이크 패드 재고가 최소 수량 이하입니다.',
          type: 'LOW_STOCK',
          priority: 'HIGH',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: '주문 도착',
          message: '오토파츠 코리아 주문이 도착했습니다.',
          type: 'ORDER_ARRIVED',
          priority: 'MEDIUM',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    });
  }),
];

export const handlers = [...graphqlHandlers, ...restHandlers];
