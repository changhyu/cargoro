import { RepairJob, RepairStatus } from '../../../features/repair-management/types';

/**
 * 정비 작업 모의 데이터
 */
export const mockJobs: RepairJob[] = [
  {
    id: 'repair-001',
    vehicleInfo: {
      id: 'vehicle-001',
      licensePlate: '12가 3456',
      manufacturer: '현대',
      model: '아반떼',
      year: 2021,
      vin: 'KMHDN41VP7U123456',
    },
    customerInfo: {
      id: 'customer-001',
      name: '홍길동',
      phone: '010-1234-5678',
      email: 'hong@example.com',
    },
    technicianInfo: {
      id: 'tech-001',
      name: '김정비',
      role: '정비사',
    },
    description: '엔진 오일 교체 및 타이어 로테이션',
    notes: '후방 타이어 마모가 심한 상태입니다.',
    status: 'completed',
    createdAt: '2025-05-01T09:00:00Z',
    updatedAt: '2025-05-01T11:30:00Z',
    completedDate: '2025-05-01T11:30:00Z',
    estimatedDuration: 90,
    cost: {
      labor: 50000,
      parts: 30000,
      total: 80000,
    },
    usedParts: [
      {
        id: 'part-001',
        name: '엔진 오일 필터',
        partNumber: 'OF-12345',
        quantity: 1,
        cost: 10000,
      },
      {
        id: 'part-002',
        name: '엔진 오일',
        partNumber: 'EO-5W30',
        quantity: 4,
        cost: 20000,
      },
    ],
    priority: 'low',
    type: 'regular',
  },
  {
    id: 'repair-002',
    vehicleInfo: {
      id: 'vehicle-002',
      licensePlate: '34나 5678',
      manufacturer: '기아',
      model: 'K5',
      year: 2022,
      vin: 'KNAG241A9N5123456',
    },
    customerInfo: {
      id: 'customer-002',
      name: '이순신',
      phone: '010-9876-5432',
      email: 'lee@example.com',
    },
    technicianInfo: {
      id: 'tech-002',
      name: '박수리',
      role: '수석 정비사',
    },
    description: '브레이크 패드 교체 및 디스크 점검',
    notes: '프론트 디스크에 미세한 균열이 있어 관찰 필요',
    status: 'in_progress',
    createdAt: '2025-05-02T10:15:00Z',
    updatedAt: '2025-05-02T14:30:00Z',
    estimatedDuration: 120,
    cost: {
      labor: 70000,
      parts: 80000,
      total: 150000,
    },
    usedParts: [
      {
        id: 'part-003',
        name: '브레이크 패드 세트',
        partNumber: 'BP-K5-22',
        quantity: 1,
        cost: 80000,
      },
    ],
    priority: 'high',
    type: 'repair',
  },
  {
    id: 'repair-003',
    vehicleInfo: {
      id: 'vehicle-003',
      licensePlate: '56다 7890',
      manufacturer: '쌍용',
      model: '티볼리',
      year: 2020,
      vin: 'KPT20RTV6L5987654',
    },
    customerInfo: {
      id: 'customer-003',
      name: '강감찬',
      phone: '010-1111-2222',
      email: 'kang@example.com',
    },
    description: '에어컨 가스 충전 및 냉각 시스템 점검',
    notes: '지난 여름에도 동일 증상으로 방문',
    status: 'pending',
    createdAt: '2025-05-03T09:30:00Z',
    updatedAt: '2025-05-03T09:30:00Z',
    scheduledDate: '2025-05-05T13:00:00Z',
    estimatedDuration: 60,
    cost: {
      labor: 40000,
      parts: 15000,
      total: 55000,
    },
    priority: 'low',
    type: 'regular',
  },
  {
    id: 'repair-004',
    vehicleInfo: {
      id: 'vehicle-004',
      licensePlate: '78라 1234',
      manufacturer: '현대',
      model: '그랜저',
      year: 2023,
      vin: 'KMHGU41VP3U654321',
    },
    customerInfo: {
      id: 'customer-004',
      name: '유관순',
      phone: '010-3333-4444',
      email: 'yoo@example.com',
    },
    technicianInfo: {
      id: 'tech-001',
      name: '김정비',
      role: '정비사',
    },
    description: '엔진 경고등 점등 - 진단 및 수리',
    notes: '연료 분사 시스템 오류 코드(P0171) 확인됨',
    status: 'waiting_parts',
    createdAt: '2025-05-03T14:45:00Z',
    updatedAt: '2025-05-03T16:30:00Z',
    estimatedDuration: 180,
    cost: {
      labor: 90000,
      parts: 120000,
      total: 210000,
    },
    diagnostics: [
      {
        id: 'diag-001',
        code: 'P0171',
        description: '연료 시스템 희박 - 뱅크 1',
        timestamp: '2025-05-03T15:20:00Z',
        severity: 'medium',
      },
    ],
    priority: 'urgent',
    type: 'repair',
  },
  {
    id: 'repair-005',
    vehicleInfo: {
      id: 'vehicle-005',
      licensePlate: '90마 5678',
      manufacturer: '기아',
      model: '스포티지',
      year: 2019,
      vin: 'KNDP23TV7K1234567',
    },
    customerInfo: {
      id: 'customer-005',
      name: '신사임당',
      phone: '010-5555-6666',
      email: 'shin@example.com',
    },
    description: '정기 점검 및 소모품 교체',
    notes: '주행거리 40,000km 도달',
    status: 'cancelled',
    createdAt: '2025-05-04T10:00:00Z',
    updatedAt: '2025-05-04T10:30:00Z',
    cost: {
      labor: 30000,
      parts: 25000,
      total: 55000,
    },
    priority: 'low',
    type: 'regular',
  },
  {
    id: 'repair-006',
    vehicleInfo: {
      id: 'vehicle-006',
      licensePlate: '12바 3456',
      manufacturer: '르노삼성',
      model: 'SM6',
      year: 2021,
      vin: 'VF1RJA00566789012',
    },
    customerInfo: {
      id: 'customer-006',
      name: '세종대왕',
      phone: '010-7777-8888',
      email: 'sejong@example.com',
    },
    technicianInfo: {
      id: 'tech-002',
      name: '박수리',
      role: '수석 정비사',
    },
    description: '변속기 오일 누유 수리',
    notes: '차량 주차 시 오일 흔적 발견',
    status: 'in_progress',
    createdAt: '2025-05-04T13:15:00Z',
    updatedAt: '2025-05-04T15:45:00Z',
    estimatedDuration: 240,
    cost: {
      labor: 120000,
      parts: 80000,
      total: 200000,
    },
    priority: 'high',
    type: 'repair',
  },
];

/**
 * 모의 API 응답을 생성하는 함수
 */
export function getMockRepairJobs(filters?: { status?: RepairStatus; searchQuery?: string }): {
  jobs: RepairJob[];
} {
  let filteredJobs = [...mockJobs];

  // 상태 필터링
  if (filters?.status) {
    filteredJobs = filteredJobs.filter(job => job.status === filters.status);
  }

  // 검색어 필터링
  if (filters?.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredJobs = filteredJobs.filter(
      job =>
        job.vehicleInfo.licensePlate.toLowerCase().includes(query) ||
        job.vehicleInfo.vin.toLowerCase().includes(query) ||
        job.customerInfo.name.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
    );
  }

  return { jobs: filteredJobs };
}

/**
 * 특정 ID의 정비 작업을 찾는 함수
 */
export function getMockRepairJobById(id: string): RepairJob | undefined {
  return mockJobs.find(job => job.id === id);
}
