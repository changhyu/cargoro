import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// 임시 방편으로 모의 구현 사용
import { generateReportAsync } from '@/lib/report-generator-mock';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { GenerateReportRequest } from '@/lib/report-types-mock';

export async function POST(req: NextRequest) {
  try {
    const user = await auth();
    const userId = user?.userId;
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { templateId, parameters, format } = await req.json();

    // 요청 데이터 검증
    if (!templateId) {
      return NextResponse.json({ error: '템플릿 ID가 필요합니다' }, { status: 400 });
    }

    // 보고서 작업 생성
    const reportJob = await prisma.reportJob.create({
      data: {
        templateId,
        userId,
        parameters: JSON.stringify(parameters || {}),
        format: format || 'pdf',
        status: 'queued',
      },
    });

    // 비동기 보고서 생성 시작
    generateReportAsync(
      {
        templateId,
        parameters,
        format,
        async: true,
      } as GenerateReportRequest,
      async (progress: number) => {
        // 진행률 업데이트
        await prisma.reportJob.update({
          where: { id: reportJob.id },
          data: { progress, status: 'processing' },
        });
      },
      async (filePath: string) => {
        // 완료 처리
        await prisma.reportJob.update({
          where: { id: reportJob.id },
          data: {
            status: 'completed',
            progress: 100,
            outputUrl: `/reports/${path.basename(filePath)}`,
            completedAt: new Date(),
          },
        });
      },
      async (error: Error) => {
        // 에러 처리
        await prisma.reportJob.update({
          where: { id: reportJob.id },
          data: {
            status: 'failed',
            error: error.message,
            completedAt: new Date(),
          },
        });
      }
    );

    return NextResponse.json({ jobId: reportJob.id });
  } catch (error) {
    // 에러 로깅 필요 시 로깅 서비스 사용
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '보고서 생성 요청 실패' },
      { status: 500 }
    );
  }
}

// 보고서 다운로드 API
export async function GET(req: NextRequest) {
  try {
    const user = await auth();
    const userId = user?.userId;
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const url = new URL(req.url);
    const reportId = url.searchParams.get('id');

    if (!reportId) {
      return NextResponse.json({ error: '보고서 ID가 필요합니다' }, { status: 400 });
    }

    // 보고서 정보 조회
    const report = await prisma.reportJob.findUnique({
      where: { id: reportId, userId },
    });

    if (!report) {
      return NextResponse.json({ error: '보고서를 찾을 수 없습니다' }, { status: 404 });
    }

    // 다운로드 횟수 증가
    await prisma.reportJob.update({
      where: { id: reportId },
      data: { downloadCount: { increment: 1 } },
    });

    // 리다이렉트 - 파일 다운로드
    if (report.outputUrl) {
      return NextResponse.redirect(new URL(report.outputUrl, req.nextUrl.origin));
    } else {
      return NextResponse.json({ error: '보고서 파일을 찾을 수 없습니다' }, { status: 404 });
    }
  } catch (error) {
    // 에러 로깅 필요 시 로깅 서비스 사용
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '보고서 다운로드 실패' },
      { status: 500 }
    );
  }
}
