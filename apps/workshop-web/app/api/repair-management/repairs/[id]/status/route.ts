import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import logger from '../../../../../utils/logger';

const API_BASE_URL = process.env.REPAIR_API_URL || 'http://localhost:8080/api/repair';

/**
 * 정비 작업 상태 변경
 * POST /api/repair-management/repairs/{id}/status
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
    const body = await request.json();

    // 필수 필드 검증
    if (!body.status) {
      return NextResponse.json({ message: '상태 값은 필수입니다.' }, { status: 400 });
    }

    // 백엔드 API 호출
    const response = await axios.post(
      `${API_BASE_URL}/repairs/${params.id}/status`,
      {
        status: body.status,
        note: body.note || '',
      },
      {
        headers: {
          Authorization: request.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    logger.error('상태 변경 실패:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          message: error.response?.data?.message || '상태 변경 중 오류가 발생했습니다.',
          error: error.response?.data || error.message,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
