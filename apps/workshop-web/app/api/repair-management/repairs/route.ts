import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMockRepairJobs, mockJobs } from './mock-data';
import { RepairJob, RepairStatus } from '../../../features/repair-management/types';
import logger from '../../../utils/logger';

// 이 라우트를 항상 동적으로 렌더링
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 정비 작업 목록 조회
 * GET /api/repair-management/repairs
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // 인증 체크
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const searchParams = _request.nextUrl.searchParams;

    // 쿼리 파라미터 파싱
    const status = searchParams.get('status') as RepairStatus | null;
    const searchQuery = searchParams.get('searchQuery');

    // 모의 데이터 필터링 - exactOptionalPropertyTypes에 맞춰 수정
    const filterOptions: { status?: RepairStatus; searchQuery?: string } = {};
    if (status) filterOptions.status = status;
    if (searchQuery) filterOptions.searchQuery = searchQuery;

    const result = getMockRepairJobs(filterOptions);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.error('정비 작업 목록 조회 실패:', error);
    return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * 새 정비 작업 생성
 * POST /api/repair-management/repairs
 */
export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    // 인증 체크
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await _request.json();

    // 필수 필드 검증
    if (!body.vehicleInfo || !body.customerInfo || !body.description) {
      return NextResponse.json(
        { message: '차량 정보, 고객 정보, 정비 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    // 새 정비 작업 ID 생성
    const newId = `repair-${Date.now()}`;

    // 새 정비 작업 객체 생성
    const now = new Date().toISOString();
    const newJob: RepairJob = {
      id: newId,
      vehicleInfo: body.vehicleInfo,
      customerInfo: body.customerInfo,
      description: body.description,
      notes: body.notes || '',
      status: body.status || 'pending',
      createdAt: now,
      updatedAt: now,
      cost: body.cost || { labor: 0, parts: 0, total: 0 },
      priority: body.priority || 'normal',
      type: body.type || 'regular',
      technicianInfo: body.technicianInfo,
      scheduledDate: body.scheduledDate,
      estimatedDuration: body.estimatedDuration,
      diagnostics: body.diagnostics || [],
      usedParts: body.usedParts || [],
    };

    // 실제로는 DB에 저장해야 하지만 모의 데이터이므로 배열에 추가
    mockJobs.unshift(newJob);

    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    logger.error('정비 작업 생성 실패:', error);
    return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
