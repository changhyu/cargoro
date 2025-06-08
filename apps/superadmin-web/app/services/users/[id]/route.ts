import { NextResponse } from 'next/server';

/**
 * 사용자 서비스 API 라우트 (간소화 버전)
 */

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;

    // 임시 모킹 데이터
    const user = {
      id: userId,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      active: true,
    };

    return NextResponse.json({ user });
  } catch (_error) {
    return NextResponse.json({ error: '사용자 정보를 가져올 수 없습니다.' }, { status: 500 });
  }
}

export async function PUT(_request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;

    return NextResponse.json({
      id: userId,
      email: 'updated@example.com',
      firstName: 'Updated',
      lastName: 'User',
      active: true,
    });
  } catch (_error) {
    return NextResponse.json({ error: '사용자 정보를 업데이트할 수 없습니다.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, _params: { params: { id: string } }) {
  try {
    return NextResponse.json({
      message: '사용자가 삭제되었습니다.',
    });
  } catch (_error) {
    return NextResponse.json({ error: '사용자를 삭제할 수 없습니다.' }, { status: 500 });
  }
}
