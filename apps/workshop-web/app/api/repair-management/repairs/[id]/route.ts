import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMockRepairJobById, mockJobs } from '../mock-data';
import logger from '../../../../utils/logger';

// 이 라우트를 항상 동적으로 렌더링
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 정비 작업 상세 조회
 * GET /api/repair-management/repairs/{id}
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // 인증 체크
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const job = getMockRepairJobById(params.id);

    if (!job) {
      return NextResponse.json({ message: '해당 정비 작업을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    logger.error('정비 작업 상세 조회 실패:', error);
    return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * 정비 작업 업데이트
 * PUT /api/repair-management/repairs/{id}
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const jobId = params.id;
    const jobIndex = mockJobs.findIndex(job => job.id === jobId);

    if (jobIndex === -1) {
      return NextResponse.json({ message: '해당 정비 작업을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = await request.json();
    const updatedJob = { ...mockJobs[jobIndex], ...body, updatedAt: new Date().toISOString() };

    // 실제로는 DB를 업데이트해야 하지만 모의 데이터이므로 배열만 변경
    mockJobs[jobIndex] = updatedJob;

    return NextResponse.json(updatedJob, { status: 200 });
  } catch (error) {
    logger.error('정비 작업 업데이트 실패:', error);
    return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * 정비 작업 부분 업데이트 (상태 변경 등)
 * PATCH /api/repair-management/repairs/{id}
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const jobId = params.id;
    const jobIndex = mockJobs.findIndex(job => job.id === jobId);

    if (jobIndex === -1) {
      return NextResponse.json({ message: '해당 정비 작업을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = await request.json();
    const currentJob = mockJobs[jobIndex];

    // TypeScript를 위한 추가 안전 검사
    if (!currentJob) {
      return NextResponse.json({ message: '해당 정비 작업을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 상태 변경 시 추가 로직
    if (body.status && body.status !== currentJob.status) {
      // 완료 상태로 변경 시 완료 일자 추가
      if (body.status === 'completed' && currentJob.status !== 'completed') {
        body.completedDate = new Date().toISOString();
      }
    }

    const updatedJob = {
      ...currentJob,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // 실제로는 DB를 업데이트해야 하지만 모의 데이터이므로 배열만 변경
    mockJobs[jobIndex] = updatedJob;

    return NextResponse.json(updatedJob, { status: 200 });
  } catch (error) {
    logger.error('정비 작업 부분 업데이트 실패:', error);
    return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * 정비 작업 삭제
 * DELETE /api/repair-management/repairs/{id}
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const jobId = params.id;
    const jobIndex = mockJobs.findIndex(job => job.id === jobId);

    if (jobIndex === -1) {
      return NextResponse.json({ message: '해당 정비 작업을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 실제로는 DB에서 삭제해야 하지만 모의 데이터이므로 배열에서 제거
    mockJobs.splice(jobIndex, 1);

    return NextResponse.json({ message: '정비 작업이 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    logger.error('정비 작업 삭제 실패:', error);
    return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
