'use server';
import { NextRequest, NextResponse } from 'next/server';
import { ReservationStatus } from '@cargoro/types/schema/reservation';

import { mockReservations } from './mock-data';

// 예약 목록 조회 API 핸들러
export async function GET(request: NextRequest): Promise<NextResponse> {
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
    if (status) {
      filteredReservations = mockReservations.filter(reservation => reservation.status === status);
    }

    // 응답 반환
    return NextResponse.json(filteredReservations, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('예약 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '예약 목록을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 새 예약 생성 API 핸들러
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 인증 처리 (실제 구현에서는 Clerk 등을 통한 인증 추가 필요)
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    // }

    // 요청 본문 파싱
    const body = await request.json();

    // 필수 필드 검증
    const requiredFields = [
      'vehicleId',
      'vehicleLicensePlate',
      'customerName',
      'customerPhone',
      'startDate',
      'endDate',
      'purpose',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `필수 필드 ${field}가 누락되었습니다.` },
          { status: 400 }
        );
      }
    }

    // 새 예약 생성
    const newReservation = {
      id: `${mockReservations.length + 1}`, // 임시 ID 생성 방식
      ...body,
      status: body.status || ReservationStatus.PENDING, // 기본 상태 설정
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 실제 구현에서는 데이터베이스에 저장
    mockReservations.unshift(newReservation);

    // 응답 반환
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('예약 생성 중 오류 발생:', error);
    return NextResponse.json({ error: '예약을 생성하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
