import { NextResponse } from 'next/server';

/**
 * 사용자 목록 API 라우트 (간소화 버전)
 */

export async function GET() {
  try {
    // 임시 모킹 데이터
    const users = [
      {
        id: 'user-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        active: true,
      },
      {
        id: 'user-2',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        active: true,
      },
    ];

    return NextResponse.json({ users });
  } catch (_error) {
    return NextResponse.json({ error: '사용자 목록을 가져올 수 없습니다.' }, { status: 500 });
  }
}

export async function POST(_request: Request) {
  try {
    return NextResponse.json(
      {
        success: true,
        message: '사용자가 생성되었습니다.',
        user: {
          id: 'new-user-id',
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
          active: true,
        },
      },
      { status: 201 }
    );
  } catch (_error) {
    return NextResponse.json({ error: '사용자를 생성할 수 없습니다.' }, { status: 500 });
  }
}
