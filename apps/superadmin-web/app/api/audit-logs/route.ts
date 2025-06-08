import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// 시스템 감사 로그 타입 정의
interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
}

// 모의 감사 로그 데이터
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    userId: 'user_123',
    userEmail: 'admin@example.com',
    action: '사용자 생성',
    resource: 'users',
    details: '새 사용자 계정이 생성되었습니다',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
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
    userAgent: 'Mozilla/5.0...',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filteredLogs = [...mockAuditLogs];

    // 액션 필터링
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action.includes(action));
    }

    // 날짜 필터링
    if (startDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(endDate));
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    return NextResponse.json({
      logs: paginatedLogs,
      total: filteredLogs.length,
      page,
      limit,
      totalPages: Math.ceil(filteredLogs.length / limit),
    });
  } catch (error) {
    // 에러 로깅은 프로덕션에서 별도 로깅 시스템으로 처리
    return NextResponse.json({ error: '감사 로그를 가져올 수 없습니다' }, { status: 500 });
  }
}
