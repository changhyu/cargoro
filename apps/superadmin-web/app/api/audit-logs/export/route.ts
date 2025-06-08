import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    // 향후 날짜 필터링을 위해 주석처리
    // const startDate = searchParams.get('startDate');
    // const endDate = searchParams.get('endDate');

    // 모의 데이터 (실제로는 데이터베이스에서 가져와야 함)
    const logs = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        userId: 'user_123',
        userEmail: 'admin@example.com',
        action: '사용자 생성',
        resource: 'users',
        details: '새 사용자 계정이 생성되었습니다',
        ipAddress: '192.168.1.1',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: 'user_456',
        userEmail: 'user@example.com',
        action: '로그인',
        resource: 'auth',
        details: '사용자가 시스템에 로그인했습니다',
        ipAddress: '192.168.1.2',
      },
    ];

    if (format === 'csv') {
      const csvHeader = 'ID,시간,사용자ID,이메일,액션,리소스,세부사항,IP주소\n';
      const csvContent = logs
        .map(
          log =>
            `${log.id},"${log.timestamp}","${log.userId}","${log.userEmail}","${log.action}","${log.resource}","${log.details}","${log.ipAddress}"`
        )
        .join('\n');

      const csv = csvHeader + csvContent;

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'json') {
      return new NextResponse(JSON.stringify(logs, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    return NextResponse.json({ error: '지원하지 않는 형식입니다' }, { status: 400 });
  } catch (error) {
    // 에러 로깅은 프로덕션에서 별도 로깅 시스템으로 처리
    return NextResponse.json({ error: '감사 로그를 내보낼 수 없습니다' }, { status: 500 });
  }
}
