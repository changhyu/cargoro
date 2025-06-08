import { NextRequest, NextResponse } from 'next/server';
import { ReservationStatus, ReservationStatusType } from '@cargoro/types/schema/reservation';

import { mockReservations } from '../../mock-data';

// 히스토리 타입 정의 (로컬)
interface ReservationHistory {
  id: string;
  action: string;
  oldStatus?: ReservationStatusType;
  newStatus: ReservationStatusType;
  notes?: string;
  userName: string;
  timestamp: string;
}

// 예약 상태 변경 API 핸들러
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 실제 구현에서는 인증 처리 추가
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    // }

    const reservationId = params.id;

    // 요청 본문 파싱
    const { status, notes } = await request.json();

    // 상태 유효성 검증
    const statusValues = Object.values(ReservationStatus);
    if (!status || !statusValues.includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 예약 상태입니다.' }, { status: 400 });
    }

    // 예약 찾기
    const reservationIndex = mockReservations.findIndex(r => r.id === reservationId);

    // 예약이 존재하지 않는 경우
    if (reservationIndex === -1) {
      return NextResponse.json({ error: '요청한 예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 원본 예약 및 이전 상태 저장
    const originalReservation = mockReservations[reservationIndex];
    const oldStatus = originalReservation.status;

    // 예약 상태 업데이트
    const updatedReservation = {
      ...originalReservation,
      status: status as ReservationStatusType,
      notes: notes || originalReservation.notes || '', // notes가 undefined일 경우 빈 문자열로 설정
      updatedAt: new Date().toISOString(),
    };

    // 히스토리 초기화 및 업데이트
    const history: ReservationHistory[] = originalReservation.history
      ? [...originalReservation.history]
      : [];

    // 히스토리 항목 추가
    history.push({
      id: `h${new Date().getTime()}`,
      action: '예약 상태 변경',
      oldStatus: oldStatus as ReservationStatusType,
      newStatus: status as ReservationStatusType,
      notes: notes || undefined,
      userName: '시스템 관리자', // 실제 구현에서는 로그인한 사용자 정보 사용
      timestamp: new Date().toISOString(),
    });

    updatedReservation.history = history;

    // 실제 구현에서는 데이터베이스 업데이트
    // 타입 단언을 사용하여 타입 호환성 문제 해결
    mockReservations[reservationIndex] = updatedReservation as (typeof mockReservations)[0];

    // 응답 반환
    return NextResponse.json(updatedReservation, { status: 200 });
  } catch (error) {
    // console.error('예약 상태 변경 중 오류 발생:', error);
    return NextResponse.json(
      { error: '예약 상태를 변경하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
