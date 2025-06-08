/**
 * GraphQL 리졸버
 * 서비스 간 통신을 통해 여러 API의 데이터를 통합
 */
const { callService } = require('../middleware/service-connector');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

// 스칼라 타입 정의
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date 스칼라 타입 (YYYY-MM-DD)',
  serialize(value) {
    return value.toISOString().split('T')[0];
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 날짜 및 시간 포맷',
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const uuidScalar = new GraphQLScalarType({
  name: 'UUID',
  description: 'UUID 스칼라 타입',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});

const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON 스칼라 타입',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return typeof value === 'string' ? JSON.parse(value) : value;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        return ast.fields.reduce((obj, field) => {
          obj[field.name.value] = field.value.value;
          return obj;
        }, {});
      default:
        return null;
    }
  },
});

/**
 * 페이지네이션 처리 도우미 함수
 * @param {Array} items - 전체 아이템 배열
 * @param {Object} pagination - 페이지네이션 파라미터
 * @param {Function} getCursor - 아이템에서 커서 값을 추출하는 함수
 * @returns {Object} 페이지네이션 적용된 결과
 */
function applyPagination(items, pagination, getCursor = item => item.id) {
  const { first, after, last, before } = pagination || {};

  let result = [...items];

  // after 커서 이후 필터링
  if (after) {
    const afterIndex = result.findIndex(item => getCursor(item) === after);
    if (afterIndex >= 0) {
      result = result.slice(afterIndex + 1);
    }
  }

  // before 커서 이전 필터링
  if (before) {
    const beforeIndex = result.findIndex(item => getCursor(item) === before);
    if (beforeIndex >= 0) {
      result = result.slice(0, beforeIndex);
    }
  }

  // 전체 개수 저장
  const totalCount = result.length;

  // first/last 개수 제한 적용
  if (first && first > 0) {
    result = result.slice(0, first);
  } else if (last && last > 0) {
    result = result.slice(-last);
  }

  // 엣지 및 페이지 정보 생성
  const edges = result.map(item => ({
    node: item,
    cursor: getCursor(item),
  }));

  const pageInfo = {
    hasNextPage: after
      ? afterIndex + 1 + result.length < items.length
      : result.length < items.length,
    hasPreviousPage: before ? beforeIndex > 0 : after != null,
    startCursor: edges.length > 0 ? edges[0].cursor : null,
    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
  };

  return {
    edges,
    pageInfo,
    totalCount,
  };
}

// 리졸버 정의
const resolvers = {
  // 스칼라 타입 리졸버
  Date: dateScalar,
  DateTime: dateTimeScalar,
  UUID: uuidScalar,
  JSON: jsonScalar,

  // 루트 타입 리졸버
  Query: {
    // 사용자 & 인증
    me: async (_, __, { user }) => {
      if (!user) return null;
      return await callService('core-api', `/api/users/${user.id}`);
    },

    user: async (_, { id }) => {
      return await callService('core-api', `/api/users/${id}`);
    },

    users: async (_, { pagination, filter }) => {
      const params = { ...filter };
      const users = await callService('core-api', '/api/users', 'GET', params);
      return applyPagination(users, pagination);
    },

    // 조직
    organization: async (_, { id }) => {
      return await callService('core-api', `/api/organizations/${id}`);
    },

    organizations: async (_, { pagination, filter }) => {
      const params = { ...filter };
      const organizations = await callService('core-api', '/api/organizations', 'GET', params);
      return applyPagination(organizations, pagination);
    },

    // 차량
    vehicle: async (_, { id }) => {
      return await callService('fleet-api', `/api/vehicles/${id}`);
    },

    vehicles: async (_, { pagination, filter }) => {
      const params = { ...filter };
      const vehicles = await callService('fleet-api', '/api/vehicles', 'GET', params);
      return applyPagination(vehicles, pagination);
    },

    // 예약
    booking: async (_, { id }) => {
      return await callService('repair-api', `/api/bookings/${id}`);
    },

    bookings: async (_, { pagination, filter }) => {
      const params = { ...filter };
      const bookings = await callService('repair-api', '/api/bookings', 'GET', params);
      return applyPagination(bookings, pagination);
    },

    // 정비 항목
    maintenanceItem: async (_, { id }) => {
      return await callService('repair-api', `/api/maintenance/${id}`);
    },

    maintenanceItems: async (_, { bookingId, pagination }) => {
      return await callService('repair-api', `/api/bookings/${bookingId}/maintenance`);
    },

    // 부품
    part: async (_, { id }) => {
      return await callService('parts-api', `/api/parts/${id}`);
    },

    partByPartNumber: async (_, { part_number }) => {
      return await callService('parts-api', `/api/parts/by-part-number/${part_number}`);
    },

    parts: async (_, { pagination, filter }) => {
      const params = { ...filter };
      const parts = await callService('parts-api', '/api/parts', 'GET', params);
      return applyPagination(parts, pagination);
    },

    // 공급업체
    supplier: async (_, { id }) => {
      return await callService('parts-api', `/api/suppliers/${id}`);
    },

    suppliers: async (_, { pagination, filter }) => {
      const params = { ...filter };
      const suppliers = await callService('parts-api', '/api/suppliers', 'GET', params);
      return applyPagination(suppliers, pagination);
    },

    supplierParts: async (_, { supplierId }) => {
      return await callService('parts-api', `/api/suppliers/${supplierId}/parts`);
    },

    // 주문
    order: async (_, { id }) => {
      return await callService('parts-api', `/api/orders/${id}`);
    },

    orders: async (_, { pagination, filter }) => {
      const params = { ...filter };
      const orders = await callService('parts-api', '/api/orders', 'GET', params);
      return applyPagination(orders, pagination);
    },

    orderItems: async (_, { orderId }) => {
      return await callService('parts-api', `/api/orders/${orderId}/items`);
    },

    // 재고 이동
    inventoryMovements: async (_, { partId, fromDate, toDate }) => {
      const params = { fromDate, toDate };
      return await callService('parts-api', `/api/inventory/movements/${partId}`, 'GET', params);
    },

    // 탁송
    delivery: async (_, { id }) => {
      return await callService('delivery-api', `/api/deliveries/${id}`);
    },

    deliveries: async (_, { pagination, filter }) => {
      const params = { ...filter };
      const deliveries = await callService('delivery-api', '/api/deliveries', 'GET', params);
      return applyPagination(deliveries, pagination);
    },

    deliveriesByDriver: async (_, { driverId, pagination, filter }) => {
      const params = { ...filter };
      const deliveries = await callService(
        'delivery-api',
        `/api/deliveries/by-driver/${driverId}`,
        'GET',
        params
      );
      return applyPagination(deliveries, pagination);
    },

    deliveriesByVehicle: async (_, { vehicleId, pagination, filter }) => {
      const params = { ...filter };
      const deliveries = await callService(
        'delivery-api',
        `/api/deliveries/by-vehicle/${vehicleId}`,
        'GET',
        params
      );
      return applyPagination(deliveries, pagination);
    },

    // 탁송 로그
    deliveryLogs: async (_, { deliveryId }) => {
      return await callService('delivery-api', `/api/deliveries/${deliveryId}/logs`);
    },

    // 경로 포인트
    routePoints: async (_, { deliveryId }) => {
      return await callService('delivery-api', `/api/deliveries/${deliveryId}/routes`);
    },

    // 기사 일정
    driverSchedule: async (_, { id }) => {
      return await callService('delivery-api', `/api/drivers/schedules/${id}`);
    },

    driverSchedules: async (_, { driverId, date, isAvailable, pagination }) => {
      const params = { driverId, date, is_available: isAvailable };
      const schedules = await callService('delivery-api', '/api/drivers/schedules', 'GET', params);
      return applyPagination(schedules, pagination);
    },
  },

  Mutation: {
    // 인증
    login: async (_, { input }) => {
      return await callService('core-api', '/api/auth/login', 'POST', input);
    },

    refreshToken: async (_, { refreshToken }) => {
      return await callService('core-api', '/api/auth/refresh', 'POST', { refreshToken });
    },

    logout: async (_, __, { user }) => {
      if (!user) return false;
      await callService('core-api', '/api/auth/logout', 'POST');
      return true;
    },

    // 사용자
    createUser: async (_, { input }) => {
      return await callService('core-api', '/api/users', 'POST', input);
    },

    updateUser: async (_, { id, input }) => {
      return await callService('core-api', `/api/users/${id}`, 'PATCH', input);
    },

    deleteUser: async (_, { id }) => {
      await callService('core-api', `/api/users/${id}`, 'DELETE');
      return true;
    },

    // 조직
    createOrganization: async (_, { input }) => {
      return await callService('core-api', '/api/organizations', 'POST', input);
    },

    updateOrganization: async (_, { id, input }) => {
      return await callService('core-api', `/api/organizations/${id}`, 'PATCH', input);
    },

    deleteOrganization: async (_, { id }) => {
      await callService('core-api', `/api/organizations/${id}`, 'DELETE');
      return true;
    },

    // 차량
    createVehicle: async (_, { input }) => {
      return await callService('fleet-api', '/api/vehicles', 'POST', input);
    },

    updateVehicle: async (_, { id, input }) => {
      return await callService('fleet-api', `/api/vehicles/${id}`, 'PATCH', input);
    },

    deleteVehicle: async (_, { id }) => {
      await callService('fleet-api', `/api/vehicles/${id}`, 'DELETE');
      return true;
    },

    // 예약
    createBooking: async (_, { input }) => {
      return await callService('repair-api', '/api/bookings', 'POST', input);
    },

    updateBooking: async (_, { id, input }) => {
      return await callService('repair-api', `/api/bookings/${id}`, 'PATCH', input);
    },

    cancelBooking: async (_, { id }) => {
      return await callService('repair-api', `/api/bookings/${id}/cancel`, 'PATCH');
    },

    completeBooking: async (_, { id }) => {
      return await callService('repair-api', `/api/bookings/${id}/complete`, 'PATCH');
    },

    // 부품
    createPart: async (_, { input }) => {
      return await callService('parts-api', '/api/parts', 'POST', input);
    },

    updatePart: async (_, { id, input }) => {
      return await callService('parts-api', `/api/parts/${id}`, 'PATCH', input);
    },

    deletePart: async (_, { id }) => {
      await callService('parts-api', `/api/parts/${id}`, 'DELETE');
      return true;
    },

    adjustPartStock: async (_, { id, quantity, reason }) => {
      return await callService('parts-api', `/api/parts/${id}/stock`, 'PATCH', null, {
        params: { quantity, reason },
      });
    },

    // 공급업체
    createSupplier: async (_, { input }) => {
      return await callService('parts-api', '/api/suppliers', 'POST', input);
    },

    updateSupplier: async (_, { id, input }) => {
      return await callService('parts-api', `/api/suppliers/${id}`, 'PATCH', input);
    },

    deleteSupplier: async (_, { id }) => {
      await callService('parts-api', `/api/suppliers/${id}`, 'DELETE');
      return true;
    },

    updateSupplierStatus: async (_, { id, isActive }) => {
      return await callService('parts-api', `/api/suppliers/${id}/status`, 'PATCH', null, {
        params: { is_active: isActive },
      });
    },

    // 주문
    createOrder: async (_, { input }) => {
      return await callService('parts-api', '/api/orders', 'POST', input);
    },

    updateOrder: async (_, { id, input }) => {
      return await callService('parts-api', `/api/orders/${id}`, 'PATCH', input);
    },

    deleteOrder: async (_, { id }) => {
      await callService('parts-api', `/api/orders/${id}`, 'DELETE');
      return true;
    },

    // 탁송
    createDelivery: async (_, { input }) => {
      return await callService('delivery-api', '/api/deliveries', 'POST', input);
    },

    updateDelivery: async (_, { id, input }) => {
      return await callService('delivery-api', `/api/deliveries/${id}`, 'PATCH', input);
    },

    deleteDelivery: async (_, { id }) => {
      await callService('delivery-api', `/api/deliveries/${id}`, 'DELETE');
      return true;
    },

    assignDriver: async (_, { id, driverId }) => {
      return await callService('delivery-api', `/api/deliveries/${id}/assign`, 'PATCH', null, {
        params: { driver_id: driverId },
      });
    },

    updateDeliveryStatus: async (_, { id, status, details }) => {
      const params = { status, details };
      return await callService('delivery-api', `/api/deliveries/${id}/status`, 'PATCH', null, {
        params,
      });
    },

    completeDelivery: async (_, { id, completedBy, location }) => {
      const params = { completed_by: completedBy, location };
      return await callService('delivery-api', `/api/deliveries/${id}/complete`, 'PATCH', null, {
        params,
      });
    },

    cancelDelivery: async (_, { id, reason }) => {
      return await callService('delivery-api', `/api/deliveries/${id}/cancel`, 'PATCH', null, {
        params: { reason },
      });
    },

    // 기사 일정
    createDriverSchedule: async (_, { input }) => {
      return await callService('delivery-api', '/api/drivers/schedules', 'POST', input);
    },

    updateDriverSchedule: async (_, { id, input }) => {
      return await callService('delivery-api', `/api/drivers/schedules/${id}`, 'PATCH', input);
    },

    deleteDriverSchedule: async (_, { id }) => {
      await callService('delivery-api', `/api/drivers/schedules/${id}`, 'DELETE');
      return true;
    },
  },

  // 타입 관계 리졸버
  User: {
    organization: async parent => {
      if (!parent.organizationId) return null;
      return await callService('core-api', `/api/organizations/${parent.organizationId}`);
    },

    vehicles: async parent => {
      return await callService('fleet-api', '/api/vehicles', 'GET', { ownerId: parent.id });
    },

    deliveries: async parent => {
      if (parent.role !== 'DRIVER') return null;
      return await callService('delivery-api', `/api/deliveries/by-driver/${parent.id}`);
    },
  },

  Organization: {
    users: async parent => {
      return await callService('core-api', '/api/users', 'GET', { organizationId: parent.id });
    },

    vehicles: async parent => {
      return await callService('fleet-api', '/api/vehicles', 'GET', { organizationId: parent.id });
    },
  },

  Vehicle: {
    owner: async parent => {
      return await callService('core-api', `/api/users/${parent.ownerId}`);
    },

    organization: async parent => {
      if (!parent.organizationId) return null;
      return await callService('core-api', `/api/organizations/${parent.organizationId}`);
    },

    deliveries: async parent => {
      return await callService('delivery-api', `/api/deliveries/by-vehicle/${parent.id}`);
    },
  },

  Booking: {
    customer: async parent => {
      return await callService('core-api', `/api/users/${parent.customerId}`);
    },

    vehicle: async parent => {
      return await callService('fleet-api', `/api/vehicles/${parent.vehicleId}`);
    },

    maintenanceItems: async parent => {
      return await callService('repair-api', `/api/bookings/${parent.id}/maintenance`);
    },
  },

  Part: {
    suppliers: async parent => {
      if (!parent.supplier_ids || parent.supplier_ids.length === 0) return [];

      // 병렬로 여러 공급업체 데이터 가져오기
      const supplierPromises = parent.supplier_ids.map(id =>
        callService('parts-api', `/api/suppliers/${id}`)
      );

      return await Promise.all(supplierPromises);
    },
  },

  Supplier: {
    organization: async parent => {
      return await callService('core-api', `/api/organizations/${parent.organizationId}`);
    },

    parts: async parent => {
      return await callService('parts-api', `/api/suppliers/${parent.id}/parts`);
    },
  },

  Order: {
    supplier: async parent => {
      return await callService('parts-api', `/api/suppliers/${parent.supplier_id}`);
    },

    items: async parent => {
      return await callService('parts-api', `/api/orders/${parent.id}/items`);
    },
  },

  OrderItem: {
    order: async parent => {
      return await callService('parts-api', `/api/orders/${parent.order_id}`);
    },

    part: async parent => {
      return await callService('parts-api', `/api/parts/${parent.part_id}`);
    },
  },

  Delivery: {
    vehicle: async parent => {
      return await callService('fleet-api', `/api/vehicles/${parent.vehicle_id}`);
    },

    driver: async parent => {
      if (!parent.driver_id) return null;
      return await callService('core-api', `/api/users/${parent.driver_id}`);
    },

    routePoints: async parent => {
      return await callService('delivery-api', `/api/deliveries/${parent.id}/routes`);
    },

    deliveryLogs: async parent => {
      return await callService('delivery-api', `/api/deliveries/${parent.id}/logs`);
    },
  },

  RoutePoint: {
    delivery: async parent => {
      return await callService('delivery-api', `/api/deliveries/${parent.delivery_id}`);
    },
  },

  DeliveryLog: {
    delivery: async parent => {
      return await callService('delivery-api', `/api/deliveries/${parent.delivery_id}`);
    },
  },

  DriverSchedule: {
    driver: async parent => {
      return await callService('core-api', `/api/users/${parent.driver_id}`);
    },
  },
};

module.exports = resolvers;
