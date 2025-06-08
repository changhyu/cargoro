import { ReservationStatusType } from '@cargoro/types/schema/reservation';

// 히스토리 타입 정의
interface ReservationHistory {
  id: string;
  action: string;
  oldStatus?: ReservationStatusType;
  newStatus: ReservationStatusType;
  notes?: string;
  userName: string;
  timestamp: string;
}

// 확장된 예약 타입 정의
interface ExtendedReservation {
  id: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  status: ReservationStatusType;
  purpose: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
  history?: ReservationHistory[];
}

// 임시 예약 데이터 (실제로는 Prisma로 데이터베이스 연동 예정)
export const mockReservations: ExtendedReservation[] = [
  {
    id: '1',
    vehicleId: 'v1',
    vehicleLicensePlate: '서울 123가 4567',
    customerName: '김고객',
    customerPhone: '010-1234-5678',
    startDate: '2023-05-15T09:00:00',
    endDate: '2023-05-15T18:00:00',
    status: 'confirmed' as ReservationStatusType,
    purpose: '업무용',
    notes: '인천공항 왕복 예정',
    createdAt: '2023-05-10T14:30:00',
    updatedAt: '2023-05-11T10:15:00',
    history: [
      {
        id: 'h1',
        action: '예약 생성',
        newStatus: 'pending' as ReservationStatusType,
        userName: '김관리자',
        timestamp: '2023-05-10T14:30:00',
      },
      {
        id: 'h2',
        action: '예약 상태 변경',
        oldStatus: 'pending' as ReservationStatusType,
        newStatus: 'confirmed' as ReservationStatusType,
        notes: '고객 요청에 따른 예약 확정',
        userName: '김관리자',
        timestamp: '2023-05-11T10:15:00',
      },
    ],
  },
  {
    id: '2',
    vehicleId: 'v2',
    vehicleLicensePlate: '서울 456나 7890',
    customerName: '이사용자',
    customerPhone: '010-9876-5432',
    startDate: '2023-05-20T10:00:00',
    endDate: '2023-05-22T18:00:00',
    status: 'pending' as ReservationStatusType,
    purpose: '출장',
    notes: '부산 왕복',
    createdAt: '2023-05-12T11:20:00',
    history: [
      {
        id: 'h3',
        action: '예약 생성',
        newStatus: 'pending' as ReservationStatusType,
        userName: '이관리자',
        timestamp: '2023-05-12T11:20:00',
      },
    ],
  },
  {
    id: '3',
    vehicleId: 'v3',
    vehicleLicensePlate: '서울 789다 1234',
    customerName: '박사장',
    customerPhone: '010-5555-6666',
    startDate: '2023-05-14T08:00:00',
    endDate: '2023-05-14T17:00:00',
    status: 'completed' as ReservationStatusType,
    purpose: '물류 운송',
    notes: '', // 비어있는 notes 속성 추가
    createdAt: '2023-05-10T09:15:00',
    history: [
      {
        id: 'h4',
        action: '예약 생성',
        newStatus: 'pending' as ReservationStatusType,
        userName: '박관리자',
        timestamp: '2023-05-10T09:15:00',
      },
      {
        id: 'h5',
        action: '예약 상태 변경',
        oldStatus: 'pending' as ReservationStatusType,
        newStatus: 'confirmed' as ReservationStatusType,
        userName: '박관리자',
        timestamp: '2023-05-12T13:40:00',
      },
      {
        id: 'h6',
        action: '예약 상태 변경',
        oldStatus: 'confirmed' as ReservationStatusType,
        newStatus: 'in_progress' as ReservationStatusType,
        userName: '박관리자',
        timestamp: '2023-05-14T08:05:00',
      },
      {
        id: 'h7',
        action: '예약 상태 변경',
        oldStatus: 'in_progress' as ReservationStatusType,
        newStatus: 'completed' as ReservationStatusType,
        userName: '박관리자',
        timestamp: '2023-05-14T17:10:00',
        notes: '운송 완료',
      },
    ],
  },
  {
    id: '4',
    vehicleId: 'v4',
    vehicleLicensePlate: '서울 987라 6543',
    customerName: '최담당',
    customerPhone: '010-7777-8888',
    startDate: '2023-05-18T09:30:00',
    endDate: '2023-05-18T16:30:00',
    status: 'cancelled' as ReservationStatusType,
    purpose: '고객 미팅',
    notes: '취소 사유: 일정 변경',
    createdAt: '2023-05-11T16:45:00',
    history: [
      {
        id: 'h8',
        action: '예약 생성',
        newStatus: 'pending' as ReservationStatusType,
        userName: '최관리자',
        timestamp: '2023-05-11T16:45:00',
      },
      {
        id: 'h9',
        action: '예약 상태 변경',
        oldStatus: 'pending' as ReservationStatusType,
        newStatus: 'cancelled' as ReservationStatusType,
        notes: '고객 요청으로 취소 (일정 변경)',
        userName: '최관리자',
        timestamp: '2023-05-12T10:30:00',
      },
    ],
  },
  {
    id: '5',
    vehicleId: 'v1',
    vehicleLicensePlate: '서울 123가 4567',
    customerName: '정대리',
    customerPhone: '010-2222-3333',
    startDate: '2023-05-25T08:00:00',
    endDate: '2023-05-25T18:00:00',
    status: 'confirmed' as ReservationStatusType,
    purpose: '견학',
    notes: '대학생 10명 동행',
    createdAt: '2023-05-13T10:10:00',
    history: [
      {
        id: 'h10',
        action: '예약 생성',
        newStatus: 'pending' as ReservationStatusType,
        userName: '정관리자',
        timestamp: '2023-05-13T10:10:00',
      },
      {
        id: 'h11',
        action: '예약 상태 변경',
        oldStatus: 'pending' as ReservationStatusType,
        newStatus: 'confirmed' as ReservationStatusType,
        userName: '정관리자',
        timestamp: '2023-05-13T14:25:00',
      },
    ],
  },
];
