import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import logger from '../../../../../utils/logger';

const API_BASE_URL = process.env.REPAIR_API_URL || 'http://localhost:8080/api/repair';

/**
 * 정비 작업 상태 변경 이력 조회
 * GET /api/repair-management/repairs/{id}/status-history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // params 매개변수 사용
    const { id } = params;

    // 백엔드 API 호출
    const response = await axios.get(`${API_BASE_URL}/repairs/${id}/status-history`, {
      headers: {
        Authorization: request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    logger.error('상태 변경 이력 조회 실패:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          message: error.response?.data?.message || '상태 변경 이력 조회 중 오류가 발생했습니다.',
          error: error.response?.data || error.message,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * 정비 작업 상태 이력 추가
 * POST /api/repair-management/repairs/{id}/status-history
 *
 * body: {
 *   status: RepairStatus;
 *   note?: string;
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params; // params 사용
    const body = await request.json();

    // 필수 필드 검증
    if (!body.status) {
      return NextResponse.json({ message: '상태 값은 필수입니다.' }, { status: 400 });
    }

    // 모의 응답 데이터 생성 (실제로는 백엔드 API 호출)
    const historyEntry = {
      id: `status-${Date.now()}`,
      repairId: id, // params의 id 사용
      status: body.status,
      timestamp: new Date().toISOString(),
      note: body.note || '',
      technicianName: '시스템', // 실제로는 로그인한 사용자 정보 사용
    };

    return NextResponse.json(historyEntry, { status: 201 });
  } catch (error) {
    logger.error('상태 이력 추가 실패:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          message: error.response?.data?.message || '상태 이력 추가 중 오류가 발생했습니다.',
          error: error.response?.data || error.message,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
