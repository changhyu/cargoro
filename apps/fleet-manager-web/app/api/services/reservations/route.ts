import { NextRequest, NextResponse } from 'next/server';
import { ReservationStatus, type ReservationStatusType } from '@cargoro/types/schema/reservation';

import { mockReservations } from './mock-data';

// 예약 목록 조회 API 핸들러
export async function GET(request: NextRequest) {
  try {
    // 인증 처리 (실제 구현에서는 Clerk 등을 통한 인증 추가 필요)
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    // }

    // 쿼리 파라미터 처리 (필터링 기능을 위한 준비)
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    // 간단한 필터링 구현 (확장 가능)
    let filteredReservations = [...mockReservations];

    // 상태별 필터링
    if (status) {
      filteredReservations = filteredReservations.filter(
        reservation => reservation.status === (status as ReservationStatusType)
      );
    }

    // 예약 데이터 반환
    return NextResponse.json(filteredReservations);
  } catch (error) {
    // 에러 로깅 생략
    return NextResponse.json(
      { error: '예약 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 예약 생성 API 핸들러
export async function POST(request: NextRequest) {
  try {
    // 인증 처리 (실제 구현에서는 Clerk 등을 통한 인증 추가 필요)
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    // }

    // 요청 본문 파싱
    const data = await request.json();

    // 필수 필드 검증
    if (!data.vehicleId || !data.driverId || !data.scheduledTime) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    // 새 예약 생성 (실제 구현에서는 데이터베이스에 저장)
    const newReservation = {
      id: `res-${Date.now()}`,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      scheduledTime: data.scheduledTime,
      status: ReservationStatus.PENDING,
      createdAt: new Date().toISOString(),
      notes: data.notes || '',
    };

    // 응답 반환
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    // 에러 로깅 생략
    return NextResponse.json({ error: '예약을 생성하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
