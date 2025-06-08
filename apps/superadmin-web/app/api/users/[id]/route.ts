import { NextResponse } from 'next/server';

/**
 * 사용자 API 라우트 (간소화 버전)
 */

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // 임시 모킹 데이터
    const user = {
      id,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      active: true,
    };

    return NextResponse.json({ user });
  } catch (error) {
    // 에러 로깅은 프로덕션에서 별도 로깅 시스템으로 처리
    return NextResponse.json({ error: '사용자 정보를 가져올 수 없습니다.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await request.json();

    return NextResponse.json({
      user: { id, ...data },
      message: '사용자 정보가 업데이트되었습니다.',
    });
  } catch (error) {
    // 에러 로깅은 프로덕션에서 별도 로깅 시스템으로 처리
    return NextResponse.json({ error: '사용자 정보를 업데이트할 수 없습니다.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    // 향후 ID로 사용자 삭제 기능 구현 예정
    // const { id } = params;

    return NextResponse.json({
      success: true,
      message: '사용자가 삭제되었습니다.',
    });
  } catch (error) {
    // 에러 로깅은 프로덕션에서 별도 로깅 시스템으로 처리
    return NextResponse.json({ error: '사용자를 삭제할 수 없습니다.' }, { status: 500 });
  }
}
