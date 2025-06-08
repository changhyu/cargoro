import { NextRequest, NextResponse } from 'next/server';

import { Reservation } from '../../../services/reservation-service';

// 임시 예약 데이터 (실제로는 데이터베이스 조회)
// 이 데이터는 임시로 사용하며, 실제 구현에서는 예약 데이터베이스에서 조회해야 함
import { mockReservations } from '../mock-data';

// 특정 예약 조회 API 핸들러
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 인증 처리
    // 실제 구현에서는 Clerk 등을 통한 인증 추가 필요

    const reservationId = params.id;

    // 예약 찾기
    const reservation = mockReservations.find(r => r.id === reservationId);

    // 예약이 존재하지 않는 경우
    if (!reservation) {
      return NextResponse.json({ error: '요청한 예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 응답 반환
    return NextResponse.json(reservation, { status: 200 });
  } catch (error) {
    // console.error('예약 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '예약을 조회하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 예약 정보 업데이트 API 핸들러
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 인증 처리
    // 실제 구현에서는 Clerk 등을 통한 인증 추가 필요

    const reservationId = params.id;

    // 요청 본문 파싱
    const updates: Partial<Reservation> = await request.json();

    // 예약 찾기
    const reservationIndex = mockReservations.findIndex(r => r.id === reservationId);

    // 예약이 존재하지 않는 경우
    if (reservationIndex === -1) {
      return NextResponse.json({ error: '요청한 예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 예약 정보 업데이트
    const originalReservation = mockReservations[reservationIndex];

    // 타입 캐스팅으로 배열 간 호환성 문제 해결
    const updatedReservation = {
      ...originalReservation,
      ...updates,
      updatedAt: new Date().toISOString(),
      // 빠진 필수 속성이 있다면 기본값 제공
      id: originalReservation.id,
      vehicleId: originalReservation.vehicleId,
      vehicleLicensePlate: originalReservation.vehicleLicensePlate,
      customerName: originalReservation.customerName,
      customerPhone: originalReservation.customerPhone,
      startDate: originalReservation.startDate,
      endDate: originalReservation.endDate,
      status: originalReservation.status,
      purpose: originalReservation.purpose,
      createdAt: originalReservation.createdAt,
      notes: originalReservation.notes || '',
      history: originalReservation.history ? [...originalReservation.history] : [],
    };

    // 타입 단언을 사용하여 배열 호환성 문제 해결
    mockReservations[reservationIndex] = updatedReservation as (typeof mockReservations)[0];

    // 응답 반환
    return NextResponse.json(updatedReservation, { status: 200 });
  } catch (error) {
    // console.error('예약 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '예약을 업데이트하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 예약 삭제 API 핸들러 (실제로는 소프트 삭제로 구현 예정)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 인증 처리
    // 실제 구현에서는 Clerk 등을 통한 인증 추가 필요

    const reservationId = params.id;

    // 예약 찾기
    const reservationIndex = mockReservations.findIndex(r => r.id === reservationId);

    // 예약이 존재하지 않는 경우
    if (reservationIndex === -1) {
      return NextResponse.json({ error: '요청한 예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 실제 구현에서는 소프트 삭제 또는 데이터베이스에서 삭제
    mockReservations.splice(reservationIndex, 1);

    // 응답 반환
    return NextResponse.json({ message: '예약이 성공적으로 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    // console.error('예약 삭제 중 오류 발생:', error);
    return NextResponse.json({ error: '예약을 삭제하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
